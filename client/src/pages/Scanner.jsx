import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useDispatch } from 'react-redux';
import axios from 'axios';

function Scanner() {
  const [scanning, setScanning] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      setError('Unable to access camera. Please make sure you have granted camera permissions.');
      setScanning(false);
    }
  };

  const tick = () => {
    if (!scanning) return;

    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        handleQRCode(code.data);
        return;
      }
    }
    requestAnimationFrame(tick);
  };

  const handleQRCode = async (qrData) => {
    setScanning(false);
    setLoading(true);
    try {
      const response = await axios.get(`/api/reservations/qr/${qrData}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReservation(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch reservation details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = async (action) => {
    if (!reservation) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/reservations/${reservation.id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReservation(response.data);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} reservation`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setReservation(null);
    setError(null);
    startCamera();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">QR Code Scanner</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {scanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg shadow-inner"
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-indigo-500 rounded-lg"></div>
              </div>
            </div>
          ) : reservation ? (
            <div className="space-y-6">
              <div className="bg-gray-50 px-4 py-5 sm:p-6 rounded-lg">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{reservation.customerName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{reservation.customerEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {reservation.vehicleMake} {reservation.vehicleModel} ({reservation.vehicleColor})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Parking Lot</dt>
                    <dd className="mt-1 text-sm text-gray-900">{reservation.parkingLot}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reservation.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reservation.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex space-x-4">
                {reservation.status === 'pending' && (
                  <button
                    onClick={() => handleCheckInOut('check-in')}
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Check In
                  </button>
                )}
                {reservation.status === 'checked_in' && (
                  <button
                    onClick={() => handleCheckInOut('check-out')}
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Check Out
                  </button>
                )}
                <button
                  onClick={resetScanner}
                  disabled={loading}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Scan Another
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No QR Code Found</h3>
              <p className="mt-1 text-sm text-gray-500">Please try scanning again.</p>
              <div className="mt-6">
                <button
                  onClick={resetScanner}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Scanner;

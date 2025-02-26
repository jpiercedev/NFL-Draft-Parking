import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { format } from 'date-fns';

function Scanner() {
  const [scanning, setScanning] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
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

  const handleCheckInOut = async (type) => {
    if (!reservation) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/reservations/${reservation.id}/log`,
        { type, notes },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReservation(response.data);
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.error || `Failed to log ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setReservation(null);
    setError(null);
    setNotes('');
    startCamera();
  };

  // Sort check-in logs by timestamp in descending order (most recent first)
  const sortedLogs = reservation?.checkInLogs ? 
    [...reservation.checkInLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) :
    [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={resetScanner}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {scanning ? (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-screen object-cover"
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-4 border-white rounded-lg"></div>
          </div>
        </div>
      ) : reservation ? (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reservation Details</h2>
              <button
                onClick={resetScanner}
                className="text-gray-600 hover:text-gray-800"
              >
                Scan Another
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <div className="mt-1 text-sm text-gray-900">{reservation.customerName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <div className="mt-1 text-sm text-gray-900">{reservation.customerEmail}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Make & Model</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {`${reservation.vehicleMake} ${reservation.vehicleModel}`}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Color</label>
                    <div className="mt-1 text-sm text-gray-900">{reservation.vehicleColor}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Check-in/out</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Add any notes about this check-in/out..."
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleCheckInOut('check_in')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Check In
                  </button>
                  <button
                    onClick={() => handleCheckInOut('check_out')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Check Out
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Check-in History</h3>
              <div className="space-y-4">
                {sortedLogs.length > 0 ? (
                  sortedLogs.map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${log.type === 'check_in' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {log.type === 'check_in' ? 'Check In' : 'Check Out'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy h:mm a')}
                        </span>
                      </div>
                      {log.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                          {log.notes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No check-in history available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Scanner;

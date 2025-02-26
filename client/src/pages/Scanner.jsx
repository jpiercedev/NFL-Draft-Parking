import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { format } from 'date-fns';

function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const dispatch = useDispatch();

  const requestCameraPermission = async () => {
    try {
      const result = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setPermissionState('granted');
      return result;
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
      }
      throw err;
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setScanning(true);

      // Request camera permission
      const stream = await requestCameraPermission();
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      setError(err.message);
      setScanning(false);
      console.error('Scanner error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const toggleFlashlight = async () => {
    if (!streamRef.current) return;
    
    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities().torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn }]
        });
        setFlashlightOn(!flashlightOn);
      }
    } catch (err) {
      console.error('Flashlight not available', err);
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#EDF0F4] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="mb-4 text-red-600">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#040510] mb-2">Camera Access Required</h2>
          <p className="text-[#4C4E61] mb-6">
            {permissionState === 'denied' 
              ? "Camera access was denied. Please enable camera access in your browser settings to use the QR scanner."
              : "Unable to access camera. Please make sure you have granted camera permissions."}
          </p>
          {permissionState === 'denied' ? (
            <div className="space-y-4">
              <p className="text-sm text-[#4C4E61]">
                To enable camera access:
                <br />
                1. Click the camera icon in your browser's address bar
                <br />
                2. Select "Allow" for camera access
                <br />
                3. Refresh this page
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0449FE] hover:bg-[#033ACC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0449FE]"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <button
              onClick={resetScanner}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0449FE] hover:bg-[#033ACC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0449FE]"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDF0F4]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0449FE]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF0F4]">
      {scanning ? (
        <div className="relative h-screen">
          <div className="absolute top-0 left-0 right-0 z-10 px-4 py-6 bg-gradient-to-b from-black/50 to-transparent">
            <h1 className="text-2xl font-semibold text-white">QR Scanner</h1>
            <p className="mt-1 text-sm text-white/80">
              Scan QR codes to check in or out vehicles
            </p>
          </div>
          <video
            ref={videoRef}
            className="w-full h-screen object-cover"
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-4 border-white rounded-lg flex items-center justify-center">
              <div className="w-3/4 h-3/4 border border-white border-opacity-50 rounded"></div>
            </div>
            
            <p className="text-white text-lg font-medium mt-8 mb-4 px-8 text-center">
              Scan the QR code on the parking sign
            </p>
          </div>
          
          <div className="absolute bottom-8 inset-x-0 flex justify-center space-x-4">
            <button 
              onClick={toggleFlashlight}
              className={`p-4 rounded-full shadow-lg transition-colors duration-150 ${
                flashlightOn 
                  ? 'bg-[#0449FE] hover:bg-[#033ACC]' 
                  : 'bg-white hover:bg-[#EDF0F4]'
              }`}
              aria-label="Toggle flashlight"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${flashlightOn ? 'text-white' : 'text-[#0449FE]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            
            <button 
              onClick={resetScanner}
              className="p-4 bg-white hover:bg-[#EDF0F4] rounded-full shadow-lg transition-colors duration-150"
              aria-label="Cancel scanning"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#E53935]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : reservation ? (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-[#A8B0C0] border-opacity-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#040510]">Reservation Details</h2>
              <button
                onClick={resetScanner}
                className="inline-flex items-center px-3 py-2 border border-[#0449FE] text-[#0449FE] font-medium rounded-md hover:bg-[#0449FE] hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0449FE] focus:ring-offset-2"
              >
                Scan Another
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-medium text-[#040510] mb-4">Customer Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4C4E61]">Name</label>
                    <div className="mt-1 text-[#040510]">{reservation.customerName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4C4E61]">Email</label>
                    <div className="mt-1 text-[#040510]">{reservation.customerEmail}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#040510] mb-4">Vehicle Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4C4E61]">Make & Model</label>
                    <div className="mt-1 text-[#040510]">
                      {`${reservation.vehicleMake} ${reservation.vehicleModel}`}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4C4E61]">Color</label>
                    <div className="mt-1 text-[#040510]">{reservation.vehicleColor}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-[#040510] mb-4">Check-in/out</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4C4E61] mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="shadow-sm focus:ring-[#0449FE] focus:border-[#0449FE] block w-full border-[#A8B0C0] rounded-md p-3 text-[#040510] placeholder-[#A8B0C0]"
                    rows="3"
                    placeholder="Add any notes about this check-in/out..."
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleCheckInOut('check_in')}
                    className="flex-1 bg-[#28a745] text-white px-4 py-3 rounded-md hover:bg-[#218838] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#28a745] focus:ring-offset-2 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Check In'}
                  </button>
                  <button
                    onClick={() => handleCheckInOut('check_out')}
                    className="flex-1 bg-[#0449FE] text-white px-4 py-3 rounded-md hover:bg-[#033ACC] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0449FE] focus:ring-offset-2 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Check Out'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[#040510] mb-4">Check-in History</h3>
              <div className="space-y-4">
                {sortedLogs.length > 0 ? (
                  <ul className="space-y-4 list-none">
                    {sortedLogs.map((log) => (
                      <li key={log.id} className="bg-[#EDF0F4] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            log.type === 'check_in'
                              ? 'bg-[#28a745] bg-opacity-10 text-[#28a745]'
                              : 'bg-[#0449FE] bg-opacity-10 text-[#0449FE]'
                          }`}>
                            {log.type === 'check_in' ? 'Check In' : 'Check Out'}
                          </span>
                          <span className="text-sm text-[#4C4E61]">
                            {format(new Date(log.timestamp), 'MMM dd, yyyy h:mm a')}
                          </span>
                        </div>
                        {log.notes && (
                          <div className="text-sm text-[#4C4E61] mt-2">
                            {log.notes}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-[#4C4E61] p-4 bg-[#EDF0F4] rounded-lg">No check-in history available</div>
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

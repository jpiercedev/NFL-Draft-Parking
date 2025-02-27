import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { Html5Qrcode } from 'html5-qrcode';
import './Scanner.css';

function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [showPermissionRequest, setShowPermissionRequest] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [reservation, setReservation] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);
  const [isCheckIn, setIsCheckIn] = useState(true);
  const dispatch = useDispatch();
  const scannerRef = useRef(null);

  const addDebug = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const debugMessage = `[${timestamp}] ${message}`;
    console.log(debugMessage);
    setDebugInfo(prev => `${debugMessage}\n${prev}`);
  };

  const startCamera = async () => {
    try {
      setShowPermissionRequest(false);
      setError(null);
      setScanning(true); // Set scanning to true first so the element renders
      
      // Add a small delay to ensure the DOM element is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const qrElement = document.getElementById('qr-reader');
      if (!qrElement) {
        throw new Error('QR scanner element not found');
      }

      addDebug('Initializing QR scanner...');
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: ['qr_code']
      };

      addDebug('Starting camera...');
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleQRCode(decodedText);
        },
        (errorMessage) => {
          // Only log errors that aren't related to normal QR code scanning
          if (!errorMessage.includes('QR code parse error') && 
              !errorMessage.includes('No QR code found')) {
            addDebug(`Scanning error: ${errorMessage}`);
          }
        }
      );

      addDebug('Camera started successfully');
    } catch (err) {
      console.error('Start camera error:', err);
      setError(err.message || 'Failed to start camera');
      setScanning(false);
      setShowPermissionRequest(true);
      addDebug(`Error: ${err.message}`);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        addDebug('Stopping camera...');
        await scannerRef.current.stop();
        scannerRef.current = null;
        addDebug('Camera stopped');
      } catch (err) {
        console.error('Error stopping camera:', err);
        addDebug(`Error stopping camera: ${err.message}`);
      }
    }
    setScanning(false);
    setShowPermissionRequest(true);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraSupport = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API is not supported in this browser');
    }

    try {
      // Check if we can enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('No camera devices found');
      }

      // Check if we already have permission
      const permission = await navigator.permissions.query({ name: 'camera' });
      setPermissionState(permission.state);
      
      return cameras;
    } catch (err) {
      console.error('Camera support check error:', err);
      throw new Error('Failed to check camera support: ' + err.message);
    }
  };

  const requestCameraPermission = async () => {
    try {
      setShowPermissionRequest(false);
      setError(null);

      // First check if camera is supported
      await checkCameraSupport();

      // Try to get the camera stream
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if we actually got a valid stream
      const tracks = stream.getVideoTracks();
      if (!tracks || tracks.length === 0) {
        throw new Error('No video track available in the camera stream');
      }

      console.log('Camera stream obtained:', tracks[0].getSettings());
      setPermissionState('granted');
      return stream;
    } catch (err) {
      console.error('Camera permission error:', {
        name: err.name,
        message: err.message,
        constraint: err.constraint,
        stack: err.stack
      });

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        throw new Error('Camera permission was denied. Please grant camera access to use the scanner.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No camera found on your device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error('Your camera is in use by another application.');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        throw new Error('Could not find a suitable camera. Please try using a different camera.');
      }
      
      throw new Error(`Camera error: ${err.message}`);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowPermissionRequest(true);
    setPermissionState('prompt');
    if (scannerRef.current) {
      stopCamera();
    }
  };

  const toggleFlashlight = async () => {
    if (!scannerRef.current) return;
    
    try {
      const track = scannerRef.current.getVideoTracks()[0];
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
    if (!scanning) {
      console.log('Scanning stopped, tick cancelled');
      return;
    }

    if (scannerRef.current && scannerRef.current.readyState === scannerRef.current.HAVE_ENOUGH_DATA) {
      console.log('Processing video frame');
      const canvas = canvasRef.current;
      const video = scannerRef.current;
      
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('QR code found:', code);
        handleQRCode(code.data);
        return;
      }
    } else if (scannerRef.current) {
      console.log('Video not ready:', scannerRef.current.readyState);
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
          
          <div id="qr-reader" className="w-full h-screen">
            <div className="scanner-overlay" />
            <div className="scanner-frame" />
          </div>
          
          <div className="absolute bottom-8 inset-x-0 flex justify-center">
            <button 
              onClick={stopCamera}
              className="p-4 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-colors duration-150"
              aria-label="Cancel scanning"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : showPermissionRequest ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
            <div className="mb-4 text-[#0449FE]">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#040510] mb-2">Camera Access Required</h2>
            <p className="text-[#4C4E61] mb-6">
              To scan QR codes, we need access to your camera. Click below to enable camera access.
            </p>
            <button
              onClick={startCamera}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0449FE] hover:bg-[#033ACC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0449FE]"
            >
              Enable Camera
            </button>
            {error && (
              <div className="mt-4 text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {debugInfo && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm font-mono">
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
}

export default Scanner;

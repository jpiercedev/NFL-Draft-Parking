import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { Html5Qrcode } from 'html5-qrcode';
import './Scanner.css';

function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [showPermissionRequest, setShowPermissionRequest] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setShowPermissionRequest(false);
      setError(null);
      setScanning(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const qrElement = document.getElementById('qr-reader');
      if (!qrElement) {
        throw new Error('QR scanner element not found');
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: ['qr_code']
      };

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
            console.error('Scanning error:', errorMessage);
          }
        }
      );
    } catch (err) {
      console.error('Start camera error:', err);
      setError(err.message || 'Failed to start camera');
      setScanning(false);
      setShowPermissionRequest(true);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScanning(false);
    setShowPermissionRequest(true);
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
    </div>
  );
}

export default Scanner;

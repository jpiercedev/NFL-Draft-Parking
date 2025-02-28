import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectReservationById, setReservation, updateReservation } from '../features/reservations/reservationsSlice';
import axios from 'axios';
import './Scanner.css';

function Scanner() {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const reservation = useSelector(state => selectReservationById(state, id));

  const sortedLogs = reservation?.checkInLogs ? 
    [...reservation.checkInLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) :
    [];

  useEffect(() => {
    startCamera();
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(err => {
            // Silently handle stop errors during cleanup
            console.log("Cleanup error:", err);
          });
        } catch (err) {
          // Silently handle any errors during cleanup
          console.log("Cleanup error:", err);
        }
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      // Clean up any existing scanner instance
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          console.log("Cleanup during start:", err);
        }
      }

      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      console.log('Available cameras:', cameras);

      if (cameras.length === 0) {
        throw new Error('No cameras found');
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Start with basic configuration
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 300, height: 300 }, // Just made the scanning area a bit larger
          aspectRatio: 1.0
        },
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          handleQRCode(decodedText);
        },
        (errorMessage) => {
          // Only log non-QR scanning errors
          if (!errorMessage.includes('No QR code found')) {
            console.log("Scanning error:", errorMessage);
          }
        }
      );

      console.log("Camera started successfully");
    } catch (err) {
      console.error('Error starting camera:', err);
      setError(`Camera error: ${err.message}`);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.log("Error stopping camera:", err);
        // Still set scanning to false even if stop fails
        setScanning(false);
      }
    }
  };

  const handleQRCode = async (qrData) => {
    try {
      console.log("Processing QR code:", qrData); // Debug log
      await stopCamera();
      const response = await axios.get(`/api/reservations/${qrData}`);
      console.log("Reservation data:", response.data); // Debug log
      dispatch(setReservation(response.data));
    } catch (err) {
      console.error('Error fetching reservation:', err);
      setError('Invalid QR code or reservation not found');
      startCamera();
    }
  };

  const handleCheckInOut = async (type) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/reservations/${reservation.id}/${type}`, {
        notes: notes
      });
      dispatch(updateReservation(response.data));
      setNotes('');
    } catch (err) {
      console.error(`Error during ${type}:`, err);
      setError(`Failed to ${type.replace('_', ' ')}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    dispatch(setReservation(null));
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
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={resetScanner}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Scanner;

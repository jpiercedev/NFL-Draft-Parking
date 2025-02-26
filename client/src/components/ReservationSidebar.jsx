import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';

function ReservationSidebar({ reservation, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentReservation, setCurrentReservation] = useState(reservation);
  const [formData, setFormData] = useState({
    customerName: reservation?.customerName || '',
    customerEmail: reservation?.customerEmail || '',
    vehicleMake: reservation?.vehicleMake || '',
    vehicleModel: reservation?.vehicleModel || '',
    vehicleColor: reservation?.vehicleColor || '',
    parkingLot: reservation?.parkingLot || '',
    reservationDate: reservation?.reservationDate ? format(new Date(reservation.reservationDate), 'yyyy-MM-dd') : ''
  });

  useEffect(() => {
    setCurrentReservation(reservation);
    setFormData({
      customerName: reservation?.customerName || '',
      customerEmail: reservation?.customerEmail || '',
      vehicleMake: reservation?.vehicleMake || '',
      vehicleModel: reservation?.vehicleModel || '',
      vehicleColor: reservation?.vehicleColor || '',
      parkingLot: reservation?.parkingLot || '',
      reservationDate: reservation?.reservationDate ? format(new Date(reservation.reservationDate), 'yyyy-MM-dd') : ''
    });
  }, [reservation]);

  if (!currentReservation) return null;

  // Sort check-in logs by timestamp in descending order (most recent first)
  const sortedLogs = currentReservation.checkInLogs ? 
    [...currentReservation.checkInLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) :
    [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `/api/reservations/${currentReservation.id}`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Update both the parent component and local state
      onUpdate(response.data);
      setCurrentReservation(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update reservation');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-[#E53935] p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-[#E53935]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-[#E53935]">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#040510]">Customer Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-[#4C4E61]">
                  Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  id="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="mt-2 block w-full border-[#A8B0C0] rounded-md shadow-sm focus:ring-[#0449FE] focus:border-[#0449FE] bg-white text-[#040510] placeholder-[#A8B0C0]"
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-[#4C4E61]">
                  Email
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  id="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="mt-2 block w-full border-[#A8B0C0] rounded-md shadow-sm focus:ring-[#0449FE] focus:border-[#0449FE] bg-white text-[#040510] placeholder-[#A8B0C0]"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#040510]">Vehicle Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="vehicleMake" className="block text-sm font-medium text-[#4C4E61]">
                    Make
                  </label>
                  <input
                    type="text"
                    name="vehicleMake"
                    id="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={handleInputChange}
                    className="mt-2 block w-full border-[#A8B0C0] rounded-md shadow-sm focus:ring-[#0449FE] focus:border-[#0449FE] bg-white text-[#040510] placeholder-[#A8B0C0]"
                  />
                </div>
                <div>
                  <label htmlFor="vehicleModel" className="block text-sm font-medium text-[#4C4E61]">
                    Model
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    id="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    className="mt-2 block w-full border-[#A8B0C0] rounded-md shadow-sm focus:ring-[#0449FE] focus:border-[#0449FE] bg-white text-[#040510] placeholder-[#A8B0C0]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="vehicleColor" className="block text-sm font-medium text-[#4C4E61]">
                  Color
                </label>
                <input
                  type="text"
                  name="vehicleColor"
                  id="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={handleInputChange}
                  className="mt-2 block w-full border-[#A8B0C0] rounded-md shadow-sm focus:ring-[#0449FE] focus:border-[#0449FE] bg-white text-[#040510] placeholder-[#A8B0C0]"
                />
              </div>
            </div>
          </div>

          {/* Parking Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#040510]">Parking Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="parkingLot" className="block text-sm font-medium text-[#4C4E61]">
                  Parking Lot
                </label>
                <select
                  name="parkingLot"
                  id="parkingLot"
                  value={formData.parkingLot}
                  onChange={handleInputChange}
                  className="mt-2 block w-full border-[#A8B0C0] rounded-md shadow-sm focus:ring-[#0449FE] focus:border-[#0449FE] bg-white text-[#040510]"
                >
                  <option value="" className="text-[#A8B0C0]">Select a parking lot</option>
                  <option value="Lombardi">Lombardi</option>
                  <option value="Military">Military</option>
                </select>
              </div>
              <div>
                <label htmlFor="reservationDate" className="block text-sm font-medium text-[#4C4E61]">
                  Reservation Date
                </label>
                <input
                  type="date"
                  name="reservationDate"
                  id="reservationDate"
                  value={formData.reservationDate}
                  onChange={handleInputChange}
                  className="mt-2 block w-full border-[#A8B0C0] rounded-md shadow-sm focus:ring-[#0449FE] focus:border-[#0449FE] bg-white text-[#040510]"
                />
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="mb-8 text-center">
            <h3 className="text-lg font-medium text-[#040510] mb-4">QR Code</h3>
            <img 
              src={currentReservation.qrCodeDataUrl} 
              alt="QR Code"
              className="mx-auto w-48 h-48 border border-[#A8B0C0] p-2 rounded-md"
            />
            <div className="mt-2 text-sm text-[#4C4E61]">
              {currentReservation.qrCode}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0449FE] text-white px-4 py-3 rounded-md hover:bg-[#033ACC] disabled:opacity-50 disabled:bg-[#A8B0C0] focus:outline-none focus:ring-2 focus:ring-[#0449FE] focus:ring-offset-2"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-[#EDF0F4] text-[#4C4E61] px-4 py-3 rounded-md hover:bg-[#DDE0E4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A8B0C0]"
            >
              Cancel
            </button>
          </div>
        </form>
      );
    }

    return (
      <>
        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#040510] mb-4">Customer Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4C4E61]">Name</label>
              <div className="mt-1 text-[#040510]">{currentReservation.customerName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4C4E61]">Email</label>
              <div className="mt-1 text-[#040510]">{currentReservation.customerEmail}</div>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#040510] mb-4">Vehicle Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4C4E61]">Make & Model</label>
              <div className="mt-1 text-[#040510]">
                {`${currentReservation.vehicleMake} ${currentReservation.vehicleModel}`}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4C4E61]">Color</label>
              <div className="mt-1 text-[#040510]">{currentReservation.vehicleColor}</div>
            </div>
          </div>
        </div>

        {/* Parking Info */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#040510] mb-4">Parking Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4C4E61]">Parking Lot</label>
              <div className="mt-1 text-[#040510]">{currentReservation.parkingLot}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4C4E61]">Reservation Date</label>
              <div className="mt-1 text-[#040510]">
                {format(new Date(currentReservation.reservationDate), 'MMMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#040510] mb-4">QR Code</h3>
          <div className="text-center">
            <img 
              src={currentReservation.qrCodeDataUrl} 
              alt="QR Code"
              className="mx-auto w-48 h-48 border border-[#A8B0C0] p-2 rounded-md"
            />
            <div className="mt-2 text-sm text-[#4C4E61]">
              {currentReservation.qrCode}
            </div>
          </div>
        </div>

        {/* Check-in Logs */}
        <div className="mb-8">
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
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}>
      <div className="relative top-0 right-0 h-full w-96 max-w-full bg-white shadow-lg float-right" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#040510]">
              {isEditing ? 'Edit Reservation' : 'Reservation Details'}
            </h2>
            <div className="flex items-center space-x-4">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#0449FE] hover:bg-[#033ACC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0449FE]"
                >
                  Edit
                </button>
              )}
              <button onClick={onClose} className="text-[#4C4E61] hover:text-[#040510] focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationSidebar;

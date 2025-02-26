import { format } from 'date-fns';

function ReservationSidebar({ reservation, onClose }) {
  if (!reservation) return null;

  // Sort check-in logs by timestamp in descending order (most recent first)
  const sortedLogs = reservation.checkInLogs ? 
    [...reservation.checkInLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) :
    [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}>
      <div className="relative top-0 right-0 h-full w-96 max-w-full bg-white shadow-xl float-right" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Reservation Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* QR Code */}
            <div className="mb-8 text-center">
              <img 
                src={reservation.qrCodeDataUrl} 
                alt="QR Code"
                className="mx-auto w-48 h-48"
              />
              <div className="mt-2 text-sm text-gray-500">
                {reservation.qrCode}
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
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

            {/* Vehicle Info */}
            <div className="mb-6">
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

            {/* Parking Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parking Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Parking Lot</label>
                  <div className="mt-1 text-sm text-gray-900">{reservation.parkingLot}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Reservation Date</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {format(new Date(reservation.reservationDate), 'MMMM dd, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in Logs */}
            <div className="mb-6">
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
                  <div className="text-sm text-gray-500 text-center py-4">
                    No check-in history available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationSidebar;

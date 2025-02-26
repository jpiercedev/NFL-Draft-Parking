import { format } from 'date-fns';

function ReservationSidebar({ reservation, onClose }) {
  if (!reservation) return null;

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
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${reservation.status === 'checked_in' ? 'bg-green-100 text-green-800' : 
                        reservation.status === 'checked_out' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {reservation.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {reservation.checkInTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Check-in Time</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {format(new Date(reservation.checkInTime), 'h:mm a')}
                    </div>
                  </div>
                )}
                {reservation.checkOutTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Check-out Time</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {format(new Date(reservation.checkOutTime), 'h:mm a')}
                    </div>
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

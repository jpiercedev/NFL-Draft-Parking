import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { format } from 'date-fns';
import ReservationSidebar from '../components/ReservationSidebar';

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [parkingLotFilter, setParkingLotFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get('/api/reservations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          search: searchTerm,
          parkingLot: parkingLotFilter,
          date: dateFilter
        }
      });
      setReservations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const getStatusDisplay = (reservation) => {
    if (!reservation.checkInLogs || reservation.checkInLogs.length === 0) {
      return {
        text: 'Pending',
        className: 'bg-yellow-100 text-yellow-800'
      };
    }

    const latestLog = reservation.checkInLogs[0];
    if (latestLog.type === 'check_in') {
      return {
        text: 'Checked In',
        className: 'bg-green-100 text-green-800'
      };
    }
    return {
      text: 'Checked Out',
      className: 'bg-blue-100 text-blue-800'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDF0F4]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0449FE]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDF0F4]">
        <div className="bg-red-50 border-l-4 border-[#E53935] p-4 rounded-md max-w-md">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF0F4]">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#040510]">Parking Reservations</h1>
              <p className="mt-1 text-sm text-[#4C4E61]">
                View and manage all parking reservations
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-[#A8B0C0] text-sm font-medium rounded-md text-[#4C4E61] bg-white hover:bg-[#EDF0F4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0449FE]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              <button
                onClick={() => setShowAddReservation(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0449FE] hover:bg-[#033ACC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0449FE]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Reservation
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Form */}
        <form onSubmit={handleSearch} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0449FE] focus:ring-[#0449FE]"
            />
            <select
              value={parkingLotFilter}
              onChange={(e) => setParkingLotFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0449FE] focus:ring-[#0449FE]"
            >
              <option value="">All Parking Lots</option>
              <option value="Lombardi">Lombardi</option>
              <option value="Military">Military</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0449FE] focus:ring-[#0449FE]"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-3 px-5 border border-transparent shadow-sm font-medium rounded-md text-white bg-[#0449FE] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0449FE]"
          >
            Search
          </button>
        </form>

        {/* Reservations Table */}
        <div className="bg-white shadow overflow-hidden rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                  Parking Lot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                  Check In/Out Times
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => {
                const status = getStatusDisplay(reservation);
                return (
                  <tr 
                    key={reservation.id}
                    onClick={() => setSelectedReservation(reservation)}
                    className="cursor-pointer hover:bg-[#EDF0F4]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-[#040510]">
                        {reservation.customerName}
                      </div>
                      <div className="text-sm text-[#4C4E61]">
                        {reservation.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[#040510]">
                        {`${reservation.vehicleMake} ${reservation.vehicleModel}`}
                      </div>
                      <div className="text-sm text-[#4C4E61]">
                        {reservation.vehicleColor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4C4E61]">
                      {reservation.parkingLot}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4C4E61]">
                      {format(new Date(reservation.reservationDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4C4E61]">
                      {reservation.checkInLogs && reservation.checkInLogs.length > 0 && (
                        <div>In: {format(new Date(reservation.checkInLogs[0].createdAt), 'HH:mm')}</div>
                      )}
                      {reservation.checkInLogs && reservation.checkInLogs.length > 1 && (
                        <div>Out: {format(new Date(reservation.checkInLogs[1].createdAt), 'HH:mm')}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservation Sidebar */}
      {selectedReservation && (
        <ReservationSidebar
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onUpdate={fetchReservations}
        />
      )}
    </div>
  );
}

export default Reservations;

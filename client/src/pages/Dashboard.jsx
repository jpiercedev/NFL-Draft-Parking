import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import ReservationSidebar from '../components/ReservationSidebar';

function Dashboard() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, recentResponse] = await Promise.all([
        axios.get('/api/reservations/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/reservations/recent', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setStats(statsResponse.data);
      setRecentReservations(recentResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (reservation) => {
    if (!reservation.checkInLogs || reservation.checkInLogs.length === 0) {
      return {
        text: 'Pending',
        className: 'bg-[#FEF3C7] text-[#92400E]'
      };
    }

    const latestLog = reservation.checkInLogs[0];
    if (latestLog.type === 'check_in') {
      return {
        text: 'Checked In',
        className: 'bg-[#28a745] bg-opacity-10 text-[#28a745]'
      };
    }
    return {
      text: 'Checked Out',
      className: 'bg-[#0449FE] bg-opacity-10 text-[#0449FE]'
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
        <div className="bg-red-50 border-l-4 border-[#E53935] p-4 rounded-md shadow-sm">
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
              <h1 className="text-2xl font-semibold text-[#040510]">Dashboard Overview</h1>
              <p className="mt-1 text-sm text-[#4C4E61]">
                Monitor your parking operations and recent activities
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-[#A8B0C0] border-opacity-20">
            <h2 className="text-lg font-medium mb-2 text-[#4C4E61]">Total Reservations</h2>
            <p className="text-3xl font-bold text-[#0449FE]">{stats.totalReservations}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-[#A8B0C0] border-opacity-20">
            <h2 className="text-lg font-medium mb-2 text-[#4C4E61]">Today's Check-ins</h2>
            <p className="text-3xl font-bold text-[#28a745]">{stats.todayCheckIns}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-[#A8B0C0] border-opacity-20">
            <h2 className="text-lg font-medium mb-2 text-[#4C4E61]">Today's Check-outs</h2>
            <p className="text-3xl font-bold text-[#6D699A]">{stats.todayCheckOuts}</p>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#A8B0C0] border-opacity-20">
          <div className="px-6 py-4 border-b border-[#A8B0C0] border-opacity-20">
            <h2 className="text-xl font-medium text-[#040510]">Recent Reservations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#A8B0C0] divide-opacity-20">
              <thead className="bg-[#EDF0F4]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4C4E61] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#A8B0C0] divide-opacity-20">
                {recentReservations.length > 0 ? (
                  recentReservations.map((reservation) => {
                    const status = getStatusDisplay(reservation);
                    return (
                      <tr 
                        key={reservation.id}
                        onClick={() => setSelectedReservation(reservation)}
                        className="cursor-pointer hover:bg-[#EDF0F4] transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-[#040510]">
                            {reservation.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[#040510]">
                            {`${reservation.vehicleMake} ${reservation.vehicleModel}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4C4E61]">
                          {format(new Date(reservation.reservationDate), 'MMM dd')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td 
                      colSpan="4" 
                      className="px-6 py-8 text-center text-sm text-[#4C4E61] bg-[#EDF0F4] bg-opacity-50"
                    >
                      No recent reservations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reservation Sidebar */}
      {selectedReservation && (
        <ReservationSidebar
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onUpdate={(updatedReservation) => {
            setRecentReservations(recentReservations.map(res => 
              res.id === updatedReservation.id ? updatedReservation : res
            ));
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;

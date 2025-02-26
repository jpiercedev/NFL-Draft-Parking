import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { logout } from '../redux/slices/authSlice';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Scanner',
      path: '/scanner',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      name: 'Reservations',
      path: '/reservations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Emails',
      path: '/emails',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#EDF0F4]">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#A8B0C0] border-opacity-20">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#0449FE]">Parking App</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#4C4E61] hover:text-[#040510] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0449FE]"
          >
            <span className="sr-only">Open menu</span>
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto pt-20">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        location.pathname === item.path
                          ? 'bg-[#0449FE] bg-opacity-10 text-[#0449FE]'
                          : 'text-[#4C4E61] hover:bg-[#EDF0F4]'
                      } group flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-150`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-4 border-t border-[#A8B0C0] border-opacity-20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-[#0449FE] bg-opacity-10 flex items-center justify-center">
                      <span className="text-[#0449FE] font-medium">
                        {(user?.name || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-[#040510]">{user?.name || 'Admin User'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto text-sm text-[#E53935] hover:text-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-[#A8B0C0] border-opacity-20">
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-[#A8B0C0] border-opacity-20">
              <h1 className="text-xl font-bold text-[#0449FE]">Parking App</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-[#0449FE] bg-opacity-10 text-[#0449FE]'
                      : 'text-[#4C4E61] hover:bg-[#EDF0F4]'
                  } group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 p-4 border-t border-[#A8B0C0] border-opacity-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#0449FE] bg-opacity-10 flex items-center justify-center">
                  <span className="text-[#0449FE] font-medium">
                    {(user?.name || 'A')[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#040510]">{user?.name || 'Admin User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto text-sm text-[#E53935] hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen pt-16 lg:pt-0">
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;

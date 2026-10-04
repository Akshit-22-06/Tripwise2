import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowNotifs(false);
    setShowProfile(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const onLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) =>
    `text-xs font-medium px-2.5 py-1.5 rounded transition-colors ${
      isActive(path)
        ? 'text-slate-900 bg-slate-100 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const mobileNavLinkClass = (path) =>
    `block text-sm font-medium px-3 py-2 rounded ${
      isActive(path)
        ? 'text-slate-900 bg-slate-100 font-semibold'
        : 'text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Brand & Desktop Links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 font-semibold tracking-tight text-base">
              <span className="w-6 h-6 bg-slate-900 text-white flex items-center justify-center rounded text-xs font-bold">
                T
              </span>
              <span>TripWise</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              <Link to="/" className={navLinkClass('/')}>
                Discover
              </Link>
              {user && user.role === 'traveler' && (
                <>
                  <Link to="/planner" className={navLinkClass('/planner')}>
                    Trip Planner
                  </Link>
                  <Link to="/budget-calculator" className={navLinkClass('/budget-calculator')}>
                    Budget
                  </Link>
                  <Link to="/flights" className={navLinkClass('/flights')}>
                    Flights
                  </Link>
                  <Link to="/trains" className={navLinkClass('/trains')}>
                    Trains
                  </Link>
                  <Link to="/hotels" className={navLinkClass('/hotels')}>
                    Hotels
                  </Link>
                </>
              )}
              {user && user.role === 'business_owner' && (
                <Link to="/merchant-dashboard" className={navLinkClass('/merchant-dashboard')}>
                  Merchant Portal
                </Link>
              )}
              {user && user.role === 'admin' && (
                <Link to="/admin-dashboard" className={navLinkClass('/admin-dashboard')}>
                  Admin Portal
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section: Auth & Notifications */}
          <div className="hidden md:flex items-center space-x-2.5">
            {user ? (
              <>
                {/* Notifications Button & Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifs(!showNotifs);
                      if (!showNotifs) markAllAsRead();
                    }}
                    className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-200 rounded shadow-md py-2 z-50 text-xs">
                      <div className="px-3.5 py-1.5 border-b border-slate-100 flex justify-between items-center text-slate-500">
                        <span className="font-semibold text-slate-800">Notifications</span>
                        <span>{notifications.length} total</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-slate-400 text-xs">
                            No notifications.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`px-3.5 py-2.5 ${
                                !notif.isRead ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <p className="text-slate-800 leading-snug">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <div className="h-5 w-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded shadow-md py-1 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-slate-400 truncate text-[11px]">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                          {user.role === 'business_owner' ? 'Business Owner' : user.role}
                        </span>
                      </div>

                      {user.role === 'traveler' && (
                        <>
                          <Link
                            to="/profile"
                            className="block px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                          >
                            Account Profile
                          </Link>
                          <Link
                            to="/profile?tab=saved"
                            className="block px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                          >
                            Saved Trips
                          </Link>
                          <Link
                            to="/profile?tab=wishlist"
                            className="block px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                          >
                            Wishlist
                          </Link>
                          <Link
                            to="/profile?tab=bookings"
                            className="block px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                          >
                            Bookings History
                          </Link>
                        </>
                      )}

                      {user.role === 'business_owner' && (
                        <Link
                          to="/merchant-dashboard"
                          className="block px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                        >
                          Merchant Dashboard
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin-dashboard"
                          className="block px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link to="/" className={mobileNavLinkClass('/')}>
            Discover
          </Link>
          {user && user.role === 'traveler' && (
            <>
              <Link to="/planner" className={mobileNavLinkClass('/planner')}>
                Trip Planner
              </Link>
              <Link to="/budget-calculator" className={mobileNavLinkClass('/budget-calculator')}>
                Budget Calculator
              </Link>
              <Link to="/flights" className={mobileNavLinkClass('/flights')}>
                Flights
              </Link>
              <Link to="/trains" className={mobileNavLinkClass('/trains')}>
                Trains
              </Link>
              <Link to="/hotels" className={mobileNavLinkClass('/hotels')}>
                Hotels
              </Link>
              <Link to="/profile" className={mobileNavLinkClass('/profile')}>
                My Profile &amp; Bookings
              </Link>
            </>
          )}
          {user && user.role === 'business_owner' && (
            <Link to="/merchant-dashboard" className={mobileNavLinkClass('/merchant-dashboard')}>
              Merchant Dashboard
            </Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin-dashboard" className={mobileNavLinkClass('/admin-dashboard')}>
              Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 px-3">
                  Signed in as <strong>{user.name}</strong>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  className="text-center text-xs font-medium py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-center text-xs font-medium py-2 bg-slate-900 hover:bg-slate-800 text-white rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

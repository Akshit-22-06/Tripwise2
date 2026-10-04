import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
              <span className="w-5 h-5 bg-slate-900 text-white flex items-center justify-center rounded text-[10px] font-bold">
                T
              </span>
              <span>TripWise</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Travel itinerary planning, verified local accommodations, and multi-modal transit coordination platform.
            </p>
          </div>

          {/* Planning links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
              Travel Services
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/" className="text-slate-600 hover:text-slate-900">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/planner" className="text-slate-600 hover:text-slate-900">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/budget-calculator" className="text-slate-600 hover:text-slate-900">
                  Budget Calculator
                </Link>
              </li>
              <li>
                <Link to="/flights" className="text-slate-600 hover:text-slate-900">
                  Flights
                </Link>
              </li>
              <li>
                <Link to="/trains" className="text-slate-600 hover:text-slate-900">
                  Trains
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="text-slate-600 hover:text-slate-900">
                  Hotels
                </Link>
              </li>
            </ul>
          </div>

          {/* Business links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
              Merchants
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/register?role=business_owner" className="text-slate-600 hover:text-slate-900">
                  Register as Business
                </Link>
              </li>
              <li>
                <Link to="/merchant-dashboard" className="text-slate-600 hover:text-slate-900">
                  Merchant Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
              Account
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-900">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-600 hover:text-slate-900">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-600 hover:text-slate-900">
                  Profile &amp; Bookings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
          <p>&copy; {new Date().getFullYear()} TripWise. All rights reserved.</p>
          <div className="flex space-x-4 text-slate-400">
            <span>Production Build</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

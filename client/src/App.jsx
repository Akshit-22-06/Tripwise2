import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { NotificationProvider } from "./context/NotificationContext";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DestinationDetails from "./pages/DestinationDetails";
import TripPlanner from "./pages/TripPlanner";
import BudgetCalculator from "./pages/BudgetCalculator";
import BookingCheckout from "./pages/BookingCheckout";
import UserProfile from "./pages/UserProfile";
import BusinessDashboard from "./pages/BusinessDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FlightSearch from "./pages/FlightSearch";
import TrainSearch from "./pages/TrainSearch";
import HotelListings from "./pages/HotelListings";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/destination/:id" element={<DestinationDetails />} />

          <Route
            path="/planner"
            element={
              <ProtectedRoute allowedRoles={["traveler"]}>
                <TripPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget-calculator"
            element={
              <ProtectedRoute allowedRoles={["traveler"]}>
                <BudgetCalculator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-checkout"
            element={
              <ProtectedRoute allowedRoles={["traveler"]}>
                <BookingCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["traveler"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flights"
            element={
              <ProtectedRoute allowedRoles={["traveler"]}>
                <FlightSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trains"
            element={
              <ProtectedRoute allowedRoles={["traveler"]}>
                <TrainSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotels"
            element={
              <ProtectedRoute allowedRoles={["traveler"]}>
                <HotelListings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/merchant-dashboard"
            element={
              <ProtectedRoute allowedRoles={["business_owner"]}>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

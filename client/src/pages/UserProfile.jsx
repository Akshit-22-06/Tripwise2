import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { plannerAPI } from "../services/api";
import DestinationCard from "../components/cards/DestinationCard";
import ServiceCard from "../components/cards/ServiceCard";
import { Trash2, User, Calendar, Heart, Clock } from "lucide-react";

const UserProfile = () => {
  const { user, wishlist } = useAuth();
  const {
    bookings,
    fetchMyBookings,
    cancelBooking,
    loading: bookingsLoading,
  } = useBooking();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [savedPlans, setSavedPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await plannerAPI.getMyPlans();
      setSavedPlans(res.data.data || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "saved") {
      fetchPlans();
    } else if (activeTab === "bookings") {
      fetchMyBookings();
    }
  }, [activeTab]);

  const handleDeletePlan = async (planId) => {
    if (
      !window.confirm("Are you sure you want to delete this saved itinerary?")
    )
      return;
    try {
      await plannerAPI.deletePlan(planId);
      await fetchPlans();
    } catch (err) {
      alert("Could not delete plan.");
    }
  };

  const handleCancelReservation = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      await cancelBooking(bookingId);
      alert("Booking cancelled successfully.");
    } catch (err) {
      alert("Could not cancel booking.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded">
            Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Profile summary */}
      <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{user?.name}</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Account Type:</span>
          <span className="px-2 py-0.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-md p-1.5 space-y-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleTabChange("profile")}
            className={`w-full text-left px-3 py-2 rounded transition flex items-center space-x-2 ${
              activeTab === "profile"
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Account Profile</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("saved")}
            className={`w-full text-left px-3 py-2 rounded transition flex items-center space-x-2 ${
              activeTab === "saved"
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Saved Itineraries</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("wishlist")}
            className={`w-full text-left px-3 py-2 rounded transition flex items-center space-x-2 ${
              activeTab === "wishlist"
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Wishlist</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("bookings")}
            className={`w-full text-left px-3 py-2 rounded transition flex items-center space-x-2 ${
              activeTab === "bookings"
                ? "bg-slate-900 text-white font-semibold"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Bookings History</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* Tab 1: Profile */}
          {activeTab === "profile" && (
            <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Personal Particulars
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-slate-400 text-[11px] mb-0.5">Full Name</span>
                  <span className="font-semibold text-slate-900">
                    {user?.name}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[11px] mb-0.5">
                    Email Address
                  </span>
                  <span className="font-semibold text-slate-900">
                    {user?.email}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[11px] mb-0.5">Phone Number</span>
                  <span className="font-semibold text-slate-900">
                    {user?.phone || "Not registered"}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[11px] mb-0.5">
                    Account Role
                  </span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Saved Itineraries */}
          {activeTab === "saved" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Saved Itineraries
              </h2>

              {plansLoading ? (
                <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-xs text-slate-500">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span>Loading itineraries...</span>
                </div>
              ) : savedPlans.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-xs text-slate-400">
                  No saved itineraries found. You can generate and save plans from the Trip Planner.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedPlans.map((plan) => (
                    <div
                      key={plan._id}
                      className="bg-white border border-slate-200 rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {plan.destinationId?.name || "Custom Trip"}
                        </h3>
                        <p className="text-slate-500 mt-0.5">
                          Duration: {plan.totalDays} Days &bull; Target Budget:{" "}
                          {plan.targetBudget?.toLocaleString()} INR
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan._id)}
                          className="p-1.5 border border-slate-300 hover:border-rose-400 hover:text-rose-600 rounded text-slate-500 transition"
                          title="Delete Plan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Wishlist */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Wishlist
                </h2>
                <p className="text-xs text-slate-500">
                  Saved destinations and merchant services.
                </p>
              </div>

              {/* Destinations */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Saved Destinations ({wishlist.destinations?.length || 0})
                </h3>
                {wishlist.destinations?.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-md p-6 text-center text-xs text-slate-400">
                    No destinations in your wishlist.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.destinations.map((dest) => (
                      <DestinationCard key={dest._id} destination={dest} />
                    ))}
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Saved Services ({wishlist.services?.length || 0})
                </h3>
                {wishlist.services?.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-md p-6 text-center text-xs text-slate-400">
                    No services in your wishlist.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.services.map((serv) => (
                      <ServiceCard key={serv._id} service={serv} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Bookings History */}
          {activeTab === "bookings" && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Bookings History
              </h2>

              {bookingsLoading ? (
                <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-xs text-slate-500">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span>Loading bookings...</span>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-xs text-slate-400">
                  No reservations registered under this account.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                      <tr>
                        <th className="py-2.5 px-3.5">Reference</th>
                        <th className="py-2.5 px-3.5">Category</th>
                        <th className="py-2.5 px-3.5">Date</th>
                        <th className="py-2.5 px-3.5">Service Particular</th>
                        <th className="py-2.5 px-3.5">Amount</th>
                        <th className="py-2.5 px-3.5">Status</th>
                        <th className="py-2.5 px-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-800">
                            {booking._id?.slice(-8)}
                          </td>
                          <td className="py-2.5 px-3.5 font-medium text-slate-900 uppercase text-[11px]">
                            {booking.bookingType}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-500">
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-800 font-medium truncate max-w-[150px]">
                            {booking.serviceId?.name || "-"}
                          </td>
                          <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                            {booking.totalCost?.toLocaleString()} INR
                          </td>
                          <td className="py-2.5 px-3.5">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            {booking.status === "CONFIRMED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCancelReservation(booking._id)
                                }
                                className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

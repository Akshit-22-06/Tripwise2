import React, { useState, useEffect } from "react";
import { businessAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, X } from "lucide-react";

const BusinessDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [serviceType, setServiceType] = useState("Hotel");
  const [name, setName] = useState("");
  const [priceRange, setPriceRange] = useState("$$");
  const [latitude, setLatitude] = useState(35.0116);
  const [longitude, setLongitude] = useState(135.7681);
  const [imageFile, setImageFile] = useState(null);

  const [pricePerNight, setPricePerNight] = useState(3500);
  const [cuisineType, setCuisineType] = useState("Italian");
  const [capacity, setCapacity] = useState(25);
  const [pricePerMeal, setPricePerMeal] = useState(800);
  const [hourlyRate, setHourlyRate] = useState(500);
  const [specialization, setSpecialization] = useState("City walking tours");

  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await businessAPI.getDashboard();
      setStats(res.data.data?.stats || null);
      setServices(res.data.data?.services || []);
      setBookings(res.data.data?.bookings || []);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("serviceType", serviceType);
      formData.append("name", name);
      formData.append("priceRange", priceRange);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const details = {};
      if (serviceType === "Hotel") {
        details.pricePerNight = pricePerNight;
        details.roomTypes = ["Standard Room", "Deluxe Room"];
        details.amenities = ["Free Wi-Fi", "Breakfast"];
      } else if (serviceType === "Restaurant") {
        details.cuisineType = cuisineType;
        details.capacity = capacity;
        details.pricePerMeal = pricePerMeal;
      } else if (serviceType === "TourGuide") {
        details.hourlyRate = hourlyRate;
        details.specialization = specialization;
        details.languages = ["English"];
      }

      formData.append("details", JSON.stringify(details));

      await businessAPI.createListing(formData);

      setName("");
      setImageFile(null);
      setShowModal(false);

      await fetchDashboardData();
    } catch (err) {
      alert("Could not submit service listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    try {
      await businessAPI.deleteListing(serviceId);
      await fetchDashboardData();
    } catch (err) {
      alert("Failed to remove service.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        <div className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p>Loading merchant dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Merchant Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your registered services, process reservations, and track business revenue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add Service Listing
        </button>
      </div>

      {/* Metrics Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <span className="text-xs text-slate-500 font-medium block">
              Gross Revenue
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {stats.grossRevenue?.toLocaleString()} INR
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <span className="text-xs text-slate-500 font-medium block">
              Active Reservations
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {stats.activeReservations}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <span className="text-xs text-slate-500 font-medium block">
              Pending Actions
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {stats.pendingReservations}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4">
            <span className="text-xs text-slate-500 font-medium block">
              Services Listed
            </span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {stats.totalServicesListed}
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Listings and Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Services List Column */}
        <div className="lg:col-span-8 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Registered Services ({services.length})
          </h2>

          {services.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-xs text-slate-400">
              No services registered yet. Click "Add Service Listing" to list a hotel, restaurant, or guide service.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2.5 px-3.5">Service</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Standard Rate</th>
                    <th className="py-2.5 px-3.5">Verification</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {services.map((serv) => (
                    <tr key={serv._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center space-x-3">
                          {serv.image && (
                            <img
                              src={serv.image}
                              alt={serv.name}
                              className="h-8 w-11 object-cover rounded border border-slate-200"
                            />
                          )}
                          <span className="font-semibold text-slate-900">
                            {serv.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 capitalize font-medium text-slate-700">
                        {serv.serviceType}
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-900">
                        {serv.serviceType === "Hotel" &&
                          `${serv.pricePerNight?.toLocaleString()} INR / night`}
                        {serv.serviceType === "Restaurant" &&
                          `${serv.pricePerMeal?.toLocaleString()} INR / meal`}
                        {serv.serviceType === "TourGuide" &&
                          `${serv.hourlyRate?.toLocaleString()} INR / hr`}
                      </td>
                      <td className="py-2.5 px-3.5">
                        {serv.isVerified ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteListing(serv._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Incoming Bookings Column */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Incoming Reservations ({bookings.length})
          </h2>

          {bookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-md p-6 text-center text-xs text-slate-400">
              No reservation logs received yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 uppercase text-[11px]">
                      {booking.bookingType}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        booking.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : booking.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-slate-600 space-y-0.5">
                    <p>
                      Client: <strong>{booking.userId?.name || "Customer"}</strong>
                    </p>
                    <p className="text-slate-400 font-mono text-[10px]">
                      Ref: {booking._id?.slice(-8)}
                    </p>
                    <p className="font-semibold text-slate-900 pt-1">
                      Fare: {booking.totalCost?.toLocaleString()} INR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-md shadow-md border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-xs text-slate-900">
                Add Service Listing
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateListing}
              className="p-5 space-y-3.5 overflow-y-auto flex-grow text-xs"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Service Category
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 bg-white"
                >
                  <option value="Hotel">Hotel / Stay</option>
                  <option value="Restaurant">Restaurant / Dining</option>
                  <option value="TourGuide">Professional Tour Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Listing Title / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                  placeholder="e.g. Traditional Kyoto Ryokan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Display Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:text-xs hover:file:bg-slate-100"
                />
              </div>

              {serviceType === "Hotel" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Price Per Night (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                  />
                </div>
              )}

              {serviceType === "Restaurant" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Price Per Meal (INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={pricePerMeal}
                      onChange={(e) =>
                        setPricePerMeal(parseInt(e.target.value))
                      }
                      className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Seating Capacity
                    </label>
                    <input
                      type="number"
                      required
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {serviceType === "TourGuide" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Hourly Rate (INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Specialization
                    </label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { plannerAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import {
  Calendar,
  Save,
  Check,
  Plane,
  Train,
  Building2,
  MapPin,
  Users,
  IndianRupee,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
  Info,
} from "lucide-react";

const POPULAR_DESTINATIONS = [
  "Manali",
  "Mumbai",
  "Delhi",
  "Goa",
  "Jaipur",
  "Ahmedabad",
  "Paris",
  "Dubai",
];

const POPULAR_ORIGINS = ["Ahmedabad", "Delhi", "Mumbai", "Bengaluru"];

const TRAVEL_STYLES = [
  { id: "Budget", label: "Budget" },
  { id: "Standard", label: "Standard" },
  { id: "Luxury", label: "Luxury" },
  { id: "Adventure", label: "Adventure" },
  { id: "Relaxed", label: "Relaxed" },
  { id: "Family", label: "Family" },
];

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const TripPlanner = () => {
  const { user } = useAuth();
  const { setActiveBooking } = useBooking();
  const navigate = useNavigate();

  // Form Inputs
  const [destination, setDestination] = useState("Manali");
  const [startingLocation, setStartingLocation] = useState("Ahmedabad");
  const [startDate, setStartDate] = useState(getTomorrowDate());
  const [totalDays, setTotalDays] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [targetBudget, setTargetBudget] = useState(20000);
  const [travelStyle, setTravelStyle] = useState("Standard");

  // Output states
  const [itinerary, setItinerary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Loading animation simulation across steps
  useEffect(() => {
    let interval;
    if (generating) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 1200);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please enter a destination name.");
      return;
    }
    if (!startingLocation.trim()) {
      setError("Please enter a starting location (e.g. Ahmedabad, Delhi, Mumbai).");
      return;
    }

    setGenerating(true);
    setError(null);
    setItinerary(null);
    setSaveSuccess(false);

    try {
      const res = await plannerAPI.generate({
        destination: destination.trim(),
        startingLocation: startingLocation.trim(),
        startDate,
        totalDays: parseInt(totalDays, 10),
        travelers: parseInt(travelers, 10),
        targetBudget: parseFloat(targetBudget),
        travelStyle,
      });

      setItinerary(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Itinerary generation failed. Please check inputs and try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!itinerary) return;
    setSaving(true);
    try {
      await plannerAPI.save({
        destinationId: itinerary.destinationId || itinerary.destination?.id,
        destinationName: itinerary.destinationName || itinerary.destination?.name,
        startingLocation: itinerary.startingLocation,
        totalDays: itinerary.totalDays,
        travelers: itinerary.travelers,
        travelStyle: itinerary.travelStyle,
        targetBudget: itinerary.targetBudget,
        estimatedCost: itinerary.estimatedCost,
        transportation: itinerary.transportation,
        accommodation: itinerary.accommodation,
        budgetBreakdown: itinerary.budgetBreakdown,
        dayPlans: itinerary.dayPlans,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/profile?tab=saved");
      }, 1000);
    } catch (err) {
      alert("Could not save itinerary: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Booking integrations
  const handleBookFlight = (flight) => {
    if (!flight) return;
    const travelerCount = parseInt(itinerary?.travelers || travelers, 10) || 1;
    const perPersonPrice = parseFloat(flight.price) || 0;
    const totalCost = perPersonPrice * travelerCount;

    setActiveBooking({
      bookingType: "Flight",
      totalCost,
      service: {
        name: `Flight ${flight.flightNumber} (${flight.airline})`,
        image:
          "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
        serviceType: "Flight",
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        departureCode: flight.departureCode,
        arrivalCode: flight.arrivalCode,
      },
      details: {
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        departureAirport: flight.departureCode,
        arrivalAirport: flight.arrivalCode,
        departureTime: flight.departureTime,
        passengers: travelerCount,
        seatClass: "Economy",
      },
    });
    navigate("/booking-checkout");
  };

  const handleBookTrain = (train) => {
    if (!train) return;
    const travelerCount = parseInt(itinerary?.travelers || travelers, 10) || 1;
    const perPersonFare = parseFloat(train.fare) || 1200;
    const totalCost = perPersonFare * travelerCount;

    setActiveBooking({
      bookingType: "Train",
      totalCost,
      service: {
        name: `Train ${train.trainNumber} - ${train.trainName}`,
        image:
          "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
        serviceType: "Train",
        trainNumber: train.trainNumber,
        trainName: train.trainName,
      },
      details: {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        departureStation: train.fromStation,
        arrivalStation: train.toStation,
        passengers: travelerCount,
        coachNumber: "B1",
        berthNumber: "12",
      },
    });
    navigate("/booking-checkout");
  };

  const handleBookHotel = (hotel) => {
    if (!hotel) return;
    const nights = Math.max(1, (itinerary?.totalDays || totalDays) - 1);
    const perNight = parseFloat(hotel.pricePerNight || hotel.priceRange) || 2500;
    const totalCost = perNight * nights;

    setActiveBooking({
      bookingType: "Hotel",
      totalCost,
      service: {
        _id: hotel._id,
        name: hotel.name,
        pricePerNight: perNight,
        image:
          hotel.image ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        address: hotel.address || itinerary?.destinationName,
        city: itinerary?.destination?.city || itinerary?.destinationName,
      },
      details: {
        hotelName: hotel.name,
        hotelAddress: hotel.address || itinerary?.destinationName,
        numberOfNights: nights,
        checkInDate: startDate,
        guestsCount: parseInt(itinerary?.travelers || travelers, 10) || 1,
      },
    });
    navigate("/booking-checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Dynamic Trip Planner
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Enter any travel destination worldwide. We search real flights, trains, hotels, and attractions,
          then organize them into a realistic AI-crafted itinerary within your budget.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Controls Column */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <span>Trip Parameters</span>
            <span className="text-[11px] font-normal text-slate-400">All fields required</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Destination Input (Free text + Quick pills) */}
            <div>
              <label
                htmlFor="planner-dest"
                className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1"
              >
                <MapPin className="h-3 w-3 text-indigo-600" />
                <span>Destination (Any City or Place)</span>
              </label>
              <input
                id="planner-dest"
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Mumbai, Paris, Goa, Tokyo"
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
              />
              {/* Quick Preset Pills */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {POPULAR_DESTINATIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setDestination(city)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition ${
                      destination.toLowerCase() === city.toLowerCase()
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Starting Location Input */}
            <div>
              <label
                htmlFor="planner-origin"
                className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1"
              >
                <Compass className="h-3 w-3 text-indigo-600" />
                <span>Starting Location (Your City)</span>
              </label>
              <input
                id="planner-origin"
                type="text"
                required
                value={startingLocation}
                onChange={(e) => setStartingLocation(e.target.value)}
                placeholder="e.g. Ahmedabad, Delhi, Mumbai, Bengaluru"
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {POPULAR_ORIGINS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setStartingLocation(city)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition ${
                      startingLocation.toLowerCase() === city.toLowerCase()
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Departure Date */}
            <div>
              <label
                htmlFor="planner-start-date"
                className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1"
              >
                <Calendar className="h-3 w-3 text-indigo-600" />
                <span>Departure Date</span>
              </label>
              <input
                id="planner-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>

            {/* Duration (Days) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                <span>Trip Duration</span>
                <span className="text-slate-400 font-normal">{totalDays} Days / {Math.max(1, totalDays - 1)} Nights</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTotalDays(d)}
                    className={`py-1.5 text-xs font-medium rounded border transition ${
                      totalDays === d
                        ? "bg-indigo-600 border-indigo-600 text-white font-semibold"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Travelers & Budget Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="planner-travelers"
                  className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1"
                >
                  <Users className="h-3 w-3 text-indigo-600" />
                  <span>Travelers</span>
                </label>
                <input
                  id="planner-travelers"
                  type="number"
                  min="1"
                  max="15"
                  required
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
                />
              </div>

              <div>
                <label
                  htmlFor="planner-budget"
                  className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1"
                >
                  <IndianRupee className="h-3 w-3 text-indigo-600" />
                  <span>Target Budget</span>
                </label>
                <input
                  id="planner-budget"
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
                  placeholder="e.g. 20000"
                />
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label
                htmlFor="planner-style"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Travel Style
              </label>
              <select
                id="planner-style"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
              >
                {TRAVEL_STYLES.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded text-xs transition disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>{generating ? "Building Dynamic Trip..." : "Plan My Trip"}</span>
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Multi-step Loading Animation */}
          {generating && (
            <div className="bg-white border border-slate-200 rounded-md p-8 text-center space-y-4">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Planning Your Trip to {destination}...
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Querying live transport, accommodation, and real POI services.
                </p>
              </div>

              <div className="max-w-md mx-auto text-left space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2">
                  {loadingStep >= 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                  )}
                  <span className={loadingStep >= 1 ? "text-slate-800 font-medium" : "text-slate-400"}>
                    Resolving {destination} coordinates &amp; geography
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {loadingStep >= 2 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                  )}
                  <span className={loadingStep >= 2 ? "text-slate-800 font-medium" : "text-slate-400"}>
                    Searching live flights &amp; trains from {startingLocation}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {loadingStep >= 3 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                  )}
                  <span className={loadingStep >= 3 ? "text-slate-800 font-medium" : "text-slate-400"}>
                    Checking accommodation &amp; verified points of interest
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {loadingStep >= 4 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                  )}
                  <span className={loadingStep >= 4 ? "text-slate-800 font-medium" : "text-slate-400"}>
                    Synthesizing day-by-day itinerary with Gemini AI
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty Placeholder */}
          {!generating && !itinerary && (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-slate-400 text-xs space-y-2">
              <Compass className="h-8 w-8 text-indigo-400 mx-auto" />
              <p className="font-semibold text-slate-800 text-sm">Ready to Plan Your Trip</p>
              <p className="text-slate-500 max-w-md mx-auto text-xs leading-relaxed">
                Enter your starting city, target destination, travel dates, and budget on the left.
                TripWise will dynamically compare real transport options, accommodations, and craft
                a realistic day-by-day plan.
              </p>
            </div>
          )}

          {/* Generated Plan View */}
          {itinerary && (
            <div className="space-y-4">
              {/* Trip Header Banner */}
              <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                {itinerary.destination?.images?.length > 0 && (
                  <div className="h-36 w-full overflow-hidden relative">
                    <img
                      src={itinerary.destination.images[0]}
                      alt={itinerary.destinationName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[10px] font-semibold tracking-wider uppercase bg-indigo-600/90 px-2 py-0.5 rounded">
                        {itinerary.travelStyle} Trip
                      </span>
                      <h2 className="text-xl font-bold mt-1">{itinerary.destinationName}</h2>
                      <p className="text-xs text-white/80">
                        {itinerary.startingLocation} &rarr; {itinerary.destinationName} &bull; {itinerary.totalDays} Days / {Math.max(1, itinerary.totalDays - 1)} Nights &bull; {itinerary.travelers} Travelers
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  {!itinerary.destination?.images?.length && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                        Custom Plan
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Trip to {itinerary.destinationName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        From {itinerary.startingLocation} &bull; {itinerary.totalDays} Days &bull; {itinerary.travelers} Travelers &bull; Style: {itinerary.travelStyle}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                        Est. Total
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        ₹{itinerary.estimatedCost?.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveItinerary}
                      disabled={saving || saveSuccess}
                      className="inline-flex items-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition disabled:opacity-50"
                    >
                      {saveSuccess ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Saved
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5 mr-1" />
                          {saving ? "Saving..." : "Save Plan"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Budget Feasibility & Advice Alert */}
              {itinerary.budgetBreakdown && (
                <div>
                  {itinerary.budgetBreakdown.status === "OVER_BUDGET" ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-2 text-xs">
                      <div className="flex items-start space-x-2 text-amber-900">
                        <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">
                            Budget Feasibility Alert: Your selected budget may not be sufficient
                          </p>
                          <p className="text-amber-800 mt-0.5">
                            Estimated minimum cost is <strong>₹{itinerary.budgetBreakdown.estimatedTotalCost?.toLocaleString()}</strong>, which exceeds your target budget of <strong>₹{itinerary.budgetBreakdown.userBudget?.toLocaleString()}</strong> by <strong>₹{itinerary.budgetBreakdown.deficit?.toLocaleString()}</strong>.
                          </p>
                        </div>
                      </div>

                      {itinerary.budgetBreakdown.suggestions?.length > 0 && (
                        <div className="bg-white/80 border border-amber-200/60 rounded p-2.5 space-y-1">
                          <span className="font-medium text-amber-900 block text-[11px] uppercase tracking-wider">
                            Recommended Alternatives:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-xs">
                            {itinerary.budgetBreakdown.suggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center space-x-2 text-xs text-emerald-900">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong>Budget on track!</strong> Estimated cost (₹{itinerary.budgetBreakdown.estimatedTotalCost?.toLocaleString()}) is within your budget of ₹{itinerary.budgetBreakdown.userBudget?.toLocaleString()} with ₹{itinerary.budgetBreakdown.surplus?.toLocaleString()} surplus.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Real Cost Breakdown: Actual API prices vs Estimated expenses */}
              <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Itemized Cost Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Actual API Prices */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                    <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider text-indigo-700">
                      Actual API / Booking Prices
                    </span>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>
                          Transportation ({itinerary.transportation?.recommendation?.type || "Selected"} for {itinerary.travelers}p):
                        </span>
                        <span className="font-medium text-slate-900">
                          ₹{itinerary.budgetBreakdown?.actualPrices?.transportation?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Accommodation ({itinerary.accommodation?.totalNights || 1} nights):
                        </span>
                        <span className="font-medium text-slate-900">
                          ₹{itinerary.budgetBreakdown?.actualPrices?.accommodation?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 pt-1 flex justify-between font-semibold text-slate-900">
                        <span>Subtotal (Direct Bookings):</span>
                        <span>₹{itinerary.budgetBreakdown?.actualPrices?.subtotal?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Expenses */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                    <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-700">
                      Estimated On-Trip Expenses
                    </span>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Attractions &amp; Activities:</span>
                        <span className="font-medium text-slate-900">
                          ₹{itinerary.budgetBreakdown?.estimatedExpenses?.activitiesEstimate?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Food &amp; Dining:</span>
                        <span className="font-medium text-slate-900">
                          ₹{itinerary.budgetBreakdown?.estimatedExpenses?.foodEstimate?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 pt-1 flex justify-between font-semibold text-slate-900">
                        <span>Subtotal (Estimated):</span>
                        <span>₹{itinerary.budgetBreakdown?.estimatedExpenses?.subtotal?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs font-semibold text-slate-900 border-t border-slate-100">
                  <span>Grand Total Estimated Trip Cost:</span>
                  <span className="text-sm font-bold text-indigo-700">
                    ₹{itinerary.estimatedCost?.toLocaleString()} INR
                  </span>
                </div>
              </div>

              {/* Transportation Comparison & Recommendation */}
              <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Transportation Options</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({itinerary.startingLocation} &rarr; {itinerary.destinationName})
                    </span>
                  </h4>
                  {itinerary.transportation?.recommendation && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700">
                      Recommended: {itinerary.transportation.recommendation.type}
                    </span>
                  )}
                </div>

                {/* Recommendation Reason */}
                {itinerary.transportation?.recommendation?.reason && (
                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded text-xs text-indigo-900 flex items-start space-x-2">
                    <Info className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Why this recommendation: </span>
                      <span>{itinerary.transportation.recommendation.reason}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Flight Option */}
                  <div className="border border-slate-200 rounded p-3 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 flex items-center space-x-1">
                          <Plane className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Flight Service</span>
                        </span>
                        {itinerary.transportation?.flights?.length > 0 && (
                          <span className="text-[11px] font-semibold text-slate-900">
                            ₹{itinerary.transportation.flights[0].price?.toLocaleString()} / person
                          </span>
                        )}
                      </div>

                      {itinerary.transportation?.flights?.length > 0 ? (
                        <div className="mt-2 space-y-1 text-slate-600">
                          <p className="font-medium text-slate-800">
                            {itinerary.transportation.flights[0].airline} ({itinerary.transportation.flights[0].flightNumber})
                          </p>
                          <p>
                            Route: {itinerary.transportation.flights[0].departureCode} &rarr; {itinerary.transportation.flights[0].arrivalCode}
                          </p>
                          <p>
                            Duration: {itinerary.transportation.flights[0].duration} &bull; Dep: {itinerary.transportation.flights[0].departureTime}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Total for {itinerary.travelers} traveler(s): ₹{(itinerary.transportation.flights[0].price * itinerary.travelers)?.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-slate-400 italic">
                          No direct flight found for this specific route.
                        </p>
                      )}
                    </div>

                    {itinerary.transportation?.flights?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleBookFlight(itinerary.transportation.flights[0])}
                        className="mt-2 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition"
                      >
                        Book Flight
                      </button>
                    )}
                  </div>

                  {/* Train Option */}
                  <div className="border border-slate-200 rounded p-3 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 flex items-center space-x-1">
                          <Train className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Train Service</span>
                        </span>
                        {itinerary.transportation?.trains?.length > 0 && (
                          <span className="text-[11px] font-semibold text-slate-900">
                            ₹{itinerary.transportation.trains[0].fare?.toLocaleString()} / person
                          </span>
                        )}
                      </div>

                      {itinerary.transportation?.trains?.length > 0 ? (
                        <div className="mt-2 space-y-1 text-slate-600">
                          <p className="font-medium text-slate-800">
                            {itinerary.transportation.trains[0].trainName} (#{itinerary.transportation.trains[0].trainNumber})
                          </p>
                          <p>
                            Route: {itinerary.transportation.trains[0].fromStation} &rarr; {itinerary.transportation.trains[0].toStation}
                          </p>
                          <p>
                            Duration: {itinerary.transportation.trains[0].duration} &bull; Dep: {itinerary.transportation.trains[0].departureTime}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Total for {itinerary.travelers} traveler(s): ₹{(itinerary.transportation.trains[0].fare * itinerary.travelers)?.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-slate-400 italic">
                          No direct train schedule found for this route.
                        </p>
                      )}
                    </div>

                    {itinerary.transportation?.trains?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleBookTrain(itinerary.transportation.trains[0])}
                        className="mt-2 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition"
                      >
                        Book Train
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Accommodation Card & Booking */}
              <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Selected Accommodation</span>
                  </h4>
                  {itinerary.accommodation?.selectedHotel && (
                    <span className="text-[11px] font-semibold text-slate-900">
                      ₹{itinerary.accommodation.selectedHotel.pricePerNight?.toLocaleString()} / night
                    </span>
                  )}
                </div>

                {itinerary.accommodation?.selectedHotel ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      {itinerary.accommodation.selectedHotel.image && (
                        <img
                          src={itinerary.accommodation.selectedHotel.image}
                          alt={itinerary.accommodation.selectedHotel.name}
                          className="w-16 h-16 object-cover rounded border border-slate-200 flex-shrink-0"
                        />
                      )}
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold text-slate-900 text-sm">
                          {itinerary.accommodation.selectedHotel.name}
                        </p>
                        <p className="text-slate-500">
                          {itinerary.accommodation.selectedHotel.address || itinerary.destinationName}
                        </p>
                        <p className="text-slate-600">
                          Rating: <strong>{itinerary.accommodation.selectedHotel.rating || 4.2} ★</strong> &bull; Total for {itinerary.accommodation.totalNights} nights: <strong>₹{itinerary.accommodation.totalCost?.toLocaleString()}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookHotel(itinerary.accommodation.selectedHotel)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition flex-shrink-0 w-full sm:w-auto text-center"
                    >
                      Book Hotel
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {itinerary.accommodation?.note || "Accommodation information is currently unavailable."}
                  </p>
                )}
              </div>

              {/* Real POIs Discovered */}
              {itinerary.places?.attractions?.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-md p-4 space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>Verified Places &amp; Points of Interest</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Geoapify live POI data ({itinerary.places.totalFound} discovered)
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {itinerary.places.attractions.slice(0, 10).map((poi, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 flex items-center space-x-1"
                      >
                        <MapPin className="h-3 w-3 text-indigo-500" />
                        <span>{poi.name}</span>
                        {poi.category && (
                          <span className="text-[9px] text-slate-400 uppercase">({poi.category})</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Day-by-Day schedule (Built by Gemini using real POIs) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Day-by-Day Realistic Itinerary
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Planned around real transport &amp; POIs
                  </span>
                </div>

                {itinerary.dayPlans?.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="bg-white border border-slate-200 rounded-md p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="font-semibold text-slate-900 text-xs flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">
                          DAY {day.dayNumber}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-600 font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Estimated: ₹{(day.dailyEstimatedCost || 0)?.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-50/70 border border-slate-200 rounded space-y-1">
                        <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-amber-500" />
                          <span>Morning</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed text-xs">
                          {day.morning}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50/70 border border-slate-200 rounded space-y-1">
                        <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-indigo-500" />
                          <span>Afternoon</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed text-xs">
                          {day.afternoon}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50/70 border border-slate-200 rounded space-y-1">
                        <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-purple-500" />
                          <span>Evening</span>
                        </span>
                        <p className="text-slate-600 leading-relaxed text-xs">
                          {day.evening}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;

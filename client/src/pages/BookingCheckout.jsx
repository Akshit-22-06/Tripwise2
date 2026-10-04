import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";

const BookingCheckout = () => {
  const { user } = useAuth();
  const { activeBooking, createBooking, processPaymentCheckout } = useBooking();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [flightNumber, setFlightNumber] = useState("AI-302");
  const [seatNumber, setSeatNumber] = useState("14B");
  const [cabinClass, setCabinClass] = useState("Economy");

  const [trainNumber, setTrainNumber] = useState("12001");
  const [coachNumber, setCoachNumber] = useState("A1");
  const [berthNumber, setBerthNumber] = useState("32");

  const [roomType, setRoomType] = useState("Standard Room");
  const [numberOfNights, setNumberOfNights] = useState(3);
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [hours, setHours] = useState(4);
  const [partySize, setPartySize] = useState(2);
  const [reservationTime, setReservationTime] = useState("19:30");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!activeBooking) {
      navigate("/");
    }
  }, [user, activeBooking]);

  if (!activeBooking) return null;

  const { service, bookingType, totalCost } = activeBooking;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let details = { ...(activeBooking.details || {}) };
      if (bookingType === "Flight") {
        details = { ...details, flightNumber, seatNumber, cabinClass };
      } else if (bookingType === "Train") {
        details = { ...details, trainNumber, coachNumber, berthNumber };
      } else if (bookingType === "Hotel") {
        const checkOut = new Date(checkInDate);
        checkOut.setDate(checkOut.getDate() + parseInt(numberOfNights));
        details = {
          ...details,
          hotelName: service?.name || details.hotelName || "Hotel Accommodation",
          roomType,
          numberOfNights,
          checkInDate,
          checkOutDate: checkOut.toISOString().split("T")[0],
          guestsCount: details.guestsCount || 1,
        };
      } else if (bookingType === "TourGuide") {
        details = { ...details, hours };
      } else if (bookingType === "Restaurant") {
        details = { ...details, partySize, reservationTime };
      }

      let finalCost = Number(totalCost) || 0;
      if (bookingType === "Hotel") {
        const perNight = Number(service?.pricePerNight) || Number(totalCost) || 2500;
        finalCost = perNight * parseInt(numberOfNights || 1);
      } else if (bookingType === "TourGuide") {
        const perHour = Number(service?.hourlyRate) || Number(totalCost) || 500;
        finalCost = perHour * parseInt(hours || 1);
      }

      const booking = await createBooking(
        bookingType,
        service ? service._id : null,
        finalCost,
        details,
      );

      await processPaymentCheckout(booking._id, (verifiedBooking) => {
        setSuccessData(verifiedBooking);
      });
    } catch (err) {
      alert("Checkout transaction could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success Confirmation View
  if (successData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-md p-6 space-y-5">
          <div className="flex items-center space-x-3 text-emerald-700">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Booking Confirmed
              </h2>
              <p className="text-xs text-slate-500">
                Payment verified. Your reservation details are saved to your profile.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded divide-y divide-slate-100 text-xs">
            <div className="py-2.5 px-3.5 flex justify-between">
              <span className="text-slate-500">Booking Reference</span>
              <span className="font-mono font-medium text-slate-900">
                {successData._id}
              </span>
            </div>
            <div className="py-2.5 px-3.5 flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-medium text-slate-900 uppercase">
                {successData.bookingType}
              </span>
            </div>
            <div className="py-2.5 px-3.5 flex justify-between">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-semibold text-slate-900">
                {successData.totalCost?.toLocaleString()} INR
              </span>
            </div>
            <div className="py-2.5 px-3.5 flex justify-between items-center">
              <span className="text-slate-500">Verification Status</span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                CONFIRMED
              </span>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Link
              to="/profile?tab=bookings"
              className="flex-1 text-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition"
            >
              View My Bookings
            </Link>
            <Link
              to="/"
              className="py-2 px-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 mb-2 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
        </button>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Checkout &amp; Confirmation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review service details and finalize payment via the secure gateway.
        </p>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Booking Details & Options */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-5 space-y-4 text-xs">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Reservation Particulars
          </h2>

          <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
            {service?.image && (
              <img
                src={service.image}
                alt={service.name}
                className="w-16 h-14 object-cover rounded border border-slate-200 flex-shrink-0"
              />
            )}
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                {bookingType}
              </span>
              <h3 className="text-sm font-semibold text-slate-900">
                {service?.name || `${bookingType} Reservation`}
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {service?.address || service?.city || "Standard reservation details"}
              </p>
            </div>
          </div>

          {/* Dynamic Configuration Inputs based on booking type */}
          {bookingType === "Flight" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Flight Ref
                </label>
                <input
                  type="text"
                  required
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Seat
                </label>
                <input
                  type="text"
                  required
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Class
                </label>
                <input
                  type="text"
                  required
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {bookingType === "Train" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Train Ref
                </label>
                <input
                  type="text"
                  required
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Coach
                </label>
                <input
                  type="text"
                  required
                  value={coachNumber}
                  onChange={(e) => setCoachNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Berth
                </label>
                <input
                  type="text"
                  required
                  value={berthNumber}
                  onChange={(e) => setBerthNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          )}

          {bookingType === "Hotel" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Room Type
                </label>
                <input
                  type="text"
                  required
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nights
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={numberOfNights}
                  onChange={(e) => setNumberOfNights(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {bookingType === "TourGuide" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Booking Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
              />
            </div>
          )}

          {bookingType === "Restaurant" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Party Size (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reservation Time
                </label>
                <input
                  type="time"
                  required
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          <div className="pt-2 text-slate-500 text-[11px]">
            Passenger / Guest: <strong>{user?.name}</strong> ({user?.email})
          </div>
        </div>

        {/* Right Column: Cost Summary & Action */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Payment Summary
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between text-slate-600">
              <span>Base Fare / Rate</span>
              <span>{totalCost?.toLocaleString()} INR</span>
            </div>
            {bookingType === "Hotel" && numberOfNights > 1 && (
              <div className="py-2 flex justify-between text-slate-600">
                <span>Duration Multiplier</span>
                <span>&times; {numberOfNights} nights</span>
              </div>
            )}
            {bookingType === "TourGuide" && hours > 1 && (
              <div className="py-2 flex justify-between text-slate-600">
                <span>Duration Multiplier</span>
                <span>&times; {hours} hrs</span>
              </div>
            )}
            <div className="py-2 flex justify-between text-slate-600">
              <span>Platform Coordination</span>
              <span className="text-emerald-700 font-medium">Included</span>
            </div>
            <div className="py-2 flex justify-between text-slate-600">
              <span>Taxes &amp; Statutory Fees</span>
              <span className="text-slate-500">Included</span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-sm font-semibold text-slate-900">
              <span>Grand Total</span>
              <span className="text-base font-bold text-slate-900">
                {(
                  bookingType === "Hotel"
                    ? (service?.pricePerNight || service?.priceRange || totalCost) * numberOfNights
                    : bookingType === "TourGuide"
                    ? (service?.hourlyRate || totalCost) * hours
                    : totalCost
                )?.toLocaleString()}{" "}
                INR
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex items-center space-x-2 text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="text-[11px]">
              Encrypted Razorpay transaction with automated receipt generation.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition disabled:opacity-50"
          >
            {loading ? "Processing Payment..." : "Confirm & Pay"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingCheckout;

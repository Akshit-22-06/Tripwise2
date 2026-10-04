import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hotelAPI } from "../services/api";
import { useBooking } from "../context/BookingContext";
import { Building2 } from "lucide-react";

const HotelListings = () => {
  const [cityCode, setCityCode] = useState("DEL");
  const [checkInDate, setCheckInDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0],
  );
  const [roomQuantity, setRoomQuantity] = useState(1);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { setActiveBooking } = useBooking();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHotels([]);

    try {
      const res = await hotelAPI.search({
        cityCode: cityCode.trim().toUpperCase(),
        checkInDate,
        checkOutDate,
        roomQuantity,
      });
      setHotels(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Hotel search query failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookHotel = (hotel) => {
    setActiveBooking({
      bookingType: "Hotel",
      totalCost: parseFloat(hotel.pricePerNight || hotel.priceRange),
      service: hotel,
      details: {
        hotelName: hotel.name,
        hotelAddress: hotel.address || "Address reference",
        roomType: hotel.roomType,
        checkInDate,
        checkOutDate,
        guestsCount: 1,
      },
    });
    navigate("/booking-checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Hotel Search
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Search available hotel accommodations, room configurations, and nightly pricing by city code.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end text-xs"
      >
        <div>
          <label
            htmlFor="ht-city"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            City Code (IATA)
          </label>
          <input
            id="ht-city"
            type="text"
            required
            maxLength="3"
            value={cityCode}
            onChange={(e) => setCityCode(e.target.value.toUpperCase())}
            className="w-full p-2 border border-slate-300 rounded font-mono font-medium text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            placeholder="DEL"
          />
        </div>

        <div>
          <label
            htmlFor="ht-in"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Check-In Date
          </label>
          <input
            id="ht-in"
            type="date"
            required
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="ht-out"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Check-Out Date
          </label>
          <input
            id="ht-out"
            type="date"
            required
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="ht-rooms"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Rooms Count
          </label>
          <input
            id="ht-rooms"
            type="number"
            min="1"
            max="4"
            required
            value={roomQuantity}
            onChange={(e) => setRoomQuantity(parseInt(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search Hotels"}
        </button>
      </form>

      {/* Results Section */}
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-xs text-slate-500">
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Finding verified accommodations...</span>
          </div>
        )}

        {!loading && hotels.length === 0 && !error && (
          <div className="bg-white border border-slate-200 rounded-md p-10 text-center text-xs text-slate-400">
            <Building2 className="h-6 w-6 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">Enter a city code to search</p>
            <p className="text-slate-400 mt-0.5">Example: DEL or BOM with check-in and check-out dates.</p>
          </div>
        )}

        {hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.map((hotel) => (
              <article
                key={hotel.id}
                className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col hover:border-slate-300 transition-colors"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 border border-slate-200 rounded text-slate-600 uppercase">
                        {hotel.source}
                      </span>
                      <span className="text-xs text-slate-500">
                        {hotel.roomType}
                      </span>
                    </div>
                    {hotel.address && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                        {hotel.address}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                        Rate / Night
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {hotel.pricePerNight} {hotel.currency}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookHotel(hotel)}
                      className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition"
                    >
                      Reserve Room
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelListings;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { flightAPI } from "../services/api";
import { useBooking } from "../context/BookingContext";
import { ArrowRight, Plane } from "lucide-react";

const FlightSearch = () => {
  const [origin, setOrigin] = useState("DEL");
  const [destination, setDestination] = useState("BOM");
  const [departureDate, setDepartureDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [adults, setAdults] = useState(1);
  const [travelClass, setTravelClass] = useState("ECONOMY");

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { setActiveBooking } = useBooking();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFlights([]);

    try {
      const res = await flightAPI.search({
        origin: origin.trim().toUpperCase(),
        destination: destination.trim().toUpperCase(),
        departureDate,
        adults,
        travelClass,
      });
      setFlights(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Flight search query failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = (flight) => {
    setActiveBooking({
      bookingType: "Flight",
      totalCost: parseFloat(flight.price),
      service: {
        name: `Flight ${flight.flightNumber} (${flight.airline})`,
        image:
          "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
        serviceType: "Flight",
        ...flight,
      },
      details: {
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        departureAirport: flight.departureCode,
        arrivalAirport: flight.arrivalCode,
        departureTime: flight.departureTime,
        seatClass: travelClass,
      },
    });
    navigate("/booking-checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Flight Search
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Search live scheduled airline departures by airport IATA code and departure date.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end text-xs"
      >
        <div>
          <label
            htmlFor="fl-origin"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Origin (IATA)
          </label>
          <input
            id="fl-origin"
            type="text"
            required
            maxLength="3"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            className="w-full p-2 border border-slate-300 rounded font-mono font-medium text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            placeholder="DEL"
          />
        </div>

        <div>
          <label
            htmlFor="fl-dest"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Destination (IATA)
          </label>
          <input
            id="fl-dest"
            type="text"
            required
            maxLength="3"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            className="w-full p-2 border border-slate-300 rounded font-mono font-medium text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            placeholder="BOM"
          />
        </div>

        <div>
          <label
            htmlFor="fl-date"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Departure Date
          </label>
          <input
            id="fl-date"
            type="date"
            required
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="fl-class"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Cabin Class
          </label>
          <select
            id="fl-class"
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First Class</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search Flights"}
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
            <span>Querying flight schedules...</span>
          </div>
        )}

        {!loading && flights.length === 0 && !error && (
          <div className="bg-white border border-slate-200 rounded-md p-10 text-center text-xs text-slate-400">
            <Plane className="h-6 w-6 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">Enter airport codes to search</p>
            <p className="text-slate-400 mt-0.5">Example: DEL to BOM, with a departure date.</p>
          </div>
        )}

        {flights.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Flight</th>
                  <th className="py-2.5 px-4">Route</th>
                  <th className="py-2.5 px-4">Departure / Arrival</th>
                  <th className="py-2.5 px-4">Data Source</th>
                  <th className="py-2.5 px-4">Base Fare</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {flights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block font-mono">
                        {flight.flightNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {flight.airline}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span>{flight.departureCode}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span>{flight.arrivalCode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>
                        Depart:{" "}
                        {new Date(flight.departureTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Arrive:{" "}
                        {new Date(flight.arrivalTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 uppercase text-[11px]">
                      {flight.source}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {flight.price} {flight.currency}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleBookFlight(flight)}
                        className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition"
                      >
                        Book Seat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;

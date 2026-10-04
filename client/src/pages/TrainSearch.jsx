import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trainAPI } from "../services/api";
import { useBooking } from "../context/BookingContext";
import { ArrowRight, Train } from "lucide-react";

const TrainSearch = () => {
  const [sourceCode, setSourceCode] = useState("NDLS");
  const [destinationCode, setDestinationCode] = useState("BCT");
  const [travelDate, setTravelDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { setActiveBooking } = useBooking();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrains([]);

    try {
      const res = await trainAPI.search({
        sourceCode: sourceCode.trim().toUpperCase(),
        destinationCode: destinationCode.trim().toUpperCase(),
        travelDate,
      });
      setTrains(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Train search query failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrain = (train) => {
    setActiveBooking({
      bookingType: "Train",
      totalCost: parseFloat(train.price),
      service: {
        name: `Train ${train.trainNumber} (${train.trainName})`,
        image:
          "https://images.unsplash.com/photo-1532103054090-334990158523?auto=format&fit=crop&w=600&q=80",
        serviceType: "Train",
        ...train,
      },
      details: {
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        sourceStation: train.sourceStation,
        destStation: train.destStation,
        coachNumber: "A1",
        berthType: "Lower Berth",
      },
    });
    navigate("/booking-checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Train Search
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Search train schedules, connection routes, and coach classes by Indian Railways station codes.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end text-xs"
      >
        <div>
          <label
            htmlFor="tr-source"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            From Station (Code)
          </label>
          <input
            id="tr-source"
            type="text"
            required
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value.toUpperCase())}
            className="w-full p-2 border border-slate-300 rounded font-mono font-medium text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            placeholder="NDLS"
          />
        </div>

        <div>
          <label
            htmlFor="tr-dest"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            To Station (Code)
          </label>
          <input
            id="tr-dest"
            type="text"
            required
            value={destinationCode}
            onChange={(e) => setDestinationCode(e.target.value.toUpperCase())}
            className="w-full p-2 border border-slate-300 rounded font-mono font-medium text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            placeholder="BCT"
          />
        </div>

        <div>
          <label
            htmlFor="tr-date"
            className="block text-xs font-medium text-slate-700 mb-1"
          >
            Travel Date
          </label>
          <input
            id="tr-date"
            type="date"
            required
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search Trains"}
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
            <span>Searching available train schedules...</span>
          </div>
        )}

        {!loading && trains.length === 0 && !error && (
          <div className="bg-white border border-slate-200 rounded-md p-10 text-center text-xs text-slate-400">
            <Train className="h-6 w-6 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">Enter station codes to search</p>
            <p className="text-slate-400 mt-0.5">Example: NDLS to BCT with travel date.</p>
          </div>
        )}

        {trains.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-md overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Train Number &amp; Name</th>
                  <th className="py-2.5 px-4">Route</th>
                  <th className="py-2.5 px-4">Timetable</th>
                  <th className="py-2.5 px-4">Available Classes</th>
                  <th className="py-2.5 px-4">Base Fare</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {trains.map((train) => (
                  <tr key={train.trainNumber} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block font-mono">
                        {train.trainNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {train.trainName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span>{train.sourceStation}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span>{train.destStation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>Depart: {train.departureTime}</div>
                      <div className="text-[11px] text-slate-400">
                        Arrive: {train.arrivalTime}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {train.classes?.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-mono font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {train.price} INR
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleBookTrain(train)}
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

export default TrainSearch;

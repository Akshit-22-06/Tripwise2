import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { destinationAPI, plannerAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Calendar, Save, Check } from "lucide-react";

const TripPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const [destinationId, setDestinationId] = useState("");
  const [totalDays, setTotalDays] = useState(3);
  const [targetBudget, setTargetBudget] = useState(15000);
  const [travelStyle, setTravelStyle] = useState("adventure");

  const [itinerary, setItinerary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchDestinations = async () => {
      try {
        const res = await destinationAPI.getAll();
        setDestinations(res.data.data || []);
        if (res.data.data?.length > 0) {
          setDestinationId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load destinations:", err);
      } finally {
        setLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, [user]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setItinerary(null);
    setSaveSuccess(false);

    try {
      const res = await plannerAPI.generate({
        destinationId,
        totalDays: parseInt(totalDays),
        targetBudget: parseFloat(targetBudget),
        travelStyle,
      });
      setItinerary(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Itinerary generation failed. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!itinerary) return;
    setSaving(true);
    try {
      await plannerAPI.save(itinerary);
      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/profile?tab=saved");
      }, 1000);
    } catch (err) {
      alert("Could not save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Trip Planner
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate an itemized daily schedule based on your target destination, duration, budget, and travel preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Controls Column */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
            Trip Parameters
          </h2>

          {loadingDestinations ? (
            <div className="py-6 text-center text-xs text-slate-500">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Loading destinations...</span>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs">
                  {error}
                </div>
              )}

              {/* Destination Dropdown */}
              <div>
                <label
                  htmlFor="planner-dest"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Destination
                </label>
                <select
                  id="planner-dest"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                >
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.city}, {d.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Buttons */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Duration (Days)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTotalDays(d)}
                      className={`py-1.5 text-xs font-medium rounded border transition ${
                        totalDays === d
                          ? "bg-slate-900 border-slate-900 text-white font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget input */}
              <div>
                <label
                  htmlFor="planner-budget"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Target Budget (INR)
                </label>
                <input
                  id="planner-budget"
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  placeholder="e.g. 15000"
                />
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
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="adventure">Adventure &amp; Outdoor</option>
                  <option value="historical">Historic &amp; Cultural</option>
                  <option value="beach">Beach &amp; Relaxation</option>
                  <option value="nature">Scenic Nature</option>
                  <option value="urban">Urban &amp; Culinary</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Itinerary"}
              </button>
            </form>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-4">
          {generating && (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-slate-500 text-xs">
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="font-medium text-slate-800">Generating daily itinerary...</p>
              <p className="text-slate-400 mt-1">
                Synthesizing activities, daylight schedules, and budget allocations.
              </p>
            </div>
          )}

          {!generating && !itinerary && (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-slate-400 text-xs">
              <Calendar className="h-6 w-6 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No itinerary generated yet</p>
              <p className="text-slate-400 mt-1">
                Configure your destination and budget parameters on the left, then click "Generate Itinerary".
              </p>
            </div>
          )}

          {itinerary && (
            <div className="space-y-4">
              {/* Itinerary Header */}
              <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                    Generated Folio
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
                    {itinerary.destinationName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Duration: {itinerary.totalDays} Days &bull; Style:{" "}
                    <span className="capitalize">{itinerary.travelStyle}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                      Est. Total
                    </span>
                    <span className="text-base font-semibold text-slate-900">
                      {itinerary.estimatedCost?.toLocaleString()} INR
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

              {/* Day-by-Day schedule */}
              <div className="space-y-3">
                {itinerary.dayPlans?.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="bg-white border border-slate-200 rounded-md p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="font-semibold text-slate-900 text-xs">
                        Day {day.dayNumber}
                      </h4>
                      <span className="text-[11px] text-slate-600 font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Estimated: {day.dailyEstimatedCost?.toLocaleString()} INR
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-50/60 border border-slate-200 rounded">
                        <span className="font-medium text-slate-900 block mb-1 text-[11px] uppercase tracking-wider">
                          Morning
                        </span>
                        <p className="text-slate-600 leading-relaxed text-xs">
                          {day.morning}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50/60 border border-slate-200 rounded">
                        <span className="font-medium text-slate-900 block mb-1 text-[11px] uppercase tracking-wider">
                          Afternoon
                        </span>
                        <p className="text-slate-600 leading-relaxed text-xs">
                          {day.afternoon}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50/60 border border-slate-200 rounded">
                        <span className="font-medium text-slate-900 block mb-1 text-[11px] uppercase tracking-wider">
                          Evening
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

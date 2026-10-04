import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { destinationAPI, plannerAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

const BudgetCalculator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const [destinationId, setDestinationId] = useState("");
  const [numberOfNights, setNumberOfNights] = useState(3);
  const [priceTier, setPriceTier] = useState("mid-range");
  const [userLimit, setUserLimit] = useState(20000);

  const [costSheet, setCostSheet] = useState(null);
  const [calculating, setCalculating] = useState(false);

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

  const handleCalculate = async () => {
    if (!destinationId) return;

    setCalculating(true);
    try {
      const res = await plannerAPI.calculateBudget({
        destinationId,
        numberOfNights: parseInt(numberOfNights),
        priceTier,
      });
      setCostSheet(res.data.data);
    } catch (err) {
      console.error("Estimation calculation failed:", err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (destinationId) {
      handleCalculate();
    }
  }, [destinationId, numberOfNights, priceTier]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Budget Calculator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Estimate trip expenses based on duration, accommodation tier, and real-time regional indices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Parameters Column */}
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
            <div className="space-y-4 text-xs">
              {/* Destination Select */}
              <div>
                <label
                  htmlFor="budget-dest"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Destination
                </label>
                <select
                  id="budget-dest"
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

              {/* Number of Nights */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="budget-nights"
                    className="text-xs font-medium text-slate-700"
                  >
                    Stay Duration
                  </label>
                  <span className="text-xs font-semibold text-slate-900">
                    {numberOfNights} {numberOfNights === 1 ? "Night" : "Nights"}
                  </span>
                </div>
                <input
                  id="budget-nights"
                  type="range"
                  min="1"
                  max="14"
                  value={numberOfNights}
                  onChange={(e) => setNumberOfNights(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 night</span>
                  <span>14 nights</span>
                </div>
              </div>

              {/* Pricing Tier */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Accommodation Tier
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["budget", "mid-range", "luxury"].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setPriceTier(tier)}
                      className={`py-1.5 text-xs font-medium rounded border capitalize transition ${
                        priceTier === tier
                          ? "bg-slate-900 border-slate-900 text-white font-semibold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Budget Limit */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="budget-limit"
                    className="text-xs font-medium text-slate-700"
                  >
                    Budget Cap
                  </label>
                  <span className="text-xs font-semibold text-slate-900">
                    {userLimit.toLocaleString()} INR
                  </span>
                </div>
                <input
                  id="budget-limit"
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={userLimit}
                  onChange={(e) => setUserLimit(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5,000 INR</span>
                  <span>150,000 INR</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calculation Results Column */}
        <div className="lg:col-span-8 space-y-4">
          {calculating && (
            <div className="bg-white border border-slate-200 rounded-md p-10 text-center text-xs text-slate-500">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Recalculating budget breakdown...</span>
            </div>
          )}

          {!calculating && costSheet && (
            <div className="bg-white border border-slate-200 rounded-md p-5 space-y-5">
              {/* Summary Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {costSheet.destination} Cost Projection
                  </h3>
                  <span className="text-xs text-slate-500">
                    {numberOfNights} Nights &bull; <span className="capitalize">{priceTier}</span> accommodation
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Estimated Total
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {costSheet.estimatedTotal?.toLocaleString()} INR
                  </span>
                </div>
              </div>

              {/* Progress bar vs User limit */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="font-medium">Budget Utilization</span>
                  <span>
                    <strong>
                      {costSheet.estimatedTotal?.toLocaleString()}
                    </strong>{" "}
                    of <strong>{userLimit.toLocaleString()} INR</strong> (
                    {Math.round((costSheet.estimatedTotal / userLimit) * 100)}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    style={{
                      width: `${Math.min((costSheet.estimatedTotal / userLimit) * 100, 100)}%`,
                    }}
                    className={`h-full transition-all duration-300 ${
                      costSheet.estimatedTotal > userLimit
                        ? "bg-rose-600"
                        : "bg-emerald-600"
                    }`}
                  ></div>
                </div>

                {costSheet.estimatedTotal > userLimit && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                    <span>
                      Estimated expenses exceed your cap by{" "}
                      <strong>
                        {(
                          costSheet.estimatedTotal - userLimit
                        ).toLocaleString()}{" "}
                        INR
                      </strong>
                      . Consider adjusting night count or selecting a lower accommodation tier.
                    </span>
                  </div>
                )}
              </div>

              {/* Itemized Cost Breakdown Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                  Itemized Cost Breakdown
                </h4>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                      <tr>
                        <th className="py-2.5 px-3.5">Category</th>
                        <th className="py-2.5 px-3.5">Basis of Estimate</th>
                        <th className="py-2.5 px-3.5 text-right">
                          Estimated Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          Lodging / Accommodations
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500">
                          {numberOfNights} nights room rate
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-medium">
                          {costSheet.breakdown?.lodgingEstimate?.toLocaleString()}{" "}
                          INR
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          Meals &amp; Dining
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500">
                          Daily dining index for duration
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-medium">
                          {costSheet.breakdown?.mealsAllowance?.toLocaleString()}{" "}
                          INR
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          Transit &amp; Local Transportation
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500">
                          Local routes and connection fares
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-medium">
                          {costSheet.breakdown?.transportationEstimate?.toLocaleString()}{" "}
                          INR
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-slate-900">
                          Attractions &amp; Entry Fees
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500">
                          Sightseeing passes &amp; admissions
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-medium">
                          {costSheet.breakdown?.attractionsEntryFees?.toLocaleString()}{" "}
                          INR
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-semibold text-slate-900 border-t border-slate-200">
                        <td colSpan="2" className="py-2.5 px-3.5">
                          Total Estimate
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-xs">
                          {costSheet.estimatedTotal?.toLocaleString()} INR
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetCalculator;

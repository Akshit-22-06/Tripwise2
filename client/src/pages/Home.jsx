import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { destinationAPI } from "../services/api";
import DestinationCard from "../components/cards/DestinationCard";
import { Search } from "lucide-react";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");

  const categories = [
    { value: "", label: "All Categories" },
    { value: "historical", label: "Historical" },
    { value: "beach", label: "Beaches" },
    { value: "nature", label: "Nature" },
    { value: "adventure", label: "Adventure" },
    { value: "urban", label: "Urban Capitals" },
  ];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (category) params.category = category;
      if (rating) params.minRating = rating;

      const res = await destinationAPI.getAll(params);
      setItems(res.data.data || []);
    } catch (err) {
      setError("Unable to load destinations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category, rating]);

  const onSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleResetFilters = () => {
    setKeyword("");
    setCategory("");
    setRating("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Explore Destinations
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Search curated destinations, compare verified local services, and plan multi-day travel itineraries.
          </p>
        </div>

        {/* Quick Service Links */}
        <div className="flex flex-wrap gap-1.5 text-xs font-medium">
          <Link
            to="/planner"
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
          >
            Trip Planner
          </Link>
          <Link
            to="/budget-calculator"
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
          >
            Budget Calculator
          </Link>
          <Link
            to="/flights"
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
          >
            Flights
          </Link>
          <Link
            to="/trains"
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
          >
            Trains
          </Link>
          <Link
            to="/hotels"
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
          >
            Hotels
          </Link>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
        <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by destination name, city, or country..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded text-xs transition"
          >
            Search
          </button>
          {(keyword || category || rating) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium px-3.5 py-2 rounded text-xs transition"
            >
              Reset
            </button>
          )}
        </form>

        {/* Filter Badges & Rating */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                  category === cat.value
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <label
              htmlFor="rating-filter"
              className="text-slate-500 font-medium text-xs"
            >
              Min Rating:
            </label>
            <select
              id="rating-filter"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5 &amp; Above</option>
              <option value="4.0">4.0 &amp; Above</option>
              <option value="3.5">3.5 &amp; Above</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            {category
              ? `${categories.find((c) => c.value === category)?.label || "Filtered"} Destinations`
              : "All Destinations"}
          </h2>
          {!loading && !error && (
            <span className="text-xs text-slate-500">
              {items.length} {items.length === 1 ? "destination" : "destinations"} found
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            <div className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p>Loading destinations...</p>
          </div>
        ) : error ? (
          <div className="p-4 border border-rose-200 bg-rose-50 text-rose-800 rounded-md text-xs text-center space-y-1">
            <p className="font-medium">{error}</p>
            <button
              onClick={load}
              className="text-xs font-semibold text-rose-900 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center border border-slate-200 rounded-md bg-white p-6 space-y-2">
            <p className="text-sm font-medium text-slate-800">
              No destinations match your search.
            </p>
            <p className="text-xs text-slate-500">
              Try adjusting your search keyword or clearing the active filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { destinationAPI, reviewAPI, placesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import InteractiveMap from "../components/maps/InteractiveMap";
import ServiceCard from "../components/cards/ServiceCard";
import { Star, MapPin, ArrowLeft, Heart } from "lucide-react";

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, toggleWishlist, isWishlisted } = useAuth();
  const { setActiveBooking } = useBooking();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [poiCategory, setPoiCategory] = useState("");
  const [poiList, setPoiList] = useState([]);
  const [poiLoading, setPoiLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [files, setFiles] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const loadPOIs = async (category) => {
    if (!category || !data?.destination) {
      setPoiList([]);
      return;
    }
    setPoiLoading(true);
    try {
      const res = await placesAPI.discover({
        lat: data.destination.latitude,
        lng: data.destination.longitude,
        radius: 5000,
        category,
      });
      setPoiList(res.data.data || []);
    } catch (err) {
      console.error("Failed to load POIs:", err);
    } finally {
      setPoiLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const res = await destinationAPI.getById(id);
      setData(res.data.data);
    } catch (err) {
      setError("Unable to load destination details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onBook = (service) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setActiveBooking({
      service,
      bookingType: service.serviceType,
      totalCost:
        service.pricePerNight ||
        service.pricePerMeal ||
        service.hourlyRate ||
        500,
    });
    navigate("/booking-checkout");
  };

  const onAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setReviewSubmitting(true);
    setReviewError(null);

    try {
      const formData = new FormData();
      formData.append("targetId", data.destination._id);
      formData.append("targetType", "Destination");
      formData.append("rating", rating);
      formData.append("reviewText", reviewText.trim());

      for (const file of files) {
        formData.append("images", file);
      }

      await reviewAPI.create(formData);
      setReviewText("");
      setRating(5);
      setFiles([]);
      await loadData();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const onFileSelect = (e) => {
    setFiles(Array.from(e.target.files));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        <div className="inline-block w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p>Loading destination details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-rose-700 text-xs font-medium">
          {error || "Destination not found."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-slate-800 hover:underline text-xs font-medium"
        >
          &larr; Return to Destinations
        </button>
      </div>
    );
  }

  const { destination, reviews, services } = data;
  const wishlisted = isWishlisted(destination._id, "destinations");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Destinations
        </button>
      </div>

      {/* Main Details and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] w-full rounded-md overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={
                destination.images?.[0] ||
                "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
              }
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            {user && user.role === "traveler" && (
              <button
                type="button"
                onClick={() => toggleWishlist(destination._id, "destinations")}
                className="absolute top-3 right-3 p-1.5 bg-white/95 hover:bg-white rounded border border-slate-200 text-slate-500 hover:text-rose-600 transition"
                aria-label={
                  wishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={`h-4 w-4 ${
                    wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-500"
                  }`}
                />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center text-xs text-slate-500 space-x-1 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {destination.city}, {destination.country}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  {destination.name}
                </h1>
              </div>

              <div className="flex items-center bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-xs">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
                <span className="font-semibold text-slate-800">
                  {destination.avgRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-slate-400 ml-1 text-[11px]">
                  ({destination.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {destination.description}
            </p>
          </div>
        </div>

        {/* Right Column: Map and Nearby Points of Interest */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Interactive Map &amp; Points of Interest
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              {destination.latitude?.toFixed(4)}, {destination.longitude?.toFixed(4)}
            </span>
          </div>

          {/* Filter POI buttons */}
          <div className="flex flex-wrap gap-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setPoiCategory("");
                loadPOIs("");
              }}
              className={`px-2.5 py-1 rounded text-xs border transition ${
                !poiCategory
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Services
            </button>
            <button
              type="button"
              onClick={() => {
                setPoiCategory("tourism.attraction");
                loadPOIs("tourism.attraction");
              }}
              className={`px-2.5 py-1 rounded text-xs border transition ${
                poiCategory === "tourism.attraction"
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Attractions
            </button>
            <button
              type="button"
              onClick={() => {
                setPoiCategory("catering.restaurant");
                loadPOIs("catering.restaurant");
              }}
              className={`px-2.5 py-1 rounded text-xs border transition ${
                poiCategory === "catering.restaurant"
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Restaurants
            </button>
            <button
              type="button"
              onClick={() => {
                setPoiCategory("catering.cafe");
                loadPOIs("catering.cafe");
              }}
              className={`px-2.5 py-1 rounded text-xs border transition ${
                poiCategory === "catering.cafe"
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Cafes
            </button>
          </div>

          {/* Leaflet Map */}
          <div className="h-[260px] relative rounded-md overflow-hidden border border-slate-300">
            {poiLoading && (
              <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center text-xs text-slate-600">
                <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Finding nearby places...</span>
              </div>
            )}
            <InteractiveMap
              entities={[
                ...services,
                ...poiList.map((poi, idx) => ({
                  ...poi,
                  serviceType: "POI",
                  id: `poi-${idx}-${poi.latitude}`,
                })),
              ]}
              center={[destination.latitude, destination.longitude]}
              zoom={13}
              onBookService={onBook}
            />
          </div>

          {/* Discovered POIs list */}
          {!poiLoading && poiList.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-md p-3 max-h-[160px] overflow-y-auto">
              <h4 className="text-xs font-semibold text-slate-800 mb-2">
                Nearby Discovered Places ({poiList.length}):
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                {poiList.map((poi, idx) => (
                  <div
                    key={idx}
                    className="py-1.5 flex justify-between items-start gap-2"
                  >
                    <div>
                      <span className="font-medium text-slate-800 block text-xs">
                        {poi.name}
                      </span>
                      <span className="text-slate-400 text-[11px] block truncate max-w-[220px]">
                        {poi.address}
                      </span>
                    </div>
                    {poi.distance > 0 && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {(poi.distance / 1000).toFixed(1)} km
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local Bookable Services Section */}
      <section className="pt-6 border-t border-slate-200 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Local Bookable Services
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified hotels, dining options, and local guides registered for this location.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md p-8 text-center text-xs text-slate-500">
            No verified local services registered for this destination yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((serv) => (
              <ServiceCard key={serv._id} service={serv} onBook={onBook} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews and Ratings Section */}
      <section className="pt-6 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Write a Review */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Write a Review</h3>

          {user ? (
            <form
              onSubmit={onAddReview}
              className="bg-white border border-slate-200 rounded-md p-4 space-y-3.5 text-xs"
            >
              {reviewError && (
                <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs">
                  {reviewError}
                </div>
              )}

              {/* Star selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-slate-300 hover:text-amber-500 focus:outline-none"
                      aria-label={`${s} stars`}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          s <= rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-slate-700 ml-2">
                    {rating} / 5
                  </span>
                </div>
              </div>

              {/* Feedback text */}
              <div>
                <label
                  htmlFor="review-text"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Review Comments
                </label>
                <textarea
                  id="review-text"
                  required
                  rows="4"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your experience, sights, dining, or travel tips..."
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                ></textarea>
              </div>

              {/* Photos upload */}
              <div>
                <label
                  htmlFor="review-photos"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Attach Photos (optional)
                </label>
                <input
                  id="review-photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onFileSelect}
                  className="w-full text-xs text-slate-600 file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:text-xs file:font-medium hover:file:bg-slate-100 cursor-pointer"
                />
                {files.length > 0 && (
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {files.length} file(s) selected
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs transition disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting..." : "Post Review"}
              </button>
            </form>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md p-6 text-center text-xs text-slate-500 space-y-2">
              <p>Please sign in to write a review for this destination.</p>
              <Link
                to="/login"
                className="inline-block px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Traveler Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-md p-6 text-center text-xs text-slate-500">
              No reviews posted yet. Be the first to share your experience.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white border border-slate-200 rounded-md p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {rev.userId?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">
                          {rev.userId?.name || "Anonymous Traveler"}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-xs font-semibold text-slate-800">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
                      <span>{rev.rating?.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {rev.reviewText}
                  </p>

                  {rev.images?.length > 0 && (
                    <div className="flex gap-2 pt-1.5 overflow-x-auto">
                      {rev.images.map((imgUrl, idx) => (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-14 w-18 rounded border border-slate-200 overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={imgUrl}
                            alt="Review attachment"
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DestinationDetails;

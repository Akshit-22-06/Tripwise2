import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Star, MapPin } from 'lucide-react';

const DestinationCard = ({ destination }) => {
  const { user, toggleWishlist, isWishlisted } = useAuth();
  const wishlisted = isWishlisted(destination._id, 'destinations');

  const onToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(destination._id, 'destinations');
  };

  return (
    <article className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col h-full hover:border-slate-300 transition-colors">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={
            destination.images?.[0] ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'
          }
          alt={destination.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {destination.category && (
          <span className="absolute top-2.5 left-2.5 bg-white/95 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200 capitalize">
            {destination.category}
          </span>
        )}

        {user && user.role === 'traveler' && (
          <button
            type="button"
            onClick={onToggleWishlist}
            className="absolute top-2.5 right-2.5 p-1.5 bg-white/95 hover:bg-white rounded border border-slate-200 text-slate-500 hover:text-rose-600 transition-colors focus:outline-none"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                wishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
              }`}
            />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center text-xs text-slate-500 space-x-1 mb-1">
            <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {destination.city}, {destination.country}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1 mb-1">
            <Link to={`/destination/${destination._id}`} className="hover:text-blue-600">
              {destination.name}
            </Link>
          </h3>

          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-3">
            {destination.description}
          </p>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center text-xs text-slate-700">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
            <span className="font-semibold">{destination.avgRating?.toFixed(1) || '0.0'}</span>
            <span className="text-slate-400 text-[11px] ml-1">
              ({destination.totalReviews || 0})
            </span>
          </div>

          <Link
            to={`/destination/${destination._id}`}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
};

export default DestinationCard;

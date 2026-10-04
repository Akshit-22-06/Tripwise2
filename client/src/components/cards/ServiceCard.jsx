import React from 'react';
import { Star, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ServiceCard = ({ service, onBook }) => {
  const { user, toggleWishlist, isWishlisted } = useAuth();
  const wishlisted = isWishlisted(service._id, 'services');

  const getPricingLabel = () => {
    switch (service.serviceType) {
      case 'Hotel':
        return `${service.pricePerNight?.toLocaleString()} INR / night`;
      case 'Restaurant':
        return `${service.pricePerMeal?.toLocaleString()} INR / meal`;
      case 'TourGuide':
        return `${service.hourlyRate?.toLocaleString()} INR / hr`;
      default:
        return '';
    }
  };

  const getDetailsLabel = () => {
    switch (service.serviceType) {
      case 'Hotel':
        return service.amenities?.length
          ? `Amenities: ${service.amenities.slice(0, 3).join(', ')}`
          : 'Standard hotel accommodations';
      case 'Restaurant':
        return service.cuisineType ? `Cuisine: ${service.cuisineType}` : 'Dining service';
      case 'TourGuide':
        return service.languages?.length
          ? `Languages: ${service.languages.join(', ')}`
          : 'Professional guide service';
      default:
        return '';
    }
  };

  const onToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(service._id, 'services');
  };

  return (
    <article className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col h-full hover:border-slate-300 transition-colors">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={
            service.image ||
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80'
          }
          alt={service.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        <span className="absolute top-2.5 left-2.5 bg-white/95 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded border border-slate-200 capitalize">
          {service.serviceType}
        </span>

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
          <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-1 mb-1">
            {service.name}
          </h3>
          {service.priceRange && (
            <p className="text-xs text-slate-500 mb-1.5">Tier: {service.priceRange}</p>
          )}
          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-3">
            {getDetailsLabel()}
          </p>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Rate</span>
            <span className="text-xs font-semibold text-slate-900">{getPricingLabel()}</span>
          </div>

          {onBook ? (
            <button
              type="button"
              onClick={() => onBook(service)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
            >
              Book Service
            </button>
          ) : (
            <div className="flex items-center text-xs font-semibold text-slate-700">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
              <span>{service.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;

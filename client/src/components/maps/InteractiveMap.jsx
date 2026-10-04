import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createMarkerIcon = (color) => {
  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">
        <span style="display: block; width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; border: 2px solid #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.25);"></span>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

const InteractiveMap = ({
  entities = [],
  center = [35.0116, 135.7681],
  zoom = 13,
  onBookService,
}) => {
  const getMarkerColor = (type) => {
    switch (type) {
      case 'Hotel':
        return '#0284c7';
      case 'Restaurant':
        return '#ea580c';
      case 'TourGuide':
        return '#7c3aed';
      case 'POI':
        return '#059669';
      default:
        return '#dc2626';
    }
  };

  return (
    <div className="h-full w-full rounded-md overflow-hidden border border-slate-300 min-h-[320px]">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {entities.map((entity) => {
          const lat =
            entity.latitude ||
            (entity.location?.coordinates && entity.location.coordinates[1]);
          const lng =
            entity.longitude ||
            (entity.location?.coordinates && entity.location.coordinates[0]);

          if (!lat || !lng) return null;

          const color = getMarkerColor(entity.serviceType || 'Destination');
          const markerIcon = createMarkerIcon(color);

          return (
            <Marker key={entity._id || entity.id} position={[lat, lng]} icon={markerIcon}>
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <div className="font-semibold text-slate-900 text-xs mb-1">
                    {entity.name}
                  </div>

                  {entity.serviceType && (
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded mb-1 capitalize">
                      {entity.serviceType}
                    </span>
                  )}

                  <p className="text-slate-600 mb-2 text-[11px]">
                    {entity.city || entity.address || entity.priceRange || ''}
                  </p>

                  {entity.serviceType && entity.serviceType !== 'POI' && (
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center gap-2">
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {entity.serviceType === 'Hotel' && `${entity.pricePerNight} INR/N`}
                        {entity.serviceType === 'Restaurant' && `${entity.pricePerMeal} INR/M`}
                        {entity.serviceType === 'TourGuide' && `${entity.hourlyRate} INR/H`}
                      </span>
                      {onBookService && (
                        <button
                          type="button"
                          onClick={() => onBookService(entity)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium py-1 px-2.5 rounded transition"
                        >
                          Book
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;

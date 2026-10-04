const axios = require('axios');
require('dotenv').config();

// Realistic mock points of interest for offline development / viva demonstrations
const getMockPlaces = (latitude, longitude, category) => {
  return [
    {
      name: 'Historic Heritage Monument & Museum',
      category: 'tourism.attraction',
      address: 'Central Heritage District',
      latitude: latitude + 0.005,
      longitude: longitude + 0.005,
      distance: 650,
      averageRating: 4.8,
      priceRange: '$$',
    },
    {
      name: 'Scenic Panoramic Viewpoint & Botanical Gardens',
      category: 'tourism.sights',
      address: 'Hillside Green Promenade',
      latitude: latitude - 0.006,
      longitude: longitude + 0.004,
      distance: 1200,
      averageRating: 4.7,
      priceRange: '$',
    },
    {
      name: 'Cultural Arts Center & Traditional Bazaar',
      category: 'commercial.marketplace',
      address: 'Old Town Square',
      latitude: latitude + 0.003,
      longitude: longitude - 0.005,
      distance: 850,
      averageRating: 4.6,
      priceRange: '$$',
    },
    {
      name: 'Riverside Waterfront Walkway & Cafes',
      category: 'catering.restaurant',
      address: 'Riverbank Boulevard',
      latitude: latitude - 0.002,
      longitude: longitude - 0.003,
      distance: 400,
      averageRating: 4.5,
      priceRange: '$$',
    },
  ];
};

const getNearbyAttractions = async ({ latitude, longitude, radiusMeters = 5000, category = 'tourism.attraction' }) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey || apiKey.includes('your_geoapify_api_key')) {
    return getMockPlaces(latitude, longitude, category);
  }

  try {
    const response = await axios.get('https://api.geoapify.com/v2/places', {
      params: {
        categories: category,
        filter: `circle:${longitude},${latitude},${radiusMeters}`,
        bias: `proximity:${longitude},${latitude}`,
        limit: 10,
        apiKey,
      },
    });

    const features = response.data?.features || [];
    if (features.length === 0) {
      return getMockPlaces(latitude, longitude, category);
    }

    return features.map((f) => {
      const prop = f.properties;
      const coords = f.geometry.coordinates;
      return {
        name: prop.name || prop.street || 'Point of Interest',
        category: prop.categories?.[0] || category,
        address: prop.formatted || 'Local attraction address',
        latitude: coords[1],
        longitude: coords[0],
        distance: prop.distance || 500,
        averageRating: 4.5,
        priceRange: '$$',
      };
    });
  } catch (err) {
    console.warn('Geoapify Places API lookup failed, falling back to mock attractions:', err.message);
    return getMockPlaces(latitude, longitude, category);
  }
};

const searchPlacesByKeyword = async ({ query, limit = 5 }) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey || apiKey.includes('your_geoapify_api_key')) {
    return [
      {
        name: query,
        city: 'Destination City',
        country: 'Travel Region',
        latitude: 28.6139,
        longitude: 77.2090,
      },
    ];
  }

  try {
    const response = await axios.get('https://api.geoapify.com/v1/geocode/search', {
      params: {
        text: query,
        limit,
        apiKey,
      },
    });

    const features = response.data?.features || [];
    return features.map((f) => {
      const prop = f.properties;
      const coords = f.geometry.coordinates;
      return {
        name: prop.formatted,
        city: prop.city,
        country: prop.country,
        latitude: coords[1],
        longitude: coords[0],
      };
    });
  } catch (err) {
    console.warn('Geoapify Geocoding API lookup failed, using fallback coordinate:', err.message);
    return [
      {
        name: query,
        city: 'Destination City',
        country: 'Travel Region',
        latitude: 28.6139,
        longitude: 77.2090,
      },
    ];
  }
};

module.exports = {
  getNearbyAttractions,
  searchPlacesByKeyword,
};

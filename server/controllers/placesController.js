const { getNearbyAttractions, searchPlacesByKeyword } = require('../services/placesService');

const discoverPlacesController = async (req, res, next) => {
  const { lat, lng, radius, category } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'lat and lng parameters are required.',
    });
  }

  try {
    const places = await getNearbyAttractions({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radiusMeters: radius ? parseInt(radius) : 5000,
      category: category || 'tourism.attraction',
    });

    res.status(200).json({
      success: true,
      data: places,
    });
  } catch (err) {
    next(err);
  }
};

const geocodeKeywordController = async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'query parameter is required for geocoding.',
    });
  }

  try {
    const results = await searchPlacesByKeyword({ query });
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  discoverPlacesController,
  geocodeKeywordController,
};

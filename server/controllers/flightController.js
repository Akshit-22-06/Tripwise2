const { searchFlights } = require('../services/flightService');

// @desc    Search flights by origin, destination, and departure date
// @route   GET /api/flights/search
// @access  Private
const searchFlightsController = async (req, res, next) => {
  const { origin, destination, departureDate, adults, travelClass } = req.query;

  if (!origin || !destination || !departureDate) {
    return res.status(400).json({
      success: false,
      message: 'Origin, destination, and departureDate are required queries.',
    });
  }

  try {
    const flights = await searchFlights({
      origin,
      destination,
      departureDate,
      adults: adults ? parseInt(adults) : 1,
      travelClass: travelClass || 'ECONOMY',
    });

    res.status(200).json({
      success: true,
      data: flights,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchFlightsController,
};

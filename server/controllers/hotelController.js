const { searchHotels } = require('../services/hotelService');

// @desc    Search hotels by city code, check-in, check-out, and rooms
// @route   GET /api/hotels/search
// @access  Private
const searchHotelsController = async (req, res, next) => {
  const { cityCode, checkInDate, checkOutDate, roomQuantity } = req.query;

  if (!cityCode || !checkInDate || !checkOutDate) {
    return res.status(400).json({
      success: false,
      message: 'cityCode, checkInDate, and checkOutDate are required queries.',
    });
  }

  try {
    const hotels = await searchHotels({
      cityCode,
      checkInDate,
      checkOutDate,
      roomQuantity: roomQuantity ? parseInt(roomQuantity) : 1,
    });

    res.status(200).json({
      success: true,
      data: hotels,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchHotelsController,
};

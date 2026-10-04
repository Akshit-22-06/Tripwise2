const { searchTrains } = require('../services/transitService');

const searchTrainsController = async (req, res, next) => {
  const { sourceCode, destinationCode, travelDate } = req.query;

  if (!sourceCode || !destinationCode || !travelDate) {
    return res.status(400).json({
      success: false,
      message: 'sourceCode, destinationCode, and travelDate are required queries.',
    });
  }

  try {
    const trains = await searchTrains({
      sourceCode,
      destinationCode,
      travelDate,
    });

    res.status(200).json({
      success: true,
      data: trains,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchTrainsController,
};

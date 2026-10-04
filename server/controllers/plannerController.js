const Itinerary = require('../models/Itinerary');
const Destination = require('../models/Destination');
const { generateLiveItinerary } = require('../services/geminiService');

exports.generateTrip = async (req, res, next) => {
  try {
    const { destinationId, totalDays, targetBudget, travelStyle, preferences } = req.body;

    if (!destinationId || !totalDays || !targetBudget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide destinationId, totalDays, and targetBudget',
      });
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Selected destination not found' });
    }

    const itineraryData = await generateLiveItinerary({
      destination: `${destination.name}, ${destination.city}`,
      durationDays: parseInt(totalDays),
      budgetTier: targetBudget > 50000 ? 'Luxury' : targetBudget > 20000 ? 'Mid-range' : 'Budget',
      travelStyle: travelStyle || 'urban',
      preferences: preferences || [],
    });

    res.status(200).json({
      success: true,
      data: {
        destinationId: destination._id,
        destinationName: destination.name,
        totalDays: itineraryData.totalDays || totalDays,
        targetBudget: itineraryData.targetBudget || targetBudget,
        estimatedCost: itineraryData.totalEstimatedCost || itineraryData.estimatedCost,

        dayPlans: (itineraryData.dailySchedule || itineraryData.dayPlans || []).map((day) => ({
          dayNumber: day.dayNumber,
          morning: typeof day.morning === 'object' ? day.morning.activity : day.morning,
          afternoon: typeof day.afternoon === 'object' ? day.afternoon.activity : day.afternoon,
          evening: typeof day.evening === 'object' ? day.evening.activity : day.evening,
          dailyEstimatedCost: day.dailyTotal || day.dailyEstimatedCost || 0,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.calculateBudgetBreakdown = async (req, res, next) => {
  try {
    const { destinationId, numberOfNights, travelStyle, priceTier } = req.body;

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const tiers = {
      budget: { lodgingMultiplier: 1200, mealMultiplier: 400, transitMultiplier: 800 },
      'mid-range': { lodgingMultiplier: 3500, mealMultiplier: 900, transitMultiplier: 2500 },
      luxury: { lodgingMultiplier: 9000, mealMultiplier: 2200, transitMultiplier: 7000 },
    };

    const multiplier = tiers[priceTier] || tiers['mid-range'];
    const nights = parseInt(numberOfNights) || 3;

    const hotelCost = multiplier.lodgingMultiplier * nights;
    const foodCost = multiplier.mealMultiplier * 3 * (nights + 1);
    const transitCost = multiplier.transitMultiplier;
    const attractionFees = priceTier === 'luxury' ? 1500 : priceTier === 'mid-range' ? 600 : 150;
    
    const totalEstimate = hotelCost + foodCost + transitCost + attractionFees;

    res.status(200).json({
      success: true,
      data: {
        destination: destination.name,
        priceTier: priceTier || 'mid-range',
        breakdown: {
          lodgingEstimate: hotelCost,
          mealsAllowance: foodCost,
          transportationEstimate: transitCost,
          attractionsEntryFees: attractionFees,
        },
        estimatedTotal: totalEstimate,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.saveItinerary = async (req, res, next) => {
  try {
    const { destinationId, totalDays, targetBudget, estimatedCost, dayPlans } = req.body;

    const itinerary = await Itinerary.create({
      userId: req.user.id,
      destinationId,
      totalDays,
      targetBudget,
      estimatedCost,
      dayPlans,
      isSaved: true,
    });

    res.status(201).json({
      success: true,
      message: 'Itinerary saved successfully!',
      data: itinerary,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserItineraries = async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user.id })
      .populate('destinationId', 'name city country images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: itineraries.length,
      data: itineraries,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Itinerary deleted successfully' });
  } catch (err) {
    next(err);
  }
};

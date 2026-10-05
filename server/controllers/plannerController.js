const Itinerary = require('../models/Itinerary');
const Destination = require('../models/Destination');
const { planTrip } = require('../services/tripPlannerService');

// @desc    Generate dynamic trip using real flight, train, hotel, places, and AI scheduling
// @route   POST /api/planner/generate
// @access  Private
exports.generateTrip = async (req, res, next) => {
  try {
    const {
      destination,
      destinationId,
      startingLocation,
      startDate,
      totalDays,
      travelers,
      targetBudget,
      travelStyle,
      preferences,
    } = req.body;

    if (!destination && !destinationId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a destination (city name or destinationId)',
      });
    }

    if (!totalDays || !targetBudget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide totalDays and targetBudget',
      });
    }

    const tripPlan = await planTrip({
      destination,
      destinationId,
      startingLocation,
      startDate,
      totalDays: parseInt(totalDays, 10),
      travelers: parseInt(travelers, 10) || 1,
      targetBudget: parseFloat(targetBudget),
      travelStyle,
      preferences,
    });

    res.status(200).json({
      success: true,
      data: {
        destinationId: tripPlan.destination.id,
        destinationName: tripPlan.destination.name,
        destination: tripPlan.destination,
        startingLocation: tripPlan.startingLocation,
        startDate: tripPlan.startDate,
        totalDays: tripPlan.totalDays,
        travelers: tripPlan.travelers,
        travelStyle: tripPlan.travelStyle,
        targetBudget: tripPlan.budgetBreakdown.userBudget,
        estimatedCost: tripPlan.budgetBreakdown.estimatedTotalCost,
        transportation: tripPlan.transportation,
        accommodation: tripPlan.accommodation,
        places: tripPlan.places,
        tourismServices: tripPlan.tourismServices,
        budgetBreakdown: tripPlan.budgetBreakdown,
        dayPlans: tripPlan.dayPlans,
        bookingPayloads: tripPlan.bookingPayloads,
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
    const {
      destinationId,
      destinationName,
      startingLocation,
      totalDays,
      travelers,
      travelStyle,
      targetBudget,
      estimatedCost,
      dayPlans,
      transportation,
      accommodation,
      budgetBreakdown,
    } = req.body;

    const itinerary = await Itinerary.create({
      userId: req.user.id,
      destinationId: destinationId || null,
      destinationName: destinationName || '',
      startingLocation: startingLocation || '',
      totalDays: totalDays || 3,
      travelers: travelers || 1,
      travelStyle: travelStyle || 'standard',
      targetBudget: targetBudget || 0,
      estimatedCost: estimatedCost || 0,
      transportation: transportation || null,
      accommodation: accommodation || null,
      budgetBreakdown: budgetBreakdown || null,
      dayPlans: dayPlans || [],
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

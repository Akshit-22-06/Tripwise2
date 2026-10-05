const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  morning: {
    type: String,
    required: true,
  },
  afternoon: {
    type: String,
    required: true,
  },
  evening: {
    type: String,
    required: true,
  },
  dailyEstimatedCost: {
    type: Number,
    default: 0,
  },
});

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: false,
    },
    destinationName: {
      type: String,
      default: '',
    },
    startingLocation: {
      type: String,
      default: '',
    },
    travelers: {
      type: Number,
      default: 1,
    },
    travelStyle: {
      type: String,
      default: 'Standard',
    },
    totalDays: {
      type: Number,
      required: true,
    },
    targetBudget: {
      type: Number,
      required: true,
    },
    estimatedCost: {
      type: Number,
      required: true,
    },
    transportation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    accommodation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    budgetBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    dayPlans: [dayPlanSchema],
    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);

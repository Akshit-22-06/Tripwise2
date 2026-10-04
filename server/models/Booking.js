const mongoose = require('mongoose');

/**
 * Clean, unified Booking Model.
 * Represents all reservation types (Flight, Train, Hotel, TourGuide, Restaurant).
 * Detailed metadata (e.g. flight numbers, room types, berth numbers) is stored cleanly in `details`.
 */
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourismService',
      default: null,
    },
    bookingType: {
      type: String,
      required: [true, 'Booking category is required'],
      enum: ['Flight', 'Train', 'Hotel', 'TourGuide', 'Restaurant'],
    },
    totalCost: {
      type: Number,
      required: [true, 'Total cost is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      default: 'PENDING',
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = {
  Booking,
};

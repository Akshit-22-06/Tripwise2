const mongoose = require('mongoose');
const { Booking } = require('../models/Booking');

// @desc    Initiate a new booking
// @route   POST /api/bookings/create
// @access  Private (Traveler)
exports.createBooking = async (req, res, next) => {
  try {
    const { bookingType, serviceId, totalCost, details } = req.body;

    if (!bookingType || totalCost === undefined || totalCost === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingType and totalCost',
      });
    }

    const isValidServiceId = serviceId && mongoose.Types.ObjectId.isValid(serviceId);

    const booking = await Booking.create({
      userId: req.user.id,
      serviceId: isValidServiceId ? serviceId : null,
      bookingType,
      totalCost: Number(totalCost),
      details: details || {},
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Reservation initiated successfully',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Fetch all bookings for the logged-in user
// @route   GET /api/bookings/user
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('serviceId', 'name priceRange averageRating image city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Fetch single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user.id }, { role: 'admin' }],
    }).populate('serviceId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel an existing booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

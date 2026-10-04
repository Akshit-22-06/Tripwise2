const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const destinationRoutes = require('./destinationRoutes');
const plannerRoutes = require('./plannerRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const reviewRoutes = require('./reviewRoutes');
const businessRoutes = require('./businessRoutes');
const adminRoutes = require('./adminRoutes');
const flightRoutes = require('./flightRoutes');
const trainRoutes = require('./trainRoutes');
const hotelRoutes = require('./hotelRoutes');
const placesRoutes = require('./placesRoutes');

router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/planner', plannerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/business', businessRoutes);
router.use('/admin', adminRoutes);
router.use('/flights', flightRoutes);
router.use('/trains', trainRoutes);
router.use('/hotels', hotelRoutes);
router.use('/places', placesRoutes);

module.exports = router;

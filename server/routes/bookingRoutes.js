const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/create', createBooking);
router.get('/user', getUserBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);

module.exports = router;

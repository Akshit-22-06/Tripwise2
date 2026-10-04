const express = require('express');
const router = express.Router();
const { searchFlightsController } = require('../controllers/flightController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/search', protect, searchFlightsController);

module.exports = router;

const express = require('express');
const router = express.Router();
const { discoverPlacesController, geocodeKeywordController } = require('../controllers/placesController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/discover', protect, discoverPlacesController);
router.get('/geocode', protect, geocodeKeywordController);

module.exports = router;

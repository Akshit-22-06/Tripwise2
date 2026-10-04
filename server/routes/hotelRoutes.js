const express = require('express');
const router = express.Router();
const { searchHotelsController } = require('../controllers/hotelController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/search', protect, searchHotelsController);

module.exports = router;

const express = require('express');
const router = express.Router();
const { searchTrainsController } = require('../controllers/trainController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/search', protect, searchTrainsController);

module.exports = router;

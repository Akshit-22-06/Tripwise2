const express = require('express');
const router = express.Router();
const { createReview, getReviewsForTarget, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

router.get('/:targetId', getReviewsForTarget);

router.post('/', protect, upload.array('images', 5), createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

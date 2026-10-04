const Review = require('../models/Review');
const { uploadImage } = require('../middlewares/uploadMiddleware');

exports.createReview = async (req, res, next) => {
  try {
    const { targetType, targetId, rating, reviewText } = req.body;

    if (!targetType || !targetId || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide targetType, targetId, rating, and reviewText',
      });
    }

    const reviewExists = await Review.findOne({ userId: req.user.id, targetId });
    if (reviewExists) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this entity',
      });
    }

    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        if (url) imageUrls.push(url);
      }
    }

    const review = await Review.create({
      userId: req.user.id,
      targetType,
      targetId,
      rating: parseFloat(rating),
      reviewText,
      images: imageUrls,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

exports.getReviewsForTarget = async (req, res, next) => {
  try {
    const { targetId } = req.params;

    const reviews = await Review.find({ targetId })
      .populate('userId', 'name profile_image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized action' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review successfully removed',
    });
  } catch (err) {
    next(err);
  }
};

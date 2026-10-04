const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['Destination', 'TourismService'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: [true, 'Please provide a review text'],
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ userId: 1, targetId: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (targetId, targetType) {
  const stats = await this.aggregate([
    {
      $match: { targetId: targetId, targetType: targetType },
    },
    {
      $group: {
        _id: '$targetId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const avgRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const totalReviews = stats.length > 0 ? stats[0].nRating : 0;

  if (targetType === 'Destination') {
    const Destination = mongoose.model('Destination');
    await Destination.findByIdAndUpdate(targetId, {
      avgRating,
      totalReviews,
    });
  } else if (targetType === 'TourismService') {
    const TourismService = mongoose.model('TourismService');
    await TourismService.findByIdAndUpdate(targetId, {
      averageRating: avgRating,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.targetId, this.targetType);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.targetId, doc.targetType);
  }
});

module.exports = mongoose.model('Review', reviewSchema);

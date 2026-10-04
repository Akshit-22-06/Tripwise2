const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude coordinate is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude coordinate is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    category: {
      type: String,
      enum: ['historical', 'beach', 'nature', 'adventure', 'urban'],
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

destinationSchema.index({ location: '2dsphere' });

destinationSchema.index({ name: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);

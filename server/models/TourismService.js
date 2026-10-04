const mongoose = require('mongoose');

const options = {
  discriminatorKey: 'serviceType',
  timestamps: true,
};

const tourismServiceSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    priceRange: {
      type: String,
      required: [true, 'Price range is required'],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
  },
  options
);

tourismServiceSchema.index({ location: '2dsphere' });

const TourismService = mongoose.model('TourismService', tourismServiceSchema);

const Hotel = TourismService.discriminator(
  'Hotel',
  new mongoose.Schema({
    roomTypes: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required for hotel listings'],
    },
  })
);

const Restaurant = TourismService.discriminator(
  'Restaurant',
  new mongoose.Schema({
    cuisineType: {
      type: String,
      required: [true, 'Cuisine type is required for restaurant listings'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity size is required for restaurant listings'],
    },
    pricePerMeal: {
      type: Number,
      required: [true, 'Average price per meal is required for restaurant listings'],
    },
  })
);

const TourGuide = TourismService.discriminator(
  'TourGuide',
  new mongoose.Schema({
    languages: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required for tour guides'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization description is required for tour guides'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  })
);

module.exports = {
  TourismService,
  Hotel,
  Restaurant,
  TourGuide,
};

const Destination = require('../models/Destination');
const { TourismService } = require('../models/TourismService');
const Review = require('../models/Review');

exports.getDestinations = async (req, res, next) => {
  try {
    const { keyword, category, minRating } = req.query;
    let query = {};

    if (keyword) {
      query.$or = [
        { $text: { $search: keyword } },
        { name: { $regex: keyword, $options: 'i' } },
        { city: { $regex: keyword, $options: 'i' } },
        { country: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minRating) {
      query.avgRating = { $gte: parseFloat(minRating) };
    }

    const destinations = await Destination.find(query);

    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDestinationById = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const reviews = await Review.find({ targetId: destination._id, targetType: 'Destination' })
      .populate('userId', 'name profile_image')
      .sort({ createdAt: -1 });

    const radiusRad = 50 / 6378.1;
    const nearbyServices = await TourismService.find({
      location: {
        $geoWithin: {
          $centerSphere: [[destination.longitude, destination.latitude], radiusRad],
        },
      },
      isVerified: true,
    }).populate('ownerId', 'name');

    res.status(200).json({
      success: true,
      data: {
        destination,
        reviews,
        services: nearbyServices,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getNearbyEntities = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng query coordinates' });
    }

    const radiusKm = parseFloat(radius) || 15;
    const radiusRad = radiusKm / 6378.1;

    const destinations = await Destination.find({
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusRad],
        },
      },
    });

    const services = await TourismService.find({
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusRad],
        },
      },
      isVerified: true,
    });

    res.status(200).json({
      success: true,
      coordinates: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
      radiusKm,
      destinations,
      services,
    });
  } catch (err) {
    next(err);
  }
};

exports.createDestination = async (req, res, next) => {
  try {
    const { name, city, country, description, latitude, longitude, category, images } = req.body;

    const destination = await Destination.create({
      name,
      city,
      country,
      description,
      latitude,
      longitude,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      category,
      images: images || [],
    });

    res.status(201).json({
      success: true,
      data: destination,
    });
  } catch (err) {
    next(err);
  }
};

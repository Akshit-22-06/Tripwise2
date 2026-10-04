const { TourismService, Hotel, Restaurant, TourGuide } = require('../models/TourismService');
const { Booking } = require('../models/Booking');
const { uploadImage } = require('../middlewares/uploadMiddleware');

exports.getDashboard = async (req, res, next) => {
  try {

    const services = await TourismService.find({ ownerId: req.user.id });
    const serviceIds = services.map((s) => s._id);

    const bookings = await Booking.find({ serviceId: { $in: serviceIds } })
      .populate('userId', 'name email profile_image')
      .populate('serviceId', 'name serviceType')
      .sort({ createdAt: -1 });

    const totalBookingsCount = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
    const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
    
    const grossRevenue = confirmedBookings.reduce((acc, curr) => acc + curr.totalCost, 0);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalServicesListed: services.length,
          totalReservations: totalBookingsCount,
          activeReservations: confirmedBookings.length,
          pendingReservations: pendingBookings.length,
          cancelledReservations: cancelledBookings.length,
          grossRevenue,
        },
        services,
        bookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createListing = async (req, res, next) => {
  try {
    const { serviceType, name, priceRange, latitude, longitude, details } = req.body;

    if (!serviceType || !name || !priceRange || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceType, name, priceRange, latitude, and longitude',
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    const basePayload = {
      ownerId: req.user.id,
      name,
      priceRange,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      image: imageUrl,
      isVerified: false,
    };

    const detailsObj = typeof details === 'string' ? JSON.parse(details) : (details || {});
    let newService;

    switch (serviceType) {
      case 'Hotel':
        newService = new Hotel({
          ...basePayload,
          roomTypes: detailsObj.roomTypes || [],
          amenities: detailsObj.amenities || [],
          pricePerNight: parseFloat(detailsObj.pricePerNight),
        });
        break;

      case 'Restaurant':
        newService = new Restaurant({
          ...basePayload,
          cuisineType: detailsObj.cuisineType,
          capacity: parseInt(detailsObj.capacity),
          pricePerMeal: parseFloat(detailsObj.pricePerMeal),
        });
        break;

      case 'TourGuide':
        newService = new TourGuide({
          ...basePayload,
          languages: detailsObj.languages || [],
          hourlyRate: parseFloat(detailsObj.hourlyRate),
          specialization: detailsObj.specialization,
          isAvailable: detailsObj.isAvailable !== undefined ? detailsObj.isAvailable : true,
        });
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid serviceType type' });
    }

    await newService.save();

    res.status(201).json({
      success: true,
      message: 'Service listing submitted successfully. Awaiting administrator verification.',
      data: newService,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyServices = async (req, res, next) => {
  try {
    const services = await TourismService.find({ ownerId: req.user.id });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    let service = await TourismService.findOne({ _id: req.params.id, ownerId: req.user.id });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Listing not found or unauthorized' });
    }

    if (req.file) {
      req.body.image = await uploadImage(req.file);
    }

    if (req.body.latitude || req.body.longitude) {
      const lat = req.body.latitude ? parseFloat(req.body.latitude) : service.latitude;
      const lng = req.body.longitude ? parseFloat(req.body.longitude) : service.longitude;
      req.body.location = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }

    const serviceUpdated = await TourismService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: serviceUpdated,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteListing = async (req, res, next) => {
  try {
    const service = await TourismService.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Listing not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Listing removed successfully' });
  } catch (err) {
    next(err);
  }
};

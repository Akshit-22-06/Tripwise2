const User = require('../models/User');
const { TourismService } = require('../models/TourismService');
const { Booking } = require('../models/Booking');
const BusinessVerification = require('../models/BusinessVerification');
const Review = require('../models/Review');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserSuspension = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend an administrative account' });
    }

    user.is_verified = !user.is_verified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated. Email Verified = ${user.is_verified}`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPendingVerifications = async (req, res, next) => {
  try {
    const verifications = await BusinessVerification.find({ status: 'PENDING' })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: 1 });

    const services = await TourismService.find({ isVerified: false })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: verifications.length + services.length,
      data: {
        verifications,
        services,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.processVerification = async (req, res, next) => {
  try {
    const { verificationId, serviceId, status, notes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status target' });
    }

    // Process single TourismService listing review
    if (serviceId) {
      if (status === 'APPROVED') {
        const service = await TourismService.findByIdAndUpdate(
          serviceId,
          { isVerified: true },
          { new: true }
        );
        return res.status(200).json({
          success: true,
          message: 'Service listing verified and published successfully',
          data: service,
        });
      } else {
        const service = await TourismService.findByIdAndDelete(serviceId);
        return res.status(200).json({
          success: true,
          message: 'Service listing rejected and removed',
          data: service,
        });
      }
    }

    // Process merchant organization verification
    const verification = await BusinessVerification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    verification.status = status;
    verification.notes = notes || '';
    await verification.save();

    if (status === 'APPROVED') {
      await TourismService.updateMany({ ownerId: verification.ownerId }, { isVerified: true });
    }

    res.status(200).json({
      success: true,
      message: `Merchant verification status set to ${status}`,
      data: verification,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReviewOverride = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await Review.calculateAverageRating(review.targetId, review.targetType);

    res.status(200).json({
      success: true,
      message: 'Review deleted and aggregate ratings updated by Administrator override',
    });
  } catch (err) {
    next(err);
  }
};

exports.getSystemReports = async (req, res, next) => {
  try {

    const totalUsers = await User.countDocuments();
    const travelersCount = await User.countDocuments({ role: 'traveler' });
    const merchantsCount = await User.countDocuments({ role: 'business_owner' });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.find({ status: 'CONFIRMED' });
    const netRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalCost, 0);

    const totalServices = await TourismService.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        timestamp: new Date(),
        platformMetrics: {
          totalUsers,
          travelersCount,
          merchantsCount,
          totalServicesListed: totalServices,
          totalTransactionsCount: totalBookings,
          completedTransactionsCount: confirmedBookings.length,
          totalPlatformRevenue: netRevenue,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

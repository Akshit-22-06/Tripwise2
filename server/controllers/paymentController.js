const Payment = require('../models/Payment');
const { Booking } = require('../models/Booking');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const { sendBookingInvoice } = require('../services/emailService');
const Notification = require('../models/Notification');

exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'Booking is already confirmed and paid' });
    }

    const orderData = await createRazorpayOrder(booking._id, booking.totalCost);

    if (!orderData.success) {
      return res.status(500).json({ success: false, message: 'Could not create checkout order' });
    }

    await Payment.create({
      bookingId: booking._id,
      userId: req.user.id,
      razorpayOrderId: orderData.orderId,
      amount: booking.totalCost,
      status: 'INITIATED',
    });

    res.status(200).json({
      success: true,
      orderId: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      key: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
      isMock: orderData.isMock,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      await Payment.findOneAndUpdate({ razorpayOrderId }, { status: 'FAILED' });
      return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'SUCCESS',
      }
    );

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'CONFIRMED' },
      { new: true }
    ).populate('userId', 'email name');

    const alertMessage = `Your booking for ${booking.bookingType} (ID: ${booking._id}) has been CONFIRMED. Total: ${booking.totalCost} INR.`;
    await Notification.create({
      userId: booking.userId._id,
      message: alertMessage,
      type: 'PAYMENT',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(booking.userId._id.toString()).emit('notification', {
        message: alertMessage,
        type: 'PAYMENT',
        createdAt: new Date(),
      });
    }

    try {
      await sendBookingInvoice(booking.userId.email, booking);
    } catch (emailErr) {
      console.warn('WARNING: Failed to send booking invoice email:', emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment successfully processed and verified',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

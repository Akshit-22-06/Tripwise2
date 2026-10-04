const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const createRazorpayOrder = async (bookingId, amount) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.trim() === '' || keySecret.trim() === '') {
    console.warn('WARNING: Razorpay credentials missing. Activating Mock/Sandbox Payment Checkout.');
    return {
      success: true,
      orderId: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      key: 'mock_key_id',
      isMock: true,
    };
  }

  try {
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_booking_${bookingId}`,
    };

    const order = await instance.orders.create(options);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      isMock: false,
    };
  } catch (err) {
    console.error('Razorpay order creation failure:', err.message);
    throw new Error(`Razorpay transaction creation failed: ${err.message}`);
  }
};

const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret || keySecret.trim() === '' || (orderId && orderId.startsWith('order_mock_'))) {
    console.log('Validating mock payment signature...');
    return true;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (err) {
    console.error('Cryptographic signature verification error:', err.message);
    return false;
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
};

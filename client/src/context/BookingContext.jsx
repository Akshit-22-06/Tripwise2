import React, { createContext, useState, useContext } from 'react';
import { bookingAPI, paymentAPI } from '../services/api';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingType, serviceId, totalCost, details) => {
    setLoading(true);
    try {
      const res = await bookingAPI.create({
        bookingType,
        serviceId,
        totalCost,
        details,
      });
      setActiveBooking(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setLoading(true);
    try {
      await bookingAPI.cancel(bookingId);
      await fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processPaymentCheckout = async (bookingId, callbackSuccess) => {
    try {
      const orderRes = await paymentAPI.createOrder(bookingId);
      const { orderId, amount, currency, key, isMock } = orderRes.data;

      if (isMock) {

        console.log('Simulating local payment signature generation...');
        const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
        const mockSignature = `sig_mock_${Math.random().toString(36).substr(2, 9)}`;

        const verifyRes = await paymentAPI.verify({
          razorpayOrderId: orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
          bookingId,
        });

        if (verifyRes.data.success) {
          callbackSuccess(verifyRes.data.data);
        }
        return;
      }

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'TripWise Ltd',
        description: 'Travel Services Booking Payment',
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyRes = await paymentAPI.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId,
            });

            if (verifyRes.data.success) {
              callbackSuccess(verifyRes.data.data);
            }
          } catch (err) {
            alert('Cryptographic payment verification failed.');
          }
        },
        theme: {
          color: '#0ea5e9',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate payment gateway checkout');
    }
  };

  return (
    <BookingContext.Provider
      value={{
        activeBooking,
        bookings,
        loading,
        error,
        setActiveBooking,
        fetchMyBookings,
        createBooking,
        cancelBooking,
        processPaymentCheckout,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);

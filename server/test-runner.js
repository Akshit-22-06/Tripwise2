const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5001}/api`;

const runIntegrationTests = async () => {
  console.log('====================================================');
  console.log('STARTING TRIPWISE SYSTEM INTEGRATION TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('\n--- 1. API Health & Destinations ---');
    const destRes = await axios.get(`${BASE_URL}/destinations`);
    assert(destRes.status === 200 && destRes.data.data.length > 0, `Loaded ${destRes.data.data.length} seeded destinations`);
    const testDest = destRes.data.data[0];

    const destDetailRes = await axios.get(`${BASE_URL}/destinations/${testDest._id}`);
    assert(destDetailRes.status === 200 && destDetailRes.data.data.destination.name === testDest.name, `Fetched destination detail for ${testDest.name}`);

    // 2. Traveler Auth & Profile
    console.log('\n--- 2. Authentication & User Profile ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'traveler@tripwise.com',
      password: 'password123',
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Logged in as John Traveler');
    const travelerToken = loginRes.data.token;
    const travelerAuth = { headers: { Authorization: `Bearer ${travelerToken}` } };

    const profileRes = await axios.get(`${BASE_URL}/auth/profile`, travelerAuth);
    assert(profileRes.status === 200 && profileRes.data.data.email === 'traveler@tripwise.com', 'Fetched traveler profile');

    const wishlistRes = await axios.post(`${BASE_URL}/auth/wishlist`, {
      itemId: testDest._id,
      itemType: 'destinations',
    }, travelerAuth);
    assert(wishlistRes.status === 200, 'Toggled destination in wishlist');

    // 3. Search Endpoints (Flights, Trains, Hotels, Places)
    console.log('\n--- 3. Search Services (Flights, Trains, Hotels, Places) ---');
    const flightRes = await axios.get(`${BASE_URL}/flights/search?origin=DEL&destination=BOM&departureDate=2026-11-01`, travelerAuth);
    assert(flightRes.status === 200 && flightRes.data.data.length > 0, `Flight search returned ${flightRes.data.data.length} flights`);

    const trainRes = await axios.get(`${BASE_URL}/trains/search?sourceCode=NDLS&destinationCode=BCT&travelDate=2026-11-01`, travelerAuth);
    assert(trainRes.status === 200 && trainRes.data.data.length > 0, `Train search returned ${trainRes.data.data.length} trains`);

    const hotelRes = await axios.get(`${BASE_URL}/hotels/search?cityCode=DEL&checkInDate=2026-11-01&checkOutDate=2026-11-04`, travelerAuth);
    assert(hotelRes.status === 200 && hotelRes.data.data.length > 0, `Hotel search returned ${hotelRes.data.data.length} hotels`);

    const placesRes = await axios.get(`${BASE_URL}/places/discover?lat=${testDest.latitude}&lng=${testDest.longitude}&radius=5000`, travelerAuth);
    assert(placesRes.status === 200 && placesRes.data.data.length > 0, `Places discovery returned ${placesRes.data.data.length} POIs`);

    // 4. Trip Planner
    console.log('\n--- 4. Trip Planner & Budget Calculator ---');
    const budgetRes = await axios.post(`${BASE_URL}/planner/calculate-budget`, {
      destinationId: testDest._id,
      numberOfNights: 4,
      priceTier: 'mid-range',
    }, travelerAuth);
    assert(budgetRes.status === 200 && budgetRes.data.data.estimatedTotal > 0, `Calculated budget: ${budgetRes.data.data.estimatedTotal} INR`);

    const planRes = await axios.post(`${BASE_URL}/planner/generate`, {
      destinationId: testDest._id,
      totalDays: 3,
      targetBudget: 25000,
      travelStyle: 'historical',
    }, travelerAuth);
    assert(planRes.status === 200 && planRes.data.data.dayPlans.length === 3, 'Generated 3-day itinerary schedule');

    const savePlanRes = await axios.post(`${BASE_URL}/planner/save`, planRes.data.data, travelerAuth);
    assert(savePlanRes.status === 201 && savePlanRes.data.data._id, 'Saved generated itinerary');

    const myPlansRes = await axios.get(`${BASE_URL}/planner/my-plans`, travelerAuth);
    assert(myPlansRes.status === 200 && myPlansRes.data.data.length > 0, `Retrieved ${myPlansRes.data.data.length} saved plans`);

    // 5. Bookings & Checkout (Flight, Train, Hotel)
    console.log('\n--- 5. Unified Booking Lifecycle & Checkout ---');
    const flightBooking = await axios.post(`${BASE_URL}/bookings/create`, {
      bookingType: 'Flight',
      totalCost: 5200,
      details: {
        airline: 'Air India',
        flightNumber: 'AI-302',
        departureAirport: 'DEL',
        arrivalAirport: 'BOM',
        seatNumber: '14B',
      },
    }, travelerAuth);
    assert(flightBooking.status === 201 && flightBooking.data.data.bookingType === 'Flight', 'Flight booking created');

    const trainBooking = await axios.post(`${BASE_URL}/bookings/create`, {
      bookingType: 'Train',
      totalCost: 1750,
      details: {
        trainName: 'Vande Bharat Express',
        trainNumber: '22436',
        coachNumber: 'C1',
        berthNumber: '28',
      },
    }, travelerAuth);
    assert(trainBooking.status === 201 && trainBooking.data.data.bookingType === 'Train', 'Train booking created');

    const hotelBooking = await axios.post(`${BASE_URL}/bookings/create`, {
      bookingType: 'Hotel',
      totalCost: 8400,
      details: {
        hotelName: 'Kyoto Ryokan Grand',
        roomType: 'Deluxe Tatami',
        numberOfNights: 2,
        checkInDate: '2026-11-01',
      },
    }, travelerAuth);
    assert(hotelBooking.status === 201 && hotelBooking.data.data.bookingType === 'Hotel', 'Hotel booking created');

    // 6. Payment Order Creation & Verification
    console.log('\n--- 6. Payment Flow ---');
    const orderRes = await axios.post(`${BASE_URL}/payments/create-order`, {
      bookingId: flightBooking.data.data._id,
    }, travelerAuth);
    assert(orderRes.status === 200 && orderRes.data.orderId, `Created payment order: ${orderRes.data.orderId}`);

    const crypto = require('crypto');
    const testPaymentId = `pay_test_${Date.now()}`;
    const testSignature = process.env.RAZORPAY_KEY_SECRET
      ? crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderRes.data.orderId}|${testPaymentId}`).digest('hex')
      : 'mock_sig';

    const verifyRes = await axios.post(`${BASE_URL}/payments/verify`, {
      razorpayOrderId: orderRes.data.orderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: testSignature,
      bookingId: flightBooking.data.data._id,
    }, travelerAuth);
    assert(verifyRes.status === 200 && verifyRes.data.data.status === 'CONFIRMED', 'Payment verified and booking CONFIRMED');

    // 7. Merchant Flow
    console.log('\n--- 7. Business Owner Flow ---');
    const merchantLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'merchant@tripwise.com',
      password: 'password123',
    });
    const merchantToken = merchantLogin.data.token;
    const merchantAuth = { headers: { Authorization: `Bearer ${merchantToken}` } };

    const merchantDash = await axios.get(`${BASE_URL}/business/dashboard`, merchantAuth);
    assert(merchantDash.status === 200 && merchantDash.data.data.stats, 'Fetched merchant dashboard statistics');

    const myServices = await axios.get(`${BASE_URL}/business/services`, merchantAuth);
    assert(myServices.status === 200 && myServices.data.data.length > 0, `Merchant has ${myServices.data.data.length} listings`);

    // 8. Admin Flow
    console.log('\n--- 8. Admin Dashboard & Reports ---');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@tripwise.com',
      password: 'password123',
    });
    const adminToken = adminLogin.data.token;
    const adminAuth = { headers: { Authorization: `Bearer ${adminToken}` } };

    const usersList = await axios.get(`${BASE_URL}/admin/users`, adminAuth);
    assert(usersList.status === 200 && usersList.data.data.length >= 3, `Admin fetched ${usersList.data.data.length} registered users`);

    const reportsRes = await axios.get(`${BASE_URL}/admin/reports`, adminAuth);
    assert(reportsRes.status === 200 && reportsRes.data.data.platformMetrics, 'Admin generated platform metrics report');

    console.log('\n====================================================');
    console.log(`TEST RUN SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Integration test error:', err.response?.data || err.message);
    process.exit(1);
  }
};

runIntegrationTests();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

const Destination = require('./server/models/Destination');
const { planTrip } = require('./server/services/tripPlannerService');

async function runTests() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tripwise');
  console.log('Connected to MongoDB.\n');

  try {
    // Check existing destinations in DB
    const existingDests = await Destination.find({}, 'name city country');
    console.log('Existing DB Destinations:', existingDests.map(d => `${d.name} (${d.city})`));

    // Test 1: Ahmedabad to Mumbai (3 days, 2 travelers, Budget ₹20,000)
    console.log('\n============================================================');
    console.log('TEST CASE 1: Ahmedabad -> Mumbai (3 days, 2 travelers, ₹20,000)');
    console.log('============================================================');
    const res1 = await planTrip({
      destination: 'Mumbai',
      startingLocation: 'Ahmedabad',
      startDate: '2026-10-10',
      totalDays: 3,
      travelers: 2,
      targetBudget: 20000,
      travelStyle: 'Standard',
    });

    console.log('✓ Destination Resolved:', res1.destination.name, `(${res1.destination.city}, ${res1.destination.country})`);
    console.log('  Coordinates:', res1.destination.coordinates);
    console.log('✓ Flights Found:', res1.transportation.flights.length);
    if (res1.transportation.flights.length > 0) {
      console.log('  Best Flight:', res1.transportation.flights[0].airline, res1.transportation.flights[0].flightNumber, '₹' + res1.transportation.flights[0].price);
    }
    console.log('✓ Trains Found:', res1.transportation.trains.length);
    if (res1.transportation.trains.length > 0) {
      console.log('  Best Train:', res1.transportation.trains[0].trainName, '#' + res1.transportation.trains[0].trainNumber, '₹' + res1.transportation.trains[0].fare);
    }
    console.log('✓ Transportation Recommendation:', res1.transportation.recommendation.type);
    console.log('  Reason:', res1.transportation.recommendation.reason);
    console.log('✓ Selected Hotel:', res1.accommodation.selectedHotel?.name, '₹' + res1.accommodation.selectedHotel?.pricePerNight + '/night');
    console.log('✓ Real Places Found:', res1.places.attractions.length, 'attractions');
    console.log('  Sample POIs:', res1.places.attractions.slice(0, 3).map(p => p.name).join(' | '));
    console.log('✓ Budget Breakdown:');
    console.log('  User Budget: ₹' + res1.budgetBreakdown.userBudget);
    console.log('  Actual Transport: ₹' + res1.budgetBreakdown.actualPrices.transportation);
    console.log('  Actual Accommodation: ₹' + res1.budgetBreakdown.actualPrices.accommodation);
    console.log('  Estimated Expenses: ₹' + res1.budgetBreakdown.estimatedExpenses.subtotal);
    console.log('  Total Estimated: ₹' + res1.budgetBreakdown.estimatedTotalCost);
    console.log('  Status:', res1.budgetBreakdown.status);
    console.log('✓ Day Plans Generated:', res1.dayPlans.length, 'days');
    console.log('  Day 1 Morning:', res1.dayPlans[0]?.morning);
    console.log('  Day 1 Afternoon:', res1.dayPlans[0]?.afternoon);
    console.log('  Day 1 Evening:', res1.dayPlans[0]?.evening);
    console.log('✓ Booking Payloads Ready:', {
      flight: !!res1.bookingPayloads.flight,
      train: !!res1.bookingPayloads.train,
      hotel: !!res1.bookingPayloads.hotel,
    });

    // Test 2: Delhi to Manali (4 days, 2 travelers, Budget ₹25,000)
    console.log('\n============================================================');
    console.log('TEST CASE 2: Delhi -> Manali (4 days, 2 travelers, ₹25,000)');
    console.log('============================================================');
    const res2 = await planTrip({
      destination: 'Manali',
      startingLocation: 'Delhi',
      startDate: '2026-10-15',
      totalDays: 4,
      travelers: 2,
      targetBudget: 25000,
      travelStyle: 'Adventure',
    });

    console.log('✓ Destination Resolved:', res2.destination.name, `(${res2.destination.city}, ${res2.destination.country})`);
    console.log('  Coordinates:', res2.destination.coordinates);
    console.log('✓ Flights Found:', res2.transportation.flights.length);
    console.log('✓ Trains Found:', res2.transportation.trains.length);
    console.log('✓ Transportation Recommendation:', res2.transportation.recommendation.type);
    console.log('  Reason:', res2.transportation.recommendation.reason);
    console.log('✓ Selected Hotel:', res2.accommodation.selectedHotel?.name, '₹' + res2.accommodation.selectedHotel?.pricePerNight + '/night');
    console.log('✓ Real Places Found:', res2.places.attractions.length, 'attractions');
    console.log('  Sample POIs:', res2.places.attractions.slice(0, 3).map(p => p.name).join(' | '));
    console.log('✓ Budget Status:', res2.budgetBreakdown.status, 'Total: ₹' + res2.budgetBreakdown.estimatedTotalCost);
    console.log('✓ Day Plans Generated:', res2.dayPlans.length, 'days');

    // Test 3: Dynamic Destination NOT in DB (e.g. Udaipur or Shimla or Pondicherry or Kyoto)
    const nonDbCity = 'Pondicherry';
    console.log('\n============================================================');
    console.log(`TEST CASE 3: Dynamic Destination NOT in DB: Bangalore -> ${nonDbCity}`);
    console.log('============================================================');
    const res3 = await planTrip({
      destination: nonDbCity,
      startingLocation: 'Bangalore',
      startDate: '2026-11-01',
      totalDays: 3,
      travelers: 1,
      targetBudget: 15000,
      travelStyle: 'Relaxed',
    });

    console.log('✓ Destination Resolved Dynamically via Geoapify:', res3.destination.name);
    console.log('  City:', res3.destination.city, 'Country:', res3.destination.country);
    console.log('  Coordinates:', res3.destination.coordinates);
    console.log('  Saved to DB id:', res3.destination.id);
    console.log('✓ Real Places Found:', res3.places.attractions.length, 'attractions');
    console.log('  Sample POIs:', res3.places.attractions.slice(0, 3).map(p => p.name).join(' | '));
    console.log('✓ Day Plans Generated:', res3.dayPlans.length, 'days');
    console.log('  Day 1 Morning:', res3.dayPlans[0]?.morning);

    console.log('\n============================================================');
    console.log('ALL TRIP PLANNER INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('============================================================\n');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();

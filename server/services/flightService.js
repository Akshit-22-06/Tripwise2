const axios = require('axios');
require('dotenv').config();

// Realistic mock flights for offline development / viva demonstrations
const getMockFlights = (origin, destination, departureDate, adults = 1, travelClass = 'ECONOMY') => {
  const baseRate = travelClass === 'BUSINESS' ? 12000 : travelClass === 'FIRST' ? 24000 : 4500;

  const carriers = [
    { name: 'Air India', code: 'AI-302', duration: '2h 15m' },
    { name: 'IndiGo Airlines', code: '6E-451', duration: '2h 30m' },
    { name: 'Vistara', code: 'UK-994', duration: '2h 10m' },
  ];

  return carriers.map((carrier, idx) => ({
    id: `flight-mock-${idx + 1}-${origin}-${destination}`,
    source: 'Curated Flight Engine',
    airline: carrier.name,
    flightNumber: carrier.code,
    departureCode: origin.toUpperCase(),
    arrivalCode: destination.toUpperCase(),
    departureTime: `${departureDate}T0${7 + idx * 4}:30:00Z`,
    arrivalTime: `${departureDate}T${10 + idx * 4}:00:00Z`,
    duration: carrier.duration,
    price: Math.round(baseRate * adults * (1 + idx * 0.15)),
    currency: 'INR',
  }));
};

const searchFlights = async ({ origin, destination, departureDate, adults = 1, travelClass = 'ECONOMY' }) => {
  const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;

  // If Duffel token is missing or placeholder, use the reliable mock engine
  if (!duffelToken || duffelToken.includes('your_duffel_access_token')) {
    return getMockFlights(origin, destination, departureDate, adults, travelClass);
  }

  try {
    const response = await axios.post(
      'https://api.duffel.com/air/offer_requests',
      {
        data: {
          slices: [
            {
              origin: origin.toUpperCase(),
              destination: destination.toUpperCase(),
              departure_date: departureDate,
            },
          ],
          passengers: Array.from({ length: adults }, () => ({ type: 'adult' })),
          cabin_class: travelClass.toLowerCase() === 'first' ? 'first' : travelClass.toLowerCase() === 'business' ? 'business' : 'economy',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${duffelToken}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json',
        },
      }
    );

    const offers = response.data?.data?.offers || [];
    if (offers.length === 0) {
      return getMockFlights(origin, destination, departureDate, adults, travelClass);
    }

    return offers.slice(0, 10).map((offer) => {
      const slice = offer.slices?.[0];
      const segment = slice?.segments?.[0];
      const carrierName = segment?.operating_carrier?.name || segment?.marketing_carrier?.name || 'Partner Airline';
      const carrierCode = segment?.operating_carrier?.iata_code || segment?.marketing_carrier?.iata_code || 'AI';
      const flightNum = segment?.operating_carrier_flight_number || '101';

      return {
        id: offer.id,
        source: 'Live Duffel API',
        airline: carrierName,
        flightNumber: `${carrierCode}-${flightNum}`,
        departureCode: segment?.origin?.iata_code || origin.toUpperCase(),
        arrivalCode: segment?.destination?.iata_code || destination.toUpperCase(),
        departureTime: segment?.departing_at,
        arrivalTime: segment?.arriving_at,
        duration: slice?.duration || '2h 30m',
        price: parseFloat(offer.total_amount),
        currency: offer.total_currency || 'INR',
      };
    });
  } catch (err) {
    console.warn('Live Duffel API lookup failed, falling back to mock flights:', err.message);
    return getMockFlights(origin, destination, departureDate, adults, travelClass);
  }
};

module.exports = {
  searchFlights,
};

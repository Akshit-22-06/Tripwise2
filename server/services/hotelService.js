const axios = require('axios');
require('dotenv').config();

// Realistic mock hotels for offline development / viva demonstrations
const getMockHotels = (cityCode, checkInDate, checkOutDate, roomQuantity = 1) => {
  const hotels = [
    {
      name: `${cityCode.toUpperCase()} Heritage Palace Hotel`,
      pricePerNight: 4200,
      roomType: 'Deluxe King Suite',
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Breakfast Included', 'Spa'],
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: `${cityCode.toUpperCase()} Central City Inn`,
      pricePerNight: 2400,
      roomType: 'Superior Double Room',
      amenities: ['Free Wi-Fi', 'Complimentary Breakfast', 'Parking'],
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: `${cityCode.toUpperCase()} Royal Residency & Suites`,
      pricePerNight: 6800,
      roomType: 'Executive Panoramic Suite',
      amenities: ['Free Wi-Fi', 'Rooftop Lounge', 'Fine Dining', 'Gym'],
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return hotels.map((hotel, idx) => ({
    id: `hotel-mock-${idx + 1}-${cityCode}`,
    source: 'Curated Hotel Engine',
    name: hotel.name,
    latitude: 28.6139 + (idx * 0.01),
    longitude: 77.2090 + (idx * 0.01),
    priceRange: (hotel.pricePerNight * roomQuantity).toString(),
    pricePerNight: hotel.pricePerNight,
    currency: 'INR',
    roomType: hotel.roomType,
    amenities: hotel.amenities,
    image: hotel.image,
    serviceType: 'Hotel',
  }));
};

const searchHotels = async ({ cityCode, checkInDate, checkOutDate, roomQuantity = 1 }) => {
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (!rapidApiKey || rapidApiKey.includes('your_rapidapi_key')) {
    return getMockHotels(cityCode, checkInDate, checkOutDate, roomQuantity);
  }

  try {
    const locationRes = await axios.get('https://apidojo-booking-v1.p.rapidapi.com/locations/auto-complete', {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'apidojo-booking-v1.p.rapidapi.com',
      },
      params: {
        text: cityCode.toUpperCase(),
        languagecode: 'en-us',
      },
    });

    const locations = locationRes.data?.result || locationRes.data || [];
    const destId = locations[0]?.dest_id;
    const destType = locations[0]?.dest_type || 'city';

    if (!destId) {
      return getMockHotels(cityCode, checkInDate, checkOutDate, roomQuantity);
    }

    const searchRes = await axios.get('https://apidojo-booking-v1.p.rapidapi.com/properties/list', {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'apidojo-booking-v1.p.rapidapi.com',
      },
      params: {
        dest_ids: destId,
        dest_type: destType,
        arrival_date: checkInDate,
        departure_date: checkOutDate,
        room_qty: roomQuantity,
        guest_qty: 1,
        currency: 'INR',
      },
    });

    const hotelList = searchRes.data?.result || searchRes.data?.data || [];
    if (!Array.isArray(hotelList) || hotelList.length === 0) {
      return getMockHotels(cityCode, checkInDate, checkOutDate, roomQuantity);
    }

    return hotelList.slice(0, 6).map((hotel) => ({
      id: `booking-${hotel.hotel_id}`,
      source: 'Live Booking.com API',
      name: hotel.hotel_name || 'Hotel Accommodation',
      latitude: hotel.latitude || 28.6139,
      longitude: hotel.longitude || 77.2090,
      priceRange: (hotel.min_total_price || 3000) * roomQuantity,
      currency: 'INR',
      pricePerNight: hotel.min_total_price || 3000,
      roomType: hotel.accommodation_type_name || 'Standard Hotel Room',
      amenities: hotel.hotel_facilities ? hotel.hotel_facilities.split(',').slice(0, 4) : ['Free Wi-Fi', 'Breakfast'],
      image: hotel.max_photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      serviceType: 'Hotel',
    }));
  } catch (err) {
    console.warn('RapidAPI Booking.com lookup failed, falling back to mock hotels:', err.message);
    return getMockHotels(cityCode, checkInDate, checkOutDate, roomQuantity);
  }
};

module.exports = {
  searchHotels,
};

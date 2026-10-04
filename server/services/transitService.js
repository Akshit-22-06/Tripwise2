const axios = require('axios');
require('dotenv').config();

// Realistic mock trains for offline development / viva demonstrations
const getMockTrains = (sourceCode, destinationCode, travelDate) => {
  const trains = [
    {
      trainName: 'Vande Bharat Express',
      trainNumber: '22436',
      departureTime: '06:00',
      arrivalTime: '14:05',
      duration: '08h 05m',
      classes: ['CC', 'EC'],
      price: 1750,
    },
    {
      trainName: 'Rajdhani Express',
      trainNumber: '12431',
      departureTime: '11:25',
      arrivalTime: '20:15',
      duration: '08h 50m',
      classes: ['1A', '2A', '3A'],
      price: 2150,
    },
    {
      trainName: 'Shatabdi Express',
      trainNumber: '12002',
      departureTime: '15:30',
      arrivalTime: '23:45',
      duration: '08h 15m',
      classes: ['CC', 'EC'],
      price: 1420,
    },
  ];

  return trains.map((t) => ({
    trainName: t.trainName,
    trainNumber: t.trainNumber,
    sourceStation: sourceCode.toUpperCase(),
    destStation: destinationCode.toUpperCase(),
    departureTime: t.departureTime,
    arrivalTime: t.arrivalTime,
    duration: t.duration,
    classes: t.classes,
    price: t.price,
    source: 'Curated Rail Engine',
  }));
};

const searchTrains = async ({ sourceCode, destinationCode, travelDate }) => {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const railHost = process.env.RAPIDAPI_RAIL_HOST || 'irctc-indian-railway-livetrains-api.p.rapidapi.com';

  if (!rapidApiKey || rapidApiKey.includes('your_rapidapi_key')) {
    return getMockTrains(sourceCode, destinationCode, travelDate);
  }

  try {
    const response = await axios.get(`https://${railHost}/api/v3/trainBetweenStations`, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': railHost,
      },
      params: {
        fromStationCode: sourceCode.toUpperCase(),
        toStationCode: destinationCode.toUpperCase(),
        dateOfJourney: travelDate,
      },
    });

    const trains = response.data?.data || [];
    if (trains.length === 0) {
      return getMockTrains(sourceCode, destinationCode, travelDate);
    }

    return trains.slice(0, 10).map((t) => ({
      trainName: t.train_name,
      trainNumber: t.train_number,
      sourceStation: t.from_station_name || sourceCode.toUpperCase(),
      destStation: t.to_station_name || destinationCode.toUpperCase(),
      departureTime: t.from_std || '08:30',
      arrivalTime: t.to_std || '16:45',
      duration: t.duration || '08h 15m',
      classes: t.class_type || ['1A', '2A', '3A', 'SL'],
      price: t.base_fare || 850,
      source: 'RapidAPI Rail Live',
    }));
  } catch (err) {
    console.warn('RapidAPI Rail Search failed, falling back to mock trains:', err.message);
    return getMockTrains(sourceCode, destinationCode, travelDate);
  }
};

module.exports = {
  searchTrains,
};

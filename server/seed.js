require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Destination = require('./models/Destination');
const { TourismService, Hotel, Restaurant, TourGuide } = require('./models/TourismService');
const Wishlist = require('./models/Wishlist');

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tripwise');
    console.log('Connected to Database. Cleaning collections...');

    await User.deleteMany();
    await Destination.deleteMany();
    await TourismService.deleteMany();
    await Wishlist.deleteMany();
    console.log('Collections cleared.');

    console.log('Seeding users...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@tripwise.com',
      password: 'password123',
      role: 'admin',
      is_verified: true,
    });

    const merchant = await User.create({
      name: 'Alex Merchant',
      email: 'merchant@tripwise.com',
      password: 'password123',
      role: 'business_owner',
      is_verified: true,
      phone: '+1 555 123 4567',
    });

    const traveler = await User.create({
      name: 'John Traveler',
      email: 'traveler@tripwise.com',
      password: 'password123',
      role: 'traveler',
      is_verified: true,
      preferences: ['beach', 'historical', 'nature'],
    });

    await Wishlist.create({ userId: traveler._id });
    console.log('Users seeded successfully.');

    console.log('Seeding destinations...');
    const destinations = await Destination.create([
      {
        name: 'Kyoto Heritage Tour',
        city: 'Kyoto',
        country: 'Japan',
        description: 'Explore majestic temples, zen rock gardens, and historic wooden streets in Japan\'s cultural capital.',
        latitude: 35.0116,
        longitude: 135.7681,
        location: { type: 'Point', coordinates: [135.7681, 35.0116] },
        category: 'historical',
        images: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
        ],
        avgRating: 4.8,
        totalReviews: 120,
      },
      {
        name: 'Maui Beaches Resort',
        city: 'Maui',
        country: 'USA',
        description: 'Enjoy sparkling white sand beaches, windsurfing, snorkeling, and spectacular sunset views in tropical Hawaii.',
        latitude: 20.7984,
        longitude: -156.3319,
        location: { type: 'Point', coordinates: [-156.3319, 20.7984] },
        category: 'beach',
        images: [
          'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        ],
        avgRating: 4.7,
        totalReviews: 85,
      },
      {
        name: 'Grand Canyon Adventure',
        city: 'Arizona',
        country: 'USA',
        description: 'Hike along breathtaking red rock canyons, view steep ridges, and experience thrilling rafting on the Colorado River.',
        latitude: 36.0544,
        longitude: -112.1401,
        location: { type: 'Point', coordinates: [-112.1401, 36.0544] },
        category: 'adventure',
        images: [
          'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=800&q=80',
        ],
        avgRating: 4.9,
        totalReviews: 240,
      },
      {
        name: 'Paris Urban Gateway',
        city: 'Paris',
        country: 'France',
        description: 'Discover high-end boutiques, famous art galleries, gourmet bistros, and landmarks like the Eiffel Tower and Louvre.',
        latitude: 48.8566,
        longitude: 2.3522,
        location: { type: 'Point', coordinates: [2.3522, 48.8566] },
        category: 'urban',
        images: [
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        ],
        avgRating: 4.6,
        totalReviews: 180,
      },
      {
        name: 'Swiss Alps Wilderness',
        city: 'Interlaken',
        country: 'Switzerland',
        description: 'Ski down snowy slopes, view crystal-clear lakes, and hike past high glacier ridges in Europe\'s famous mountain range.',
        latitude: 46.6863,
        longitude: 7.8632,
        location: { type: 'Point', coordinates: [7.8632, 46.6863] },
        category: 'nature',
        images: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        ],
        avgRating: 4.9,
        totalReviews: 95,
      },
    ]);
    console.log('Destinations seeded successfully.');

    console.log('Seeding merchant services...');

    await Hotel.create({
      ownerId: merchant._id,
      name: 'Kyoto Ryokan Grand',
      priceRange: '$$$',
      latitude: 35.0125,
      longitude: 135.769,
      location: { type: 'Point', coordinates: [135.769, 35.0125] },
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      roomTypes: ['Standard Tatami', 'Deluxe Garden Suite', 'Presidential Ryokan Suite'],
      amenities: ['Onsen Hot Springs', 'Traditional Breakfast', 'Free Wi-Fi', 'Garden view'],
      pricePerNight: 8500,
    });

    await Restaurant.create({
      ownerId: merchant._id,
      name: 'Le Bistro de L\'Eiffel',
      priceRange: '$$',
      latitude: 48.857,
      longitude: 2.353,
      location: { type: 'Point', coordinates: [2.353, 48.857] },
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      cuisineType: 'French Fine Dining',
      capacity: 45,
      pricePerMeal: 1500,
    });

    await TourGuide.create({
      ownerId: merchant._id,
      name: 'Canyon Trails Guiding Co.',
      priceRange: '$$',
      latitude: 36.055,
      longitude: -112.141,
      location: { type: 'Point', coordinates: [-112.141, 36.055] },
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      languages: ['English', 'Spanish'],
      hourlyRate: 750,
      specialization: 'High Mountain Climbing & White-Water Rafting',
      isAvailable: true,
    });

    console.log('Services seeded successfully.');
    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error(`Database seeding failed: ${err.message}`);
    process.exit(1);
  }
};

seedData();

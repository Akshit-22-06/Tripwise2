require('dotenv').config();
const mongoose = require('mongoose');
const { TourismService } = require('./models/TourismService');

const verifyAll = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tripwise');

    console.log('Updating all tourism services to isVerified = true...');
    const result = await TourismService.updateMany({}, { isVerified: true });
    
    console.log(`Success! Updated ${result.modifiedCount} listing(s) to verified status.`);
    process.exit(0);
  } catch (err) {
    console.error(`Error during verification update: ${err.message}`);
    process.exit(1);
  }
};

verifyAll();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsecho';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected for updating events');
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  }
};

const updateEvents = async () => {
  try {
    console.log('🔄 Updating events with seatMap data...\n');

    // Update Tech Conference 2025
    const techEvent = await Event.findOneAndUpdate(
      { name: 'Tech Conference 2025' },
      {
        seatMap: {
          totalSeats: 500,
          availableSeats: 450,
          soldSeats: 50,
          reservedSeats: 0
        }
      },
      { new: true }
    );

    if (techEvent) {
      console.log('✅ Updated Tech Conference 2025 with seatMap');
    }

    // Update Music Festival Extravaganza
    const musicEvent = await Event.findOneAndUpdate(
      { name: 'Music Festival Extravaganza' },
      {
        seatMap: {
          totalSeats: 500,
          availableSeats: 400,
          soldSeats: 100,
          reservedSeats: 0
        }
      },
      { new: true }
    );

    if (musicEvent) {
      console.log('✅ Updated Music Festival Extravaganza with seatMap');
    }

    console.log('\n🎉 Events updated successfully!');

  } catch (error) {
    console.error('❌ Update error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
};

// Run the update
connectDB().then(() => {
  updateEvents();
});
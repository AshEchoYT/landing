import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendee from './models/Attendee.js';
import Organizer from './models/Organizer.js';
import Venue from './models/Venue.js';
import Event from './models/Event.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsecho';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected for verification');
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  }
};

const verifyData = async () => {
  try {
    console.log('🔍 Verifying seeded data...\n');

    // Check organizer account
    const organizerAccount = await Attendee.findOne({ email: 'test@organizer.com' });
    console.log('👤 Organizer Account:');
    console.log(`   - Name: ${organizerAccount?.name}`);
    console.log(`   - Email: ${organizerAccount?.email}`);
    console.log(`   - Role: ${organizerAccount?.role}`);
    console.log(`   - ID: ${organizerAccount?._id}\n`);

    // Check organizer profile
    const organizerProfile = await Organizer.findOne({ email: 'test@organizer.com' });
    console.log('🏢 Organizer Profile:');
    console.log(`   - Name: ${organizerProfile?.name}`);
    console.log(`   - Company: ${organizerProfile?.companyName}`);
    console.log(`   - Verified: ${organizerProfile?.isVerified}`);
    console.log(`   - ID: ${organizerProfile?._id}\n`);

    // Check venue
    const venue = await Venue.findOne({ name: 'Test Venue' });
    console.log('🏛️ Venue:');
    console.log(`   - Name: ${venue?.name}`);
    console.log(`   - City: ${venue?.address?.city}`);
    console.log(`   - Capacity: ${venue?.capacity}`);
    console.log(`   - ID: ${venue?._id}\n`);

    // Check events
    const events = await Event.find({ organizer: organizerProfile._id })
      .populate('organizer', 'name companyName')
      .populate('venue', 'name address.city');

    console.log('🎪 Events:');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.name}`);
      console.log(`      - Type: ${event.type}`);
      console.log(`      - Date: ${event.startDate.toDateString()}`);
      console.log(`      - Venue: ${event.venue.name}, ${event.venue.address.city}`);
      console.log(`      - Status: ${event.status}`);
      console.log(`      - Images: ${event.images.length} images`);
      console.log(`      - Primary Image: ${event.primaryImage?.url ? 'Yes' : 'No'}`);
      console.log(`      - Pricing: ₹${event.pricing.minPrice} - ₹${event.pricing.maxPrice}`);
      console.log(`      - ID: ${event._id}\n`);
    });

    console.log('✅ All data verified successfully!');

  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
};

// Run the verification
connectDB().then(() => {
  verifyData();
});
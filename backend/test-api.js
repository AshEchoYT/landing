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
    console.log('✅ MongoDB connected for API test');
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  }
};

const testEventsAPI = async () => {
  try {
    console.log('🧪 Testing Events API...\n');

    // Test getEvents query (similar to what the API does)
    const filter = { status: 'published' };

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .populate('venue', 'name address capacity')
      .sort('-startDate')
      .limit(10)
      .select('-staff -sponsors -vendors'); // Keep attendees for analytics

    console.log(`📊 Found ${events.length} published events in database\n`);

    // Transform events like the API does
    const transformedEvents = events.map(event => ({
      _id: event._id,
      title: event.name,
      description: event.description,
      date: event.startDate.toISOString().split('T')[0],
      venue: {
        _id: event.venue._id,
        name: event.venue.name,
        location: `${event.venue.address?.city || ''}, ${event.venue.address?.state || ''}`,
        capacity: event.venue.capacity
      },
      organizer: event.organizer._id,
      category: event.type,
      tags: event.tags,
      pricing: event.pricing ? [{
        category: 'standard',
        price: event.pricing.minPrice
      }] : [],
      capacity: event.capacity,
      status: event.status,
      image: event.primaryImage?.url || '',
      analytics: {
        ticketsSold: event.attendees.filter(a => a.status === 'registered').length,
        attendees: event.attendees.filter(a => a.status === 'attended').length,
        revenue: event.analytics.revenue
      },
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    console.log('🎪 Transformed Events:');
    transformedEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title}`);
      console.log(`      - Category: ${event.category}`);
      console.log(`      - Date: ${event.date}`);
      console.log(`      - Venue: ${event.venue.name}`);
      console.log(`      - Image: ${event.image ? 'Yes' : 'No'}`);
      console.log(`      - Status: ${event.status}`);
      console.log(`      - Pricing: ${event.pricing.length > 0 ? `₹${event.pricing[0].price}` : 'Free'}`);
      console.log('');
    });

    // Test specific event details
    if (events.length > 0) {
      const firstEvent = events[0];
      console.log('🔍 First Event Details:');
      console.log(`   - Raw Name: ${firstEvent.name}`);
      console.log(`   - Raw Type: ${firstEvent.type}`);
      console.log(`   - Raw Status: ${firstEvent.status}`);
      console.log(`   - Raw Start Date: ${firstEvent.startDate}`);
      console.log(`   - Primary Image URL: ${firstEvent.primaryImage?.url || 'None'}`);
      console.log(`   - Images Array: ${firstEvent.images.length} images`);
      console.log(`   - Pricing Object: ${JSON.stringify(firstEvent.pricing, null, 2)}`);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
};

// Run the test
connectDB().then(() => {
  testEventsAPI();
});
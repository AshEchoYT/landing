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
    console.log('✅ MongoDB connected for seeding');
  } catch (err) {
    console.error('❌ DB Connection Error:', err.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Create or find test organizer account
    let testOrganizer = await Attendee.findOne({ email: 'test@organizer.com' });
    if (!testOrganizer) {
      testOrganizer = await Attendee.create({
        name: 'Test Organizer',
        email: 'test@organizer.com',
        password: 'test123',
        role: 'organizer',
        phoneNumbers: ['9876543210']
      });
      console.log('✅ Created test organizer account');
    } else {
      console.log('✅ Found existing test organizer account');
    }

    // 2. Create organizer profile if it doesn't exist
    let organizerProfile = await Organizer.findOne({ email: 'test@organizer.com' });
    if (!organizerProfile) {
      organizerProfile = await Organizer.create({
        name: 'Test Organizer',
        email: 'test@organizer.com',
        phoneNumbers: ['9876543210'],
        companyName: 'Test Events Company',
        description: 'Professional event organizer for testing purposes',
        address: {
          street: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        isVerified: true
      });
      console.log('✅ Created organizer profile');
    } else {
      console.log('✅ Found existing organizer profile');
    }

    // 3. Create or find test venue
    let testVenue = await Venue.findOne({ name: 'Test Venue' });
    if (!testVenue) {
      testVenue = await Venue.create({
        name: 'Test Venue',
        address: {
          street: '456 Event Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400002'
        },
        capacity: 500,
        facilities: ['AC', 'Parking', 'Sound System', 'Lighting', 'Stage'],
        venueType: 'indoor',
        contactInfo: {
          phone: '9876543211',
          email: 'venue@test.com'
        },
        pricing: {
          baseRate: 50000,
          currency: 'INR'
        },
        description: 'Modern indoor venue perfect for events'
      });
      console.log('✅ Created test venue');
    } else {
      console.log('✅ Found existing test venue');
    }

    // 4. Create 2 test events with image links
    const eventsData = [
      {
        name: 'Tech Conference 2025',
        type: 'conference',
        description: 'A comprehensive technology conference featuring the latest innovations in AI, blockchain, and software development. Join industry leaders and experts for insightful talks and networking opportunities.',
        startDate: new Date('2025-11-15'),
        endDate: new Date('2025-11-16'),
        startTime: '09:00',
        endTime: '18:00',
        tags: ['technology', 'ai', 'blockchain', 'innovation'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
            alt: 'Tech Conference Main Image',
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
            alt: 'Conference Hall Setup'
          }
        ],
        pricing: {
          minPrice: 1500,
          maxPrice: 3000,
          currency: 'INR'
        },
        organizer: organizerProfile._id,
        venue: testVenue._id,
        status: 'published',
        seatMap: {
          totalSeats: 500,
          availableSeats: 450,
          soldSeats: 50,
          reservedSeats: 0
        },
        ageRestriction: 18,
        policies: {
          refund: 'partial',
          cancellation: 'Free cancellation up to 7 days before event'
        }
      },
      {
        name: 'Music Festival Extravaganza',
        type: 'festival',
        description: 'Experience an unforgettable music festival featuring top artists from around the world. Multiple stages, food stalls, and amazing performances await you!',
        startDate: new Date('2025-12-20'),
        endDate: new Date('2025-12-22'),
        startTime: '16:00',
        endTime: '23:00',
        tags: ['music', 'festival', 'entertainment', 'live'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
            alt: 'Music Festival Main Image',
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
            alt: 'Festival Crowd'
          }
        ],
        pricing: {
          minPrice: 2500,
          maxPrice: 5000,
          currency: 'INR'
        },
        organizer: organizerProfile._id,
        venue: testVenue._id,
        status: 'published',
        seatMap: {
          totalSeats: 500,
          availableSeats: 400,
          soldSeats: 100,
          reservedSeats: 0
        },
        ageRestriction: 16,
        policies: {
          refund: 'full',
          cancellation: 'Free cancellation up to 14 days before event'
        }
      }
    ];

    for (const eventData of eventsData) {
      const existingEvent = await Event.findOne({ name: eventData.name });
      if (!existingEvent) {
        await Event.create(eventData);
        console.log(`✅ Created event: ${eventData.name}`);
      } else {
        console.log(`✅ Event already exists: ${eventData.name}`);
      }
    }

    // Update organizer's total events count
    const totalEvents = await Event.countDocuments({ organizer: organizerProfile._id });
    await Organizer.findByIdAndUpdate(organizerProfile._id, { totalEvents });

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created/Found:`);
    console.log(`   - 1 Organizer Account`);
    console.log(`   - 1 Organizer Profile`);
    console.log(`   - 1 Venue`);
    console.log(`   - 2 Events`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
};

// Run the seeding
connectDB().then(() => {
  seedDatabase();
});
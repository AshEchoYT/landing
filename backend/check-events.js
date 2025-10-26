import mongoose from 'mongoose';
import Event from './models/Event.js';

async function checkEvents() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventmanagement');
    console.log('Connected to MongoDB');

    const events = await Event.find({}).select('name staff sponsors').limit(5);
    console.log('Found', events.length, 'events:');

    events.forEach((event, index) => {
      console.log(`Event ${index + 1}: ${event.name}`);
      console.log(`  Staff: ${event.staff ? event.staff.length : 0} members`);
      console.log(`  Sponsors: ${event.sponsors ? event.sponsors.length : 0} sponsors`);
      console.log('');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEvents();
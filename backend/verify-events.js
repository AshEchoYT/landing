import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Staff from './models/Staff.js';
import Sponsor from './models/Sponsor.js';

dotenv.config();

const checkEvents = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsecho';
    await mongoose.connect(mongoURI);

    const events = await Event.find({})
      .populate('staff.staff', 'name role')
      .populate('sponsors.sponsor', 'name sponsorshipType');

    console.log('Events with staff and sponsors:');
    events.forEach(event => {
      console.log(`\nEvent: ${event.name}`);
      console.log(`Staff (${event.staff.length}): ${event.staff.map(s => `${s.staff.name} (${s.role})`).join(', ')}`);
      console.log(`Sponsors (${event.sponsors.length}): ${event.sponsors.map(s => `${s.sponsor.name} (${s.sponsorshipType})`).join(', ')}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkEvents();
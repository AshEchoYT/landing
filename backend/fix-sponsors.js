import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

const fixSponsorshipTypes = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsecho';
    await mongoose.connect(mongoURI);

    // Fix the Digital Innovation Summit event
    const event = await Event.findOne({ name: 'Digital Innovation Summit' });
    if (event) {
      // Update platinum to gold
      event.sponsors.forEach(sponsor => {
        if (sponsor.sponsorshipType === 'platinum') {
          sponsor.sponsorshipType = 'gold';
        }
      });
      await event.save();
      console.log('Fixed Digital Innovation Summit sponsorship types');
    }

    console.log('Sponsorship types fixed!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

fixSponsorshipTypes();
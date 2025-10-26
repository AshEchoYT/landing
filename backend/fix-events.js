import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';
import Staff from './models/Staff.js';
import Sponsor from './models/Sponsor.js';

dotenv.config();

const updateExistingEvents = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventsecho';
    await mongoose.connect(mongoURI);

    // Get all staff and sponsors
    const staff = await Staff.find({});
    const sponsors = await Sponsor.find({});

    // Update existing events that don't have staff/sponsors
    const events = await Event.find({});

    for (const event of events) {
      if (event.staff.length === 0) {
        // Assign staff based on event type
        if (event.name === 'Tech Conference 2025') {
          event.staff = [
            { staff: staff[0]._id, hoursAssigned: 16, role: 'manager' },
            { staff: staff[1]._id, hoursAssigned: 14, role: 'coordinator' },
            { staff: staff[2]._id, hoursAssigned: 12, role: 'technician' }
          ];
        } else if (event.name === 'Music Festival Extravaganza') {
          event.staff = [
            { staff: staff[0]._id, hoursAssigned: 24, role: 'manager' },
            { staff: staff[3]._id, hoursAssigned: 20, role: 'security' },
            { staff: staff[4]._id, hoursAssigned: 18, role: 'usher' },
            { staff: staff[2]._id, hoursAssigned: 16, role: 'technician' }
          ];
        }
      }

      if (event.sponsors.length === 0) {
        // Assign sponsors based on event type
        if (event.name === 'Tech Conference 2025') {
          event.sponsors = [
            { sponsor: sponsors[0]._id, sponsorshipType: 'gold', contributionAmount: 200000 },
            { sponsor: sponsors[1]._id, sponsorshipType: 'silver', contributionAmount: 150000 }
          ];
        } else if (event.name === 'Music Festival Extravaganza') {
          event.sponsors = [
            { sponsor: sponsors[1]._id, sponsorshipType: 'gold', contributionAmount: 300000 },
            { sponsor: sponsors[2]._id, sponsorshipType: 'bronze', contributionAmount: 100000 }
          ];
        }
      }

      await event.save();
      console.log(`Updated event: ${event.name}`);
    }

    console.log('All existing events updated with staff and sponsors!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

updateExistingEvents();
import mongoose from 'mongoose';
import Attendee from './models/Attendee.js';
import Organizer from './models/Organizer.js';

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/events_echo');

    const attendees = await Attendee.find({ email: 'test@organizer.com' });
    console.log('Attendees with test@organizer.com:', attendees.length);
    if (attendees.length > 0) {
      console.log('Attendee data:', {
        _id: attendees[0]._id,
        name: attendees[0].name,
        email: attendees[0].email,
        role: attendees[0].role,
        isActive: attendees[0].isActive
      });
    }

    const organizers = await Organizer.find({ email: 'test@organizer.com' });
    console.log('Organizers with test@organizer.com:', organizers.length);
    if (organizers.length > 0) {
      console.log('Organizer data:', {
        _id: organizers[0]._id,
        name: organizers[0].name,
        email: organizers[0].email,
        isActive: organizers[0].isActive
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
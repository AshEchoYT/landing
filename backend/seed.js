import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendee from './models/Attendee.js';
import Organizer from './models/Organizer.js';
import Venue from './models/Venue.js';
import Event from './models/Event.js';
import Vendor from './models/Vendor.js';
import Staff from './models/Staff.js';
import Sponsor from './models/Sponsor.js';

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

    // 3. Create staff members for the organizer
    const staffData = [
      {
        name: 'Rajesh Kumar',
        contactNo: '9876543221',
        email: 'rajesh.kumar@testevents.com',
        role: 'manager',
        hourlyRate: 300,
        experience: 5,
        skills: ['event management', 'coordination', 'leadership'],
        rating: 4.8,
        totalEvents: 25
      },
      {
        name: 'Priya Sharma',
        contactNo: '9876543222',
        email: 'priya.sharma@testevents.com',
        role: 'coordinator',
        hourlyRate: 250,
        experience: 3,
        skills: ['logistics', 'vendor management', 'communication'],
        rating: 4.6,
        totalEvents: 18
      },
      {
        name: 'Amit Singh',
        contactNo: '9876543223',
        email: 'amit.singh@testevents.com',
        role: 'technician',
        hourlyRate: 200,
        experience: 4,
        skills: ['audio', 'lighting', 'technical support'],
        rating: 4.7,
        totalEvents: 32
      },
      {
        name: 'Meera Joshi',
        contactNo: '9876543224',
        email: 'meera.joshi@testevents.com',
        role: 'security',
        hourlyRate: 180,
        experience: 6,
        skills: ['crowd control', 'emergency response', 'security'],
        rating: 4.9,
        totalEvents: 45
      },
      {
        name: 'Karan Gupta',
        contactNo: '9876543225',
        email: 'karan.gupta@testevents.com',
        role: 'usher',
        hourlyRate: 150,
        experience: 2,
        skills: ['customer service', 'guidance', 'hospitality'],
        rating: 4.5,
        totalEvents: 12
      }
    ];

    const createdStaff = [];
    for (const staffMember of staffData) {
      const existingStaff = await Staff.findOne({ email: staffMember.email });
      if (!existingStaff) {
        const staff = await Staff.create({
          ...staffMember,
          organizer: organizerProfile._id
        });
        createdStaff.push(staff);
        console.log(`✅ Created staff: ${staffMember.name}`);
      } else {
        createdStaff.push(existingStaff);
        console.log(`✅ Staff already exists: ${staffMember.name}`);
      }
    }

    // 4. Create sponsors for the organizer
    const sponsorsData = [
      {
        name: 'TechCorp Solutions',
        contactPerson: 'Vikram Rao',
        contactNo: '9876543226',
        email: 'vikram.rao@techcorp.com',
        companyName: 'TechCorp Solutions Pvt Ltd',
        website: 'https://techcorp.com',
        sponsorshipType: 'platinum',
        contributionAmount: 500000,
        industry: 'Technology',
        description: 'Leading technology solutions provider',
        perks: ['Logo on main banner', 'Speaking slot', 'Booth space', 'VIP tickets'],
        rating: 4.8,
        totalEventsSponsored: 15
      },
      {
        name: 'SoundWave Entertainment',
        contactPerson: 'Anjali Mehta',
        contactNo: '9876543227',
        email: 'anjali.mehta@soundwave.com',
        companyName: 'SoundWave Entertainment Ltd',
        website: 'https://soundwave.com',
        sponsorshipType: 'gold',
        contributionAmount: 300000,
        industry: 'Entertainment',
        description: 'Premium entertainment and music production company',
        perks: ['Logo on merchandise', 'Social media mentions', 'Performance slot'],
        rating: 4.6,
        totalEventsSponsored: 22
      },
      {
        name: 'InnovateTech Corp',
        contactPerson: 'Rohit Verma',
        contactNo: '9876543228',
        email: 'rohit.verma@innovatetech.com',
        companyName: 'InnovateTech Corporation',
        website: 'https://innovatetech.com',
        sponsorshipType: 'silver',
        contributionAmount: 200000,
        industry: 'Technology',
        description: 'Innovation-driven technology company',
        perks: ['Logo on website', 'Newsletter mention', 'Networking session'],
        rating: 4.7,
        totalEventsSponsored: 8
      }
    ];

    const createdSponsors = [];
    for (const sponsorData of sponsorsData) {
      const existingSponsor = await Sponsor.findOne({ email: sponsorData.email });
      if (!existingSponsor) {
        const sponsor = await Sponsor.create({
          ...sponsorData,
          organizer: organizerProfile._id
        });
        createdSponsors.push(sponsor);
        console.log(`✅ Created sponsor: ${sponsorData.name}`);
      } else {
        createdSponsors.push(existingSponsor);
        console.log(`✅ Sponsor already exists: ${sponsorData.name}`);
      }
    }

    // 5. Create 10 predefined venues
    const venuesData = [
      {
        name: 'Grand Ballroom Mumbai',
        address: {
          street: 'Apollo Bunder',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        capacity: 1500,
        facilities: ['AC', 'Parking', 'Sound System', 'Lighting', 'Stage', 'VIP Lounge', 'Food Court'],
        venueType: 'indoor',
        contactInfo: {
          phone: '9876543210',
          email: 'info@grandballroommumbai.com',
          manager: {
            name: 'Rajesh Kumar',
            phone: '9876543211'
          }
        },
        pricing: {
          baseRate: 150000,
          currency: 'INR',
          additionalFees: [
            { name: 'Sound System', amount: 25000, type: 'fixed' },
            { name: 'Catering Setup', amount: 15000, type: 'fixed' }
          ]
        },
        description: 'Luxurious indoor ballroom perfect for weddings, corporate events, and large gatherings. Features state-of-the-art sound and lighting systems.',
        rating: 4.8,
        totalEvents: 245
      },
      {
        name: 'Beachfront Resort Goa',
        address: {
          street: 'Candolim Beach Road',
          city: 'Goa',
          state: 'Goa',
          zipCode: '403515'
        },
        capacity: 800,
        facilities: ['Parking', 'Sound System', 'Lighting', 'Stage', 'Restrooms', 'Bar'],
        venueType: 'outdoor',
        contactInfo: {
          phone: '9876543212',
          email: 'events@beachfrontgoa.com'
        },
        pricing: {
          baseRate: 200000,
          currency: 'INR'
        },
        description: 'Stunning beachfront venue with panoramic ocean views. Ideal for destination weddings and beach parties.',
        rating: 4.6,
        totalEvents: 189
      },
      {
        name: 'Tech Hub Bangalore',
        address: {
          street: 'Whitefield Main Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560066'
        },
        capacity: 600,
        facilities: ['AC', 'Parking', 'WiFi', 'Sound System', 'Lighting', 'Stage'],
        venueType: 'hybrid',
        contactInfo: {
          phone: '9876543213',
          email: 'bookings@techhubblr.com'
        },
        pricing: {
          baseRate: 120000,
          currency: 'INR'
        },
        description: 'Modern tech conference venue with cutting-edge AV equipment. Perfect for tech events, workshops, and seminars.',
        rating: 4.7,
        totalEvents: 156
      },
      {
        name: 'Heritage Palace Jaipur',
        address: {
          street: 'City Palace Road',
          city: 'Jaipur',
          state: 'Rajasthan',
          zipCode: '302002'
        },
        capacity: 400,
        facilities: ['Parking', 'Sound System', 'Lighting', 'Stage'],
        venueType: 'outdoor',
        contactInfo: {
          phone: '9876543214',
          email: 'events@heritagepalace.com'
        },
        pricing: {
          baseRate: 180000,
          currency: 'INR'
        },
        description: 'Historic palace venue with traditional Rajasthani architecture. Ideal for cultural events and royal weddings.',
        rating: 4.9,
        totalEvents: 98
      },
      {
        name: 'Skyline Tower Delhi',
        address: {
          street: 'Connaught Place',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001'
        },
        capacity: 300,
        facilities: ['AC', 'Parking', 'WiFi', 'Sound System', 'Lighting', 'Stage'],
        venueType: 'indoor',
        contactInfo: {
          phone: '9876543215',
          email: 'info@skylinedelhi.com'
        },
        pricing: {
          baseRate: 100000,
          currency: 'INR'
        },
        description: 'Premium rooftop venue with stunning city views. Perfect for corporate events and exclusive parties.',
        rating: 4.5,
        totalEvents: 134
      },
      {
        name: 'Garden Resort Pune',
        address: {
          street: 'Lonavala Highway',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '410401'
        },
        capacity: 250,
        facilities: ['Parking', 'Sound System', 'Lighting', 'Stage', 'Food Court'],
        venueType: 'outdoor',
        contactInfo: {
          phone: '9876543216',
          email: 'events@gardenpune.com'
        },
        pricing: {
          baseRate: 85000,
          currency: 'INR'
        },
        description: 'Peaceful garden resort venue surrounded by nature. Great for intimate weddings and corporate retreats.',
        rating: 4.4,
        totalEvents: 87
      },
      {
        name: 'Convention Center Chennai',
        address: {
          street: 'T. Nagar Main Road',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600017'
        },
        capacity: 1200,
        facilities: ['AC', 'Parking', 'WiFi', 'Sound System', 'Lighting', 'Stage'],
        venueType: 'hybrid',
        contactInfo: {
          phone: '9876543217',
          email: 'conventions@chennai-center.com'
        },
        pricing: {
          baseRate: 140000,
          currency: 'INR'
        },
        description: 'Large convention center with multiple configurable halls. Suitable for conferences, exhibitions, and large gatherings.',
        rating: 4.6,
        totalEvents: 203
      },
      {
        name: 'Lake View Resort Kolkata',
        address: {
          street: 'Rabindra Sarobar',
          city: 'Kolkata',
          state: 'West Bengal',
          zipCode: '700029'
        },
        capacity: 350,
        facilities: ['Parking', 'Sound System', 'Lighting', 'Stage', 'Food Court'],
        venueType: 'outdoor',
        contactInfo: {
          phone: '9876543218',
          email: 'events@lakeviewkolkata.com'
        },
        pricing: {
          baseRate: 95000,
          currency: 'INR'
        },
        description: 'Scenic lakeside venue with boat facilities. Perfect for weddings and cultural events with water themes.',
        rating: 4.3,
        totalEvents: 76
      },
      {
        name: 'Modern Art Gallery Ahmedabad',
        address: {
          street: 'Law Garden Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          zipCode: '380006'
        },
        capacity: 150,
        facilities: ['AC', 'Parking', 'WiFi', 'Sound System', 'Lighting'],
        venueType: 'indoor',
        contactInfo: {
          phone: '9876543219',
          email: 'gallery@modernartahd.com'
        },
        pricing: {
          baseRate: 60000,
          currency: 'INR'
        },
        description: 'Contemporary art gallery venue for unique events. Features rotating art exhibitions and modern architecture.',
        rating: 4.7,
        totalEvents: 45
      },
      {
        name: 'Mountain Resort Shimla',
        address: {
          street: 'Mall Road',
          city: 'Shimla',
          state: 'Himachal Pradesh',
          zipCode: '171001'
        },
        capacity: 200,
        facilities: ['Parking', 'Sound System', 'Lighting', 'Stage', 'Food Court'],
        venueType: 'hybrid',
        contactInfo: {
          phone: '9876543220',
          email: 'resort@mountainshimla.com'
        },
        pricing: {
          baseRate: 110000,
          currency: 'INR'
        },
        description: 'Hill station resort with breathtaking mountain views. Ideal for destination weddings and corporate offsites.',
        rating: 4.8,
        totalEvents: 62
      }
    ];

    for (const venueData of venuesData) {
      const existingVenue = await Venue.findOne({ name: venueData.name });
      if (!existingVenue) {
        await Venue.create(venueData);
        console.log(`✅ Created venue: ${venueData.name}`);
      } else {
        console.log(`✅ Venue already exists: ${venueData.name}`);
      }
    }

    // 4. Create predefined vendors
    const vendorsData = [
      {
        name: 'Raj Catering Services',
        serviceType: 'catering',
        contactNo: '9876543221',
        email: 'info@rajcatering.com',
        contactPerson: 'Raj Kumar',
        companyName: 'Raj Catering Services Pvt Ltd',
        contractStart: new Date('2024-01-01'),
        contractEnd: new Date('2025-12-31'),
        serviceDetails: 'Full-service catering with traditional and continental cuisine',
        pricing: {
          baseRate: 500,
          currency: 'INR',
          additionalFees: [
            { name: 'Service Staff', amount: 200, type: 'fixed' }
          ]
        },
        rating: 4.6,
        totalEvents: 89
      },
      {
        name: 'Pro Sound Systems',
        serviceType: 'sound',
        contactNo: '9876543222',
        email: 'contact@prosound.com',
        contactPerson: 'Amit Singh',
        companyName: 'Pro Sound Systems India',
        contractStart: new Date('2024-02-01'),
        contractEnd: new Date('2025-12-31'),
        serviceDetails: 'Professional sound engineering and equipment rental',
        pricing: {
          baseRate: 15000,
          currency: 'INR'
        },
        rating: 4.8,
        totalEvents: 156
      },
      {
        name: 'Elite Lighting Co.',
        serviceType: 'lighting',
        contactNo: '9876543223',
        email: 'bookings@elitelighting.com',
        contactPerson: 'Priya Sharma',
        companyName: 'Elite Lighting Company',
        contractStart: new Date('2024-01-15'),
        contractEnd: new Date('2025-12-31'),
        serviceDetails: 'Stage lighting and special effects for events',
        pricing: {
          baseRate: 12000,
          currency: 'INR'
        },
        rating: 4.7,
        totalEvents: 134
      },
      {
        name: 'Secure Events Security',
        serviceType: 'security',
        contactNo: '9876543224',
        email: 'operations@secureevents.com',
        contactPerson: 'Vikram Patel',
        companyName: 'Secure Events Security Services',
        contractStart: new Date('2024-03-01'),
        contractEnd: new Date('2025-12-31'),
        serviceDetails: 'Professional security personnel and crowd management',
        pricing: {
          baseRate: 800,
          currency: 'INR'
        },
        rating: 4.9,
        totalEvents: 203
      },
      {
        name: 'Floral Dreams Decor',
        serviceType: 'decoration',
        contactNo: '9876543225',
        email: 'orders@floraldreams.com',
        contactPerson: 'Meera Joshi',
        companyName: 'Floral Dreams Event Decorators',
        contractStart: new Date('2024-01-01'),
        contractEnd: new Date('2025-12-31'),
        serviceDetails: 'Floral arrangements and event decoration services',
        pricing: {
          baseRate: 25000,
          currency: 'INR'
        },
        rating: 4.5,
        totalEvents: 98
      },
      {
        name: 'Capture Moments Photography',
        serviceType: 'photography',
        contactNo: '9876543226',
        email: 'info@capturemoments.com',
        contactPerson: 'Arjun Reddy',
        companyName: 'Capture Moments Photography',
        contractStart: new Date('2024-02-15'),
        contractEnd: new Date('2025-12-31'),
        serviceDetails: 'Professional photography and videography services',
        pricing: {
          baseRate: 30000,
          currency: 'INR'
        },
        rating: 4.8,
        totalEvents: 167
      },
      {
        name: 'Swift Transportation',
        serviceType: 'transportation',
        contactNo: '9876543227',
        email: 'bookings@swifttransport.com',
        contactPerson: 'Karan Gupta',
        companyName: 'Swift Transportation Services',
        contractStart: new Date('2024-01-10'),
        contractEnd: new Date('2025-12-31'),
        serviceDetails: 'Luxury vehicle rental and transportation services',
        pricing: {
          baseRate: 5000,
          currency: 'INR'
        },
        rating: 4.6,
        totalEvents: 145
      },
      {
        name: 'MediCare Event Services',
        serviceType: 'medical',
        contactNo: '9876543228',
        email: 'emergency@medicareevents.com',
        contactPerson: 'Dr. Sunita Rao',
        companyName: 'MediCare Event Medical Services',
        contractStart: new Date('2024-03-15'),
        contractEnd: new Date('2025-12-31'),
        serviceDetails: 'Medical emergency response and first aid services',
        pricing: {
          baseRate: 10000,
          currency: 'INR'
        },
        rating: 4.9,
        totalEvents: 78
      }
    ];

    const createdVendors = [];
    for (const vendorData of vendorsData) {
      const existingVendor = await Vendor.findOne({ email: vendorData.email });
      if (!existingVendor) {
        const vendor = await Vendor.create(vendorData);
        createdVendors.push(vendor);
        console.log(`✅ Created vendor: ${vendorData.name}`);
      } else {
        createdVendors.push(existingVendor);
        console.log(`✅ Vendor already exists: ${vendorData.name}`);
      }
    }

    // 5. Associate vendors with venues
    const venues = await Venue.find({});
    const vendorAssociations = [
      // Grand Ballroom Mumbai - catering, sound, lighting, security, decoration
      { venueName: 'Grand Ballroom Mumbai', vendorIndices: [0, 1, 2, 3, 4] },
      // Beachfront Resort Goa - catering, sound, lighting, photography, transportation
      { venueName: 'Beachfront Resort Goa', vendorIndices: [0, 1, 2, 5, 6] },
      // Tech Hub Bangalore - sound, lighting, photography, security
      { venueName: 'Tech Hub Bangalore', vendorIndices: [1, 2, 5, 3] },
      // Heritage Palace Jaipur - catering, decoration, photography, sound
      { venueName: 'Heritage Palace Jaipur', vendorIndices: [0, 4, 5, 1] },
      // Skyline Tower Delhi - sound, lighting, security, catering
      { venueName: 'Skyline Tower Delhi', vendorIndices: [1, 2, 3, 0] },
      // Garden Resort Pune - catering, sound, decoration, photography
      { venueName: 'Garden Resort Pune', vendorIndices: [0, 1, 4, 5] },
      // Convention Center Chennai - sound, lighting, security, medical
      { venueName: 'Convention Center Chennai', vendorIndices: [1, 2, 3, 7] },
      // Lake View Resort Kolkata - catering, sound, decoration, transportation
      { venueName: 'Lake View Resort Kolkata', vendorIndices: [0, 1, 4, 6] },
      // Modern Art Gallery Ahmedabad - lighting, photography, security
      { venueName: 'Modern Art Gallery Ahmedabad', vendorIndices: [2, 5, 3] },
      // Mountain Resort Shimla - catering, sound, decoration, medical
      { venueName: 'Mountain Resort Shimla', vendorIndices: [0, 1, 4, 7] }
    ];

    for (const association of vendorAssociations) {
      const venue = venues.find(v => v.name === association.venueName);
      if (venue) {
        const vendorIds = association.vendorIndices.map(index => createdVendors[index]._id);
        await Venue.findByIdAndUpdate(venue._id, { vendors: vendorIds });
        console.log(`✅ Associated vendors with venue: ${association.venueName}`);
      }
    }
    // 6. Create 2 test events with proper staff and sponsor assignments
    const eventsData = [
      {
        name: 'Tech Conference 2025',
        type: 'conference',
        description: 'A comprehensive technology conference featuring the latest innovations in AI, blockchain, and software development. Join industry leaders and experts for insightful talks and networking opportunities.',
        startDate: new Date('2025-11-15'),
        endDate: new Date('2025-11-16'),
        startTime: '09:00',
        endTime: '18:00',
        budget: 500000,
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
        venue: venues.find(v => v.name === 'Grand Ballroom Mumbai')._id,
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
        },
        staff: [
          { staff: createdStaff[0]._id, hoursAssigned: 16, role: 'manager' },
          { staff: createdStaff[1]._id, hoursAssigned: 14, role: 'coordinator' },
          { staff: createdStaff[2]._id, hoursAssigned: 12, role: 'technician' }
        ],
        sponsors: [
          { sponsor: createdSponsors[0]._id, sponsorshipType: 'platinum', contributionAmount: 200000 },
          { sponsor: createdSponsors[1]._id, sponsorshipType: 'gold', contributionAmount: 150000 }
        ]
      },
      {
        name: 'Music Festival Extravaganza',
        type: 'festival',
        description: 'Experience an unforgettable music festival featuring top artists from around the world. Multiple stages, food stalls, and amazing performances await you!',
        startDate: new Date('2025-12-20'),
        endDate: new Date('2025-12-22'),
        startTime: '16:00',
        endTime: '23:00',
        budget: 800000,
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
        venue: venues.find(v => v.name === 'Beachfront Resort Goa')._id,
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
        },
        staff: [
          { staff: createdStaff[0]._id, hoursAssigned: 24, role: 'manager' },
          { staff: createdStaff[3]._id, hoursAssigned: 20, role: 'security' },
          { staff: createdStaff[4]._id, hoursAssigned: 18, role: 'usher' },
          { staff: createdStaff[2]._id, hoursAssigned: 16, role: 'technician' }
        ],
        sponsors: [
          { sponsor: createdSponsors[1]._id, sponsorshipType: 'platinum', contributionAmount: 300000 },
          { sponsor: createdSponsors[2]._id, sponsorshipType: 'silver', contributionAmount: 100000 }
        ]
      }
    ];

    // Check and update existing events with vendor assignments
    console.log('� Checking existing events vendor assignments...');
    const existingEvents = await Event.find({}).populate({
      path: 'vendors.vendor',
      select: 'name serviceType'
    });

    for (const event of existingEvents) {
      console.log(`Event: ${event.name}`);
      console.log(`  Current vendors: ${event.vendors ? event.vendors.length : 0}`);
      
      if (event.vendors && event.vendors.length > 0) {
        event.vendors.forEach((vendorAssignment, index) => {
          console.log(`    Vendor ${index + 1}: ${vendorAssignment.vendor.name} (${vendorAssignment.vendor.serviceType})`);
        });
      } else {
        console.log('    No vendors assigned - assigning one...');
        
        // Assign a vendor
        const venue = await Venue.findById(event.venue).populate('vendors');
        if (venue && venue.vendors && venue.vendors.length > 0) {
          const randomVendor = venue.vendors[Math.floor(Math.random() * venue.vendors.length)];
          
          event.vendors = [{
            vendor: randomVendor._id,
            serviceType: randomVendor.serviceType,
            contractAmount: Math.floor(Math.random() * 50000) + 10000
          }];
          
          await event.save();
          console.log(`    ✅ Assigned vendor: ${randomVendor.name} (${randomVendor.serviceType})`);
        }
      }
    }

    // Update organizer's total events count
    const totalEvents = await Event.countDocuments({ organizer: organizerProfile._id });
    await Organizer.findByIdAndUpdate(organizerProfile._id, { totalEvents });

    // Add a new test event with one of the new venues
    const newEventData = {
      name: 'Digital Innovation Summit',
      type: 'conference',
      description: 'Join industry leaders and innovators for a comprehensive summit on digital transformation, AI, and emerging technologies. Network with experts and discover the latest trends shaping the future of technology.',
      startDate: new Date('2025-12-10'),
      endDate: new Date('2025-12-11'),
      startTime: '09:00',
      endTime: '18:00',
      budget: 400000,
      tags: ['technology', 'innovation', 'ai', 'digital', 'conference'],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',
          alt: 'Digital Innovation Summit Main Image',
          isPrimary: true
        },
        {
          url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
          alt: 'Conference Networking'
        }
      ],
      pricing: {
        minPrice: 2000,
        maxPrice: 4000,
        currency: 'INR'
      },
      organizer: organizerProfile._id,
      venue: venues.find(v => v.name === 'Tech Hub Bangalore')._id, // Using Tech Hub Bangalore
      status: 'published',
      seatMap: {
        totalSeats: 400,
        availableSeats: 380,
        soldSeats: 20,
        reservedSeats: 0
      },
      ageRestriction: 18,
      policies: {
        refund: 'partial',
        cancellation: 'Free cancellation up to 10 days before event'
      },
      staff: [
        { staff: createdStaff[1]._id, hoursAssigned: 12, role: 'coordinator' },
        { staff: createdStaff[2]._id, hoursAssigned: 10, role: 'technician' },
        { staff: createdStaff[4]._id, hoursAssigned: 8, role: 'usher' }
      ],
      sponsors: [
        { sponsor: createdSponsors[0]._id, sponsorshipType: 'platinum', contributionAmount: 250000 },
        { sponsor: createdSponsors[2]._id, sponsorshipType: 'gold', contributionAmount: 120000 }
      ]
    };

    const newEvent = await Event.findOneAndUpdate(
      { name: newEventData.name },
      newEventData,
      { upsert: true, new: true }
    );

    console.log(`✅ Created/Updated event: ${newEventData.name}`);

    // Assign a vendor to this new event
    const eventVenue = await Venue.findById(newEvent.venue).populate('vendors');
    if (eventVenue && eventVenue.vendors && eventVenue.vendors.length > 0) {
      const assignedVendor = eventVenue.vendors.find(v => v.name === 'Pro Sound Systems') || eventVenue.vendors[0];
      await Event.findByIdAndUpdate(newEvent._id, {
        vendors: [{
          vendor: assignedVendor._id,
          serviceType: assignedVendor.serviceType,
          contractAmount: 28000
        }]
      });
      console.log(`✅ Assigned vendor ${assignedVendor.name} to ${newEventData.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created/Found:`);
    console.log(`   - 1 Organizer Account`);
    console.log(`   - 1 Organizer Profile`);
    console.log(`   - 5 Staff Members`);
    console.log(`   - 3 Sponsors`);
    console.log(`   - 10 Venues`);
    console.log(`   - 8 Vendors`);
    console.log(`   - 3 Events`);

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
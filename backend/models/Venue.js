import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit zip code']
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [100000, 'Capacity cannot exceed 100,000']
  },
  facilities: [{
    type: String,
    enum: [
      'AC', 'Parking', 'Food Court', 'Restrooms', 'Wheelchair Access',
      'WiFi', 'Sound System', 'Lighting', 'Stage', 'Green Room',
      'Security', 'First Aid', 'Bar', 'VIP Lounge', 'Merchandise Stand'
    ]
  }],
  venueType: {
    type: String,
    enum: ['indoor', 'outdoor', 'hybrid'],
    required: [true, 'Venue type is required']
  },
  contactInfo: {
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    manager: {
      name: String,
      phone: String
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  pricing: {
    baseRate: {
      type: Number,
      min: [0, 'Base rate cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    additionalFees: [{
      name: String,
      amount: Number,
      type: { type: String, enum: ['fixed', 'percentage'] }
    }]
  },
  availability: [{
    date: Date,
    startTime: String,
    endTime: String,
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
venueSchema.index({ 'address.city': 1 });
venueSchema.index({ capacity: 1 });
venueSchema.index({ venueType: 1 });
venueSchema.index({ isActive: 1 });

// Virtual for full address
venueSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  return `${this.address.street || ''}, ${this.address.city || ''}, ${this.address.state || ''} - ${this.address.zipCode || ''}, ${this.address.country || ''}`.replace(/^, |, $/, '');
});

// Virtual for primary image
venueSchema.virtual('primaryImage').get(function() {
  return this.images && this.images.length > 0 ? (this.images.find(img => img.isPrimary) || this.images[0]) : null;
});

// Method to check availability
venueSchema.methods.isAvailable = function(date, startTime, endTime) {
  return !this.availability || !this.availability.some(slot =>
    slot.date.toDateString() === date.toDateString() &&
    slot.startTime === startTime &&
    slot.endTime === endTime &&
    slot.isBooked
  );
};

export default mongoose.model('Venue', venueSchema);
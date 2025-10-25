import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['concert', 'festival', 'theater', 'art', 'sports', 'conference', 'workshop', 'other'],
    lowercase: true
  },
  theme: {
    type: String,
    trim: true,
    maxlength: [50, 'Theme cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  pricing: {
    minPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    maxPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: [true, 'Organizer is required']
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Venue is required']
  },
  staff: [{
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    role: {
      type: String,
      enum: ['manager', 'coordinator', 'technician', 'security', 'usher', 'other'],
      default: 'other'
    },
    assignedAt: { type: Date, default: Date.now }
  }],
  sponsors: [{
    sponsor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sponsor',
      required: true
    },
    contributionAmount: {
      type: Number,
      min: [0, 'Contribution cannot be negative']
    },
    sponsorshipType: {
      type: String,
      enum: ['gold', 'silver', 'bronze', 'title', 'presenting', 'other'],
      default: 'other'
    },
    perks: [String]
  }],
  vendors: [{
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    serviceType: {
      type: String,
      enum: ['catering', 'sound', 'lighting', 'security', 'decoration', 'photography', 'other'],
      default: 'other'
    },
    contractAmount: {
      type: Number,
      min: [0, 'Contract amount cannot be negative']
    }
  }],
  attendees: [{
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendee',
      required: true
    },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  tickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }],
  seatMap: {
    totalSeats: { type: Number, default: 0 },
    availableSeats: { type: Number, default: 0 },
    soldSeats: { type: Number, default: 0 },
    reservedSeats: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isSoldOut: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  ageRestriction: {
    type: Number,
    min: [0, 'Age restriction cannot be negative'],
    default: 0
  },
  policies: {
    refund: {
      type: String,
      enum: ['no-refund', 'partial', 'full'],
      default: 'no-refund'
    },
    cancellation: String,
    terms: String
  },
  analytics: {
    views: { type: Number, default: 0 },
    registrations: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
eventSchema.index({ startDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ venue: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ 'pricing.minPrice': 1, 'pricing.maxPrice': 1 });

// Virtual for duration
eventSchema.virtual('duration').get(function() {
  const start = new Date(`${this.startDate.toDateString()} ${this.startTime}`);
  const end = new Date(`${this.endDate.toDateString()} ${this.endTime}`);
  return Math.round((end - start) / (1000 * 60 * 60)); // hours
});

// Virtual for primary image
eventSchema.virtual('primaryImage').get(function() {
  return this.images && this.images.length > 0 ? (this.images.find(img => img.isPrimary) || this.images[0]) : null;
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees ? this.attendees.filter(a => a.status === 'registered').length : 0;
});

// Pre-save middleware
eventSchema.pre('save', function(next) {
  // Update seat availability
  this.seatMap.availableSeats = this.seatMap.totalSeats - this.seatMap.soldSeats - this.seatMap.reservedSeats;
  this.isSoldOut = this.seatMap.availableSeats === 0;

  next();
});

// Static method to find upcoming events
eventSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    startDate: { $gte: new Date() },
    status: 'published'
  })
  .populate('organizer', 'name')
  .populate('venue', 'name address.city')
  .sort({ startDate: 1 })
  .limit(limit);
};

export default mongoose.model('Event', eventSchema);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const organizerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  phoneNumbers: [{
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  }],
  role: {
    type: String,
    enum: ['organizer'],
    default: 'organizer'
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+$/, 'Please enter a valid URL']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String, // URLs to uploaded documents
    documentType: {
      type: String,
      enum: ['pan', 'aadhar', 'gst', 'incorporation', 'other']
    },
    uploadedAt: { type: Date, default: Date.now }
  }],
  totalEvents: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    language: { type: String, default: 'en' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
organizerSchema.index({ isVerified: 1 });
organizerSchema.index({ isActive: 1 });
organizerSchema.index({ email: 1 });

// Hash password before saving
organizerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
organizerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile method
organizerSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phoneNumbers: this.phoneNumbers,
    role: this.role || 'organizer',
    companyName: this.companyName,
    website: this.website,
    description: this.description,
    address: this.address,
    socialMedia: this.socialMedia,
    isVerified: this.isVerified,
    totalEvents: this.totalEvents,
    rating: this.rating,
    preferences: this.preferences,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Virtual for events count
organizerSchema.virtual('eventsCount').get(function() {
  return this.totalEvents;
});

// Pre-save middleware to update totalEvents
organizerSchema.pre('save', function(next) {
  if (this.isNew) {
    this.totalEvents = 0;
  }
  next();
});

export default mongoose.model('Organizer', organizerSchema);
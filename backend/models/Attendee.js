import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const attendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumbers: [{
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  }],
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['attendee', 'organizer', 'admin'],
    default: 'attendee'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    categories: [{
      type: String,
      enum: ['concert', 'festival', 'theater', 'art', 'sports', 'conference']
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
attendeeSchema.index({ role: 1 });

// Virtual for full name (if needed)
attendeeSchema.virtual('fullName').get(function() {
  return this.name;
});

// Hash password before saving
attendeeSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
attendeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
attendeeSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profilePicture: this.profilePicture,
    preferences: this.preferences,
    createdAt: this.createdAt
  };
};

export default mongoose.model('Attendee', attendeeSchema);
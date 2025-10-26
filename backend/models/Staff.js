import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: [true, 'Organizer is required']
  },
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  contactNo: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: [
      'manager', 'coordinator', 'technician', 'security', 'usher',
      'medical', 'catering', 'cleaning', 'ticketing', 'usher',
      'photographer', 'videographer', 'other'
    ],
    lowercase: true
  },
  hoursAssigned: {
    type: Number,
    min: [0, 'Hours cannot be negative'],
    default: 0
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative'],
    default: 0
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    default: 0 // years
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [30, 'Skill name cannot exceed 30 characters']
  }],
  availability: [{
    date: Date,
    startTime: String,
    endTime: String,
    isAvailable: { type: Boolean, default: true }
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
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  documents: [{
    type: String, // URLs to uploaded documents
    documentType: {
      type: String,
      enum: ['id', 'certificate', 'license', 'other']
    },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
staffSchema.index({ role: 1 });
staffSchema.index({ isActive: 1 });
staffSchema.index({ skills: 1 });

// Virtual for total earnings
staffSchema.virtual('totalEarnings').get(function() {
  return this.hoursAssigned * this.hourlyRate;
});

// Virtual for availability status
staffSchema.virtual('isAvailableToday').get(function() {
  if (!this.availability || !Array.isArray(this.availability)) {
    return false;
  }
  const today = new Date().toDateString();
  return this.availability.some(slot =>
    slot.date.toDateString() === today && slot.isAvailable
  );
});

// Method to check availability for specific date/time
staffSchema.methods.isAvailableOn = function(date, startTime, endTime) {
  if (!this.availability || !Array.isArray(this.availability)) {
    return false;
  }
  return this.availability.some(slot =>
    slot.date.toDateString() === date.toDateString() &&
    slot.startTime === startTime &&
    slot.endTime === endTime &&
    slot.isAvailable
  );
};

// Method to assign to event
staffSchema.methods.assignToEvent = function(eventId, hours) {
  this.totalEvents += 1;
  this.hoursAssigned += hours;
  return this.save();
};

export default mongoose.model('Staff', staffSchema);
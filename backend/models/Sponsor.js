import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: [true, 'Organizer is required']
  },
  name: {
    type: String,
    required: [true, 'Sponsor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [50, 'Contact person name cannot exceed 50 characters']
  },
  contactNo: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
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
  sponsorshipType: {
    type: String,
    required: [true, 'Sponsorship type is required'],
    enum: ['gold', 'silver', 'bronze', 'platinum', 'diamond', 'title', 'presenting', 'other'],
    lowercase: true
  },
  contributionAmount: {
    type: Number,
    required: [true, 'Contribution amount is required'],
    min: [0, 'Contribution amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [50, 'Industry cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: {
    url: String,
    alt: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  perks: [{
    type: String,
    trim: true,
    maxlength: [100, 'Perk description cannot exceed 100 characters']
  }],
  contractDetails: {
    startDate: Date,
    endDate: Date,
    signedDate: Date,
    contractDocument: String // URL to contract document
  },
  totalEventsSponsored: {
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
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
sponsorSchema.index({ sponsorshipType: 1 });
sponsorSchema.index({ contributionAmount: -1 });
sponsorSchema.index({ isActive: 1 });
sponsorSchema.index({ email: 1 });

// Virtual for formatted contribution
sponsorSchema.virtual('formattedContribution').get(function() {
  return `${this.currency} ${this.contributionAmount.toLocaleString()}`;
});

// Virtual for contract duration
sponsorSchema.virtual('contractDuration').get(function() {
  if (!this.contractDetails.startDate || !this.contractDetails.endDate) return null;
  const duration = Math.ceil((this.contractDetails.endDate - this.contractDetails.startDate) / (1000 * 60 * 60 * 24));
  return `${duration} days`;
});

// Method to update sponsorship count
sponsorSchema.methods.incrementEventCount = function() {
  this.totalEventsSponsored += 1;
  return this.save();
};

// Static method to get sponsors by type
sponsorSchema.statics.getByType = function(type) {
  return this.find({ sponsorshipType: type, isActive: true })
    .sort({ contributionAmount: -1 });
};

export default mongoose.model('Sponsor', sponsorSchema);
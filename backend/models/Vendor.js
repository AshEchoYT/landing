import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'catering', 'sound', 'lighting', 'security', 'decoration',
      'photography', 'videography', 'transportation', 'medical',
      'cleaning', 'ticketing', 'merchandise', 'other'
    ],
    lowercase: true
  },
  contactNo: {
    type: String,
    required: [true, 'Contact number is required'],
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
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [50, 'Contact person name cannot exceed 50 characters']
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
  contractStart: {
    type: Date,
    required: [true, 'Contract start date is required']
  },
  contractEnd: {
    type: Date,
    required: [true, 'Contract end date is required'],
    validate: {
      validator: function(value) {
        return value >= this.contractStart;
      },
      message: 'Contract end date must be after or equal to start date'
    }
  },
  serviceDetails: {
    type: String,
    maxlength: [1000, 'Service details cannot exceed 1000 characters']
  },
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
  portfolio: [{
    title: String,
    description: String,
    images: [String], // URLs to portfolio images
    eventDate: Date
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    document: String // URL to certificate document
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
vendorSchema.index({ serviceType: 1 });
vendorSchema.index({ isActive: 1 });
vendorSchema.index({ email: 1 });
vendorSchema.index({ contractStart: 1, contractEnd: 1 });

// Virtual for contract duration
vendorSchema.virtual('contractDuration').get(function() {
  const duration = Math.ceil((this.contractEnd - this.contractStart) / (1000 * 60 * 60 * 24));
  return `${duration} days`;
});

// Virtual for formatted base rate
vendorSchema.virtual('formattedBaseRate').get(function() {
  return this.pricing?.baseRate ? `${this.pricing.currency} ${this.pricing.baseRate.toLocaleString()}` : 'N/A';
});

// Method to check if contract is active
vendorSchema.methods.isContractActive = function() {
  const now = new Date();
  return now >= this.contractStart && now <= this.contractEnd;
};

// Method to extend contract
vendorSchema.methods.extendContract = function(newEndDate) {
  if (newEndDate > this.contractEnd) {
    this.contractEnd = newEndDate;
    return this.save();
  }
  throw new Error('New end date must be after current end date');
};

// Static method to find vendors by service type
vendorSchema.statics.findByServiceType = function(serviceType) {
  return this.find({
    serviceType: serviceType,
    isActive: true
  }).sort({ rating: -1 });
};

export default mongoose.model('Vendor', vendorSchema);
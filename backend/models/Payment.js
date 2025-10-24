import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendee',
    required: [true, 'Attendee is required']
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  mode: {
    type: String,
    required: [true, 'Payment mode is required'],
    enum: ['UPI', 'Card', 'Cash', 'Net Banking', 'Wallet'],
    uppercase: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  date: {
    type: Date,
    default: Date.now
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  paymentGateway: {
    type: String,
    default: 'MockPayment' // Since this is a mock system
  },
  metadata: {
    cardLast4: String, // For card payments
    upiId: String, // For UPI payments
    bankRef: String, // Bank reference number
    failureReason: String, // If payment failed
    additionalData: mongoose.Schema.Types.Mixed
  },
  refund: {
    isRefunded: { type: Boolean, default: false },
    refundAmount: Number,
    refundDate: Date,
    refundReason: String,
    refundTransactionId: String
  },
  webhookData: mongoose.Schema.Types.Mixed, // Store webhook responses if any
  attempts: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentSchema.index({ attendee: 1 });
paymentSchema.index({ ticket: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ transactionId: 1 });

// Compound indexes
paymentSchema.index({ attendee: 1, status: 1 });
paymentSchema.index({ ticket: 1, status: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toLocaleString()}`;
});

// Virtual for payment age
paymentSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.date.getTime()) / (1000 * 60 * 60)); // hours
});

// Pre-save middleware to generate transaction ID
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    // Generate unique transaction ID
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.transactionId = `TXN${timestamp}${random}`;
  }
  next();
});

// Instance method to mark as successful
paymentSchema.methods.markSuccessful = function() {
  this.status = 'Success';
  return this.save();
};

// Instance method to mark as failed
paymentSchema.methods.markFailed = function(reason = '') {
  this.status = 'Failed';
  if (reason) {
    this.metadata = this.metadata || {};
    this.metadata.failureReason = reason;
  }
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(amount, reason = '') {
  this.refund.isRefunded = true;
  this.refund.refundAmount = amount;
  this.refund.refundDate = new Date();
  this.refund.refundReason = reason;
  this.refund.refundTransactionId = `REF${this.transactionId}`;
  this.status = 'Refunded';
  return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(attendeeId = null) {
  const matchStage = attendeeId ? { attendee: attendeeId } : {};

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

export default mongoose.model('Payment', paymentSchema);
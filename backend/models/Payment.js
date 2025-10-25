import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket is required']
  },
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendee',
    required: [true, 'Attendee is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
    required: [true, 'Payment method is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  gatewayTransactionId: {
    type: String,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'payu', 'simulated'],
    default: 'simulated'
  },
  paymentData: {
    // Store gateway-specific data
    cardLast4: String,
    cardBrand: String,
    upiId: String,
    bankName: String,
    // Additional metadata
    metadata: mongoose.Schema.Types.Mixed
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  refundReason: {
    type: String,
    maxlength: [500, 'Refund reason cannot exceed 500 characters']
  },
  refundedAt: Date,
  failureReason: {
    type: String,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  },
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiry
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentSchema.index({ ticket: 1 });
paymentSchema.index({ attendee: 1 });
paymentSchema.index({ event: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ expiresAt: 1 });

// Compound indexes
paymentSchema.index({ attendee: 1, status: 1 });
paymentSchema.index({ event: 1, status: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toLocaleString()}`;
});

// Virtual for payment age
paymentSchema.virtual('age').get(function() {
  return Math.round((Date.now() - this.initiatedAt.getTime()) / (1000 * 60)); // minutes
});

// Pre-save middleware to generate transaction ID
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    // Generate unique transaction ID: TXN + timestamp + random
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.transactionId = `TXN${timestamp}${random}`;
  }

  next();
});

// Instance method to mark as completed
paymentSchema.methods.markCompleted = function(gatewayTxnId = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (gatewayTxnId) {
    this.gatewayTransactionId = gatewayTxnId;
  }
  return this.save();
};

// Instance method to mark as failed
paymentSchema.methods.markFailed = function(reason = '') {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(amount, reason = '') {
  if (this.status !== 'completed') {
    throw new Error('Cannot refund a payment that is not completed');
  }

  if (amount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }

  this.status = 'refunded';
  this.refundAmount = amount;
  this.refundReason = reason;
  this.refundedAt = new Date();

  return this.save();
};

// Static method to find expired payments
paymentSchema.statics.findExpired = function() {
  return this.find({
    status: 'pending',
    expiresAt: { $lt: new Date() }
  });
};

// Static method to cleanup expired payments
paymentSchema.statics.cleanupExpired = async function() {
  const expiredPayments = await this.findExpired();

  // Mark expired payments as cancelled
  const updatePromises = expiredPayments.map(payment => {
    payment.status = 'cancelled';
    return payment.save();
  });

  await Promise.all(updatePromises);
  return expiredPayments.length;
};

export default mongoose.model('Payment', paymentSchema);
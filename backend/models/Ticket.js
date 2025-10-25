import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendee',
    required: [true, 'Attendee is required']
  },
  category: {
    type: String,
    required: [true, 'Ticket category is required'],
    enum: ['vip', 'fan-pit', 'general', 'balcony', 'premium'],
    lowercase: true
  },
  seatNo: {
    type: String,
    required: [true, 'Seat number is required'],
    trim: true,
    maxlength: [10, 'Seat number cannot exceed 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled', 'refunded', 'reserved'],
    default: 'active'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  ticketNumber: {
    type: String,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  reservedAt: {
    type: Date
  },
  reservationExpiresAt: {
    type: Date
  },
  issuedAt: {
    type: Date
  },
  metadata: {
    row: String,
    section: String,
    gate: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  isTransferred: {
    type: Boolean,
    default: false
  },
  transferHistory: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendee'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendee'
    },
    transferredAt: { type: Date, default: Date.now },
    reason: String
  }],
  checkIn: {
    checkedIn: { type: Boolean, default: false },
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    gate: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ticketSchema.index({ event: 1 });
ticketSchema.index({ attendee: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ category: 1 });

// Compound indexes
ticketSchema.index({ event: 1, attendee: 1 });
ticketSchema.index({ event: 1, status: 1 });

// Virtual for formatted price
ticketSchema.virtual('formattedPrice').get(function() {
  return `${this.currency} ${this.price.toLocaleString()}`;
});

// Virtual for seat location
ticketSchema.virtual('seatLocation').get(function() {
  return `${this.metadata?.section || ''} ${this.metadata?.row || ''}${this.seatNo}`.trim();
});

// Pre-save middleware to generate ticket number and QR code
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    // Generate unique ticket number: EVT + eventId (first 6 chars) + timestamp + random
    const eventId = this.event.toString().substring(0, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.ticketNumber = `EVT${eventId}${timestamp}${random}`;
  }

  if (!this.qrCode) {
    try {
      console.log('Generating QR code for ticket:', this.ticketNumber);
      // Import qrcode dynamically to avoid issues if not installed
      const qrcode = (await import('qrcode')).default;

      // Generate QR code data containing ticket information
      const qrData = JSON.stringify({
        ticketId: this._id.toString(),
        ticketNumber: this.ticketNumber,
        eventId: this.event.toString(),
        attendeeId: this.attendee.toString(),
        seatNo: this.seatNo,
        category: this.category,
        price: this.price,
        issuedAt: this.issuedAt || new Date(),
        status: this.status
      });

      // Generate QR code as data URL
      this.qrCode = await qrcode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#22c55e', // Green color to match theme
          light: '#ffffff'
        }
      });

      console.log('QR code generated successfully for ticket:', this.ticketNumber);
      console.log('QR code starts with:', this.qrCode.substring(0, 50));
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to text-based QR code data
      this.qrCode = `TICKET_${this.ticketNumber}_${Date.now()}`;
      console.log('Using fallback QR code:', this.qrCode);
    }
  }

  next();
});

// Instance method to mark as used
ticketSchema.methods.markAsUsed = function(staffId, gate) {
  this.checkIn.checkedIn = true;
  this.checkIn.checkedInAt = new Date();
  this.checkIn.checkedInBy = staffId;
  this.checkIn.gate = gate;
  this.status = 'used';
  return this.save();
};

// Instance method to transfer ticket
ticketSchema.methods.transfer = function(toAttendeeId, reason = '') {
  this.transferHistory.push({
    from: this.attendee,
    to: toAttendeeId,
    reason
  });
  this.attendee = toAttendeeId;
  this.isTransferred = true;
  return this.save();
};

// Static method to find tickets by event
ticketSchema.statics.findByEvent = function(eventId, status = null) {
  const query = { event: eventId };
  if (status) query.status = status;
  return this.find(query).populate('attendee', 'name email');
};

export default mongoose.model('Ticket', ticketSchema);
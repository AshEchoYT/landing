import { validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Initiate payment for a ticket
// @route   POST /api/v1/payments/initiate
// @access  Private
export const initiatePayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { ticketId, paymentMethod, amount, category } = req.body;

  // Find the ticket
  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Check if ticket belongs to user
  if (ticket.attendee.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this ticket'
    });
  }

  // Check if ticket is in active status (already booked)
  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Ticket is not in a payable state'
    });
  }

  // Check if ticket already has a completed payment
  const existingCompletedPayment = await Payment.findOne({ ticket: ticketId, status: 'completed' });
  if (existingCompletedPayment) {
    return res.status(400).json({
      success: false,
      message: 'Payment already completed for this ticket'
    });
  }

  // Update ticket with payment details
  ticket.price = amount;
  ticket.category = category || ticket.category || 'general';
  await ticket.save();

  // Check if payment already exists for this ticket
  const existingPayment = await Payment.findOne({ ticket: ticketId, status: { $in: ['pending', 'completed'] } });
  if (existingPayment) {
    return res.status(400).json({
      success: false,
      message: 'Payment already initiated for this ticket'
    });
  }

  // Create payment record
  // Generate unique transaction ID
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const transactionId = `TXN${timestamp}${random}`;

  const payment = await Payment.create({
    ticket: ticketId,
    attendee: req.user._id,
    event: ticket.event._id,
    amount,
    paymentMethod,
    status: 'pending',
    transactionId
  });

  res.status(201).json({
    success: true,
    message: 'Payment initiated successfully',
    data: {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      expiresAt: payment.expiresAt
    }
  });
});

// @desc    Process payment (simulate payment gateway)
// @route   POST /api/v1/payments/:paymentId/process
// @access  Private
export const processPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { cardDetails, upiId } = req.body; // Mock payment data

  const payment = await Payment.findById(paymentId).populate('ticket');
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // Check if payment belongs to user
  if (payment.attendee.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to process this payment'
    });
  }

  // Check if payment is still pending
  if (payment.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Payment is not in a processable state'
    });
  }

  // Check if payment hasn't expired
  if (payment.expiresAt < new Date()) {
    payment.status = 'cancelled';
    await payment.save();
    return res.status(400).json({
      success: false,
      message: 'Payment has expired'
    });
  }

  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment success (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // Mark payment as completed
      await payment.markCompleted(`GATEWAY_${Date.now()}`);

      // Ticket is already active from booking, just update issuedAt if not set
      if (!payment.ticket.issuedAt) {
        payment.ticket.issuedAt = new Date();
        await payment.ticket.save();
      }

      // Update event analytics (only if not already counted from booking)
      // Note: Analytics are already updated in bookSeat, so we might not need to update again
      // But keeping this for safety in case of payment-only flows

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          paymentId: payment._id,
          transactionId: payment.transactionId,
          status: payment.status,
          ticket: {
            ticketId: payment.ticket._id,
            ticketNumber: payment.ticket.ticketNumber,
            qrCode: payment.ticket.qrCode
          }
        }
      });
    } else {
      // Mark payment as failed
      await payment.markFailed('Payment gateway declined the transaction');

      res.status(400).json({
        success: false,
        message: 'Payment failed',
        data: {
          paymentId: payment._id,
          status: payment.status,
          failureReason: payment.failureReason
        }
      });
    }
  } catch (error) {
    await payment.markFailed('Internal server error during payment processing');
    throw error;
  }
});

// @desc    Get payment details
// @route   GET /api/v1/payments/:paymentId
// @access  Private
export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate('ticket', 'ticketNumber qrCode category price')
    .populate('event', 'name startDate')
    .populate('attendee', 'name email');

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // Check if payment belongs to user or user is admin
  if (payment.attendee._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this payment'
    });
  }

  res.json({
    success: true,
    data: { payment }
  });
});

// @desc    Get user payments
// @route   GET /api/v1/payments/user/:userId
// @access  Private
export const getUserPayments = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user is requesting their own payments or is admin
  if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these payments'
    });
  }

  const payments = await Payment.find({ attendee: userId })
    .populate('ticket', 'ticketNumber category price')
    .populate('event', 'name startDate')
    .sort({ initiatedAt: -1 });

  res.json({
    success: true,
    data: { payments }
  });
});

// @desc    Cancel payment
// @route   DELETE /api/v1/payments/:paymentId
// @access  Private
export const cancelPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // Check if payment belongs to user
  if (payment.attendee.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this payment'
    });
  }

  // Check if payment can be cancelled
  if (!['pending', 'failed'].includes(payment.status)) {
    return res.status(400).json({
      success: false,
      message: 'Payment cannot be cancelled'
    });
  }

  payment.status = 'cancelled';
  await payment.save();

  res.json({
    success: true,
    message: 'Payment cancelled successfully'
  });
});

// @desc    Process refund
// @route   POST /api/v1/payments/:paymentId/refund
// @access  Private (Admin only)
export const processRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  const payment = await Payment.findById(paymentId).populate('ticket');
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // Only admins can process refunds
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to process refunds'
    });
  }

  try {
    await payment.processRefund(amount, reason);

    // Update ticket status to refunded
    payment.ticket.status = 'refunded';
    await payment.ticket.save();

    // Update event analytics
    await Event.findByIdAndUpdate(payment.ticket.event, {
      $inc: {
        'analytics.revenue': -amount
      }
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        paymentId: payment._id,
        refundAmount: payment.refundAmount,
        refundReason: payment.refundReason
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Cleanup expired payments (Admin utility)
// @route   POST /api/v1/payments/cleanup
// @access  Private (Admin)
export const cleanupExpiredPayments = asyncHandler(async (req, res) => {
  const cleanedCount = await Payment.cleanupExpired();

  res.json({
    success: true,
    message: `${cleanedCount} expired payments cleaned up`
  });
});

// @desc    Process mock payment (legacy support)
// @route   POST /api/v1/payments/mock
// @access  Private
export const processMockPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { attendeeId, ticketId, amount, mode } = req.body;

  // Verify ticket exists and belongs to user
  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  if (ticket.attendee.toString() !== attendeeId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to pay for this ticket'
    });
  }

  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Ticket is not available for payment'
    });
  }

  // Check if payment already exists and is completed
  const existingPayment = await Payment.findOne({ ticket: ticketId, status: 'completed' });
  if (existingPayment) {
    return res.status(400).json({
      success: false,
      message: 'Payment already completed for this ticket'
    });
  }

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create payment record
  // Generate unique transaction ID
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const transactionId = `TXN${timestamp}${random}`;

  const payment = await Payment.create({
    ticket: ticketId,
    attendee: attendeeId,
    event: ticket.event._id,
    amount,
    paymentMethod: mode.toLowerCase(),
    status: 'completed',
    completedAt: new Date(),
    transactionId
  });

  // Update ticket with payment reference (ticket is already active from booking)
  ticket.payment = payment._id;
  if (!ticket.issuedAt) {
    ticket.issuedAt = new Date();
  }
  await ticket.save();

  // Note: Event analytics are already updated in bookSeat, so we don't update them again here

  res.json({
    success: true,
    message: 'Mock payment successful',
    data: {
      paymentId: payment._id,
      status: 'completed',
      amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      ticket: {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        qrCode: ticket.qrCode
      }
    }
  });
});

// @desc    Get payment statistics
// @route   GET /api/v1/payments/stats/:userId
// @access  Private
export const getPaymentStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user is requesting their own stats or is admin
  if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these statistics'
    });
  }

  const payments = await Payment.find({ attendee: userId });

  const stats = {
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === 'completed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  res.json({
    success: true,
    data: { stats }
  });
});
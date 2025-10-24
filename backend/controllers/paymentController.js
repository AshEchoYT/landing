import { validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Process mock payment
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

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create payment record
  const payment = await Payment.create({
    attendee: attendeeId,
    ticket: ticketId,
    amount,
    mode,
    status: 'Success',
    date: new Date()
  });

  // Update ticket with payment reference and mark as issued
  ticket.payment = payment._id;
  ticket.status = 'active'; // Keep as active, ticket will be issued separately
  await ticket.save();

  // Update event analytics
  await Event.findByIdAndUpdate(ticket.event._id, {
    $inc: { 'analytics.revenue': amount }
  });

  res.json({
    success: true,
    message: 'Mock payment successful',
    data: {
      paymentId: payment._id,
      status: 'Success',
      amount,
      mode,
      transactionId: payment.transactionId
    }
  });
});

// @desc    Get user payment history
// @route   GET /api/v1/payments/:userId
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
    .populate('ticket', 'event seatNo price category')
    .sort({ date: -1 });

  res.json({
    success: true,
    data: { payments }
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

  const stats = await Payment.getPaymentStats(userId);

  res.json({
    success: true,
    data: { stats }
  });
});

// @desc    Process refund
// @route   POST /api/v1/payments/:paymentId/refund
// @access  Private (Admin only)
export const processRefund = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { reason, amount } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  if (payment.status !== 'Success') {
    return res.status(400).json({
      success: false,
      message: 'Only successful payments can be refunded'
    });
  }

  // Process refund
  const refundAmount = amount || payment.amount;
  await payment.processRefund(refundAmount, reason);

  // Update ticket status
  await Ticket.findByIdAndUpdate(payment.ticket, { status: 'refunded' });

  // Update event analytics
  await Event.findByIdAndUpdate(
    (await Ticket.findById(payment.ticket)).event,
    { $inc: { 'analytics.revenue': -refundAmount } }
  );

  res.json({
    success: true,
    message: 'Refund processed successfully',
    data: {
      paymentId: payment._id,
      refundAmount,
      refundId: payment.refund.refundTransactionId
    }
  });
});

// @desc    Get payment details
// @route   GET /api/v1/payments/:paymentId
// @access  Private
export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate('attendee', 'name email')
    .populate('ticket', 'event seatNo price category');

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  // Check if user is authorized to view this payment
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
import { validationResult } from 'express-validator';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Issue ticket after payment
// @route   POST /api/v1/tickets/issue
// @access  Private
export const issueTicket = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { attendeeId, eventId, seatNo, category, price } = req.body;

  // Check if event exists and has available seats
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Event is not active'
    });
  }

  // Check if seat is available
  const existingTicket = await Ticket.findOne({ event: eventId, seatNo });
  if (existingTicket) {
    return res.status(400).json({
      success: false,
      message: 'Seat is already taken'
    });
  }

  // Create ticket
  const ticket = await Ticket.create({
    attendee: attendeeId,
    event: eventId,
    seatNo,
    category,
    price,
    status: 'active',
    issuedAt: new Date()
  });

  // Update event analytics
  await Event.findByIdAndUpdate(eventId, {
    $inc: {
      'analytics.ticketsSold': 1,
      'analytics.attendees': 1
    }
  });

  res.status(201).json({
    success: true,
    message: 'Ticket issued successfully',
    data: { ticket }
  });
});

// @desc    Get user's tickets
// @route   GET /api/v1/tickets/:userId
// @access  Private
export const getUserTickets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, eventId } = req.query;

  // Check if user is requesting their own tickets or is admin
  if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these tickets'
    });
  }

  const query = { attendee: userId };
  if (status) query.status = status;
  if (eventId) query.event = eventId;

  const tickets = await Ticket.find(query)
    .populate('event', 'title date venue category')
    .populate('payment', 'amount status date')
    .sort({ issuedAt: -1 });

  res.json({
    success: true,
    data: { tickets }
  });
});

// @desc    Get ticket details
// @route   GET /api/v1/tickets/detail/:ticketId
// @access  Private
export const getTicketDetails = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId)
    .populate('attendee', 'name email phone')
    .populate('event', 'title date venue category description')
    .populate('payment', 'amount status date mode');

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Check if user is authorized to view this ticket
  if (ticket.attendee._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this ticket'
    });
  }

  res.json({
    success: true,
    data: { ticket }
  });
});

// @desc    Cancel ticket
// @route   PUT /api/v1/tickets/:ticketId/cancel
// @access  Private
export const cancelTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { reason } = req.body;

  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Check if user owns the ticket or is admin
  if (ticket.attendee.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this ticket'
    });
  }

  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Ticket cannot be cancelled'
    });
  }

  // Check if event allows cancellation (not too close to event date)
  const eventDate = new Date(ticket.event.date);
  const now = new Date();
  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

  if (hoursUntilEvent < 24) {
    return res.status(400).json({
      success: false,
      message: 'Tickets cannot be cancelled less than 24 hours before the event'
    });
  }

  // Cancel ticket
  ticket.status = 'cancelled';
  ticket.cancelledAt = new Date();
  ticket.cancellationReason = reason;
  await ticket.save();

  // Update event analytics
  await Event.findByIdAndUpdate(ticket.event._id, {
    $inc: {
      'analytics.ticketsSold': -1,
      'analytics.attendees': -1
    }
  });

  res.json({
    success: true,
    message: 'Ticket cancelled successfully',
    data: { ticket }
  });
});

// @desc    Transfer ticket
// @route   PUT /api/v1/tickets/:ticketId/transfer
// @access  Private
export const transferTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { newAttendeeId } = req.body;

  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Check if user owns the ticket
  if (ticket.attendee.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to transfer this ticket'
    });
  }

  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Ticket cannot be transferred'
    });
  }

  // Check if event allows transfers (not too close to event date)
  const eventDate = new Date(ticket.event.date);
  const now = new Date();
  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

  if (hoursUntilEvent < 48) {
    return res.status(400).json({
      success: false,
      message: 'Tickets cannot be transferred less than 48 hours before the event'
    });
  }

  // Transfer ticket
  ticket.attendee = newAttendeeId;
  ticket.transferredAt = new Date();
  await ticket.save();

  res.json({
    success: true,
    message: 'Ticket transferred successfully',
    data: { ticket }
  });
});

// @desc    Get event tickets (for organizers)
// @route   GET /api/v1/tickets/event/:eventId
// @access  Private (Organizer/Admin)
export const getEventTickets = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { status, category } = req.query;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view event tickets'
    });
  }

  const query = { event: eventId };
  if (status) query.status = status;
  if (category) query.category = category;

  const tickets = await Ticket.find(query)
    .populate('attendee', 'name email phone')
    .populate('payment', 'amount status date')
    .sort({ issuedAt: -1 });

  res.json({
    success: true,
    data: { tickets }
  });
});

// @desc    Validate ticket (for entry)
// @route   POST /api/v1/tickets/validate
// @access  Private (Staff/Admin)
export const validateTicket = asyncHandler(async (req, res) => {
  const { ticketId, eventId } = req.body;

  const ticket = await Ticket.findById(ticketId).populate('event');
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  if (ticket.event._id.toString() !== eventId) {
    return res.status(400).json({
      success: false,
      message: 'Ticket does not belong to this event'
    });
  }

  if (ticket.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: `Ticket is ${ticket.status}`
    });
  }

  // Check if ticket has been used
  if (ticket.used) {
    return res.status(400).json({
      success: false,
      message: 'Ticket has already been used'
    });
  }

  // Mark ticket as used
  ticket.used = true;
  ticket.usedAt = new Date();
  await ticket.save();

  res.json({
    success: true,
    message: 'Ticket validated successfully',
    data: {
      ticketId: ticket._id,
      attendee: ticket.attendee,
      seatNo: ticket.seatNo,
      category: ticket.category
    }
  });
});
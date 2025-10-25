import { validationResult } from 'express-validator';
import Attendee from '../models/Attendee.js';
import Ticket from '../models/Ticket.js';
import Payment from '../models/Payment.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get attendee profile
// @route   GET /api/v1/attendees/profile
// @access  Private
export const getAttendeeProfile = asyncHandler(async (req, res) => {
  const attendee = await Attendee.findById(req.user._id);

  if (!attendee) {
    return res.status(404).json({
      success: false,
      message: 'Attendee not found'
    });
  }

  res.json({
    success: true,
    data: { attendee: attendee.getPublicProfile() }
  });
});

// @desc    Update attendee profile
// @route   PUT /api/v1/attendees/profile
// @access  Private
export const updateAttendeeProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, phoneNumbers, preferences, profilePicture } = req.body;

  const attendee = await Attendee.findByIdAndUpdate(
    req.user._id,
    {
      name: name || req.user.name,
      phoneNumbers: phoneNumbers || req.user.phoneNumbers,
      preferences: preferences || req.user.preferences,
      profilePicture: profilePicture || req.user.profilePicture
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { attendee: attendee.getPublicProfile() }
  });
});

// @desc    Get attendee's ticket history
// @route   GET /api/v1/attendees/tickets
// @access  Private
export const getAttendeeTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, eventId } = req.query;

  const filter = { attendee: req.user._id };
  if (status) filter.status = status;
  if (eventId) filter.event = eventId;

  const skip = (page - 1) * limit;

  const tickets = await Ticket.find(filter)
    .populate('event', 'title date venue category')
    .populate('payment', 'amount status date')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Ticket.countDocuments(filter);

  res.json({
    success: true,
    data: {
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get attendee's event history
// @route   GET /api/v1/attendees/events
// @access  Private
export const getAttendeeEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = 'all' } = req.query;

  // Get all tickets for this attendee
  const ticketFilter = { attendee: req.user._id };
  if (status !== 'all') {
    ticketFilter.status = status;
  }

  const tickets = await Ticket.find(ticketFilter).select('event status');

  // Extract unique event IDs
  const eventIds = [...new Set(tickets.map(ticket => ticket.event.toString()))];

  const filter = { _id: { $in: eventIds } };
  const skip = (page - 1) * limit;

  const events = await Event.find(filter)
    .populate('venue', 'name address.city')
    .populate('organizer', 'name')
    .select('title date venue organizer category status analytics')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Add ticket status to each event
  const eventsWithTicketStatus = events.map(event => {
    const eventTickets = tickets.filter(ticket =>
      ticket.event.toString() === event._id.toString()
    );
    const ticketStatus = eventTickets.length > 0 ? eventTickets[0].status : 'unknown';

    return {
      ...event.toObject(),
      ticketStatus
    };
  });

  const total = eventIds.length;

  res.json({
    success: true,
    data: {
      events: eventsWithTicketStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get attendee's payment history
// @route   GET /api/v1/attendees/payments
// @access  Private
export const getAttendeePayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = { attendee: req.user._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const payments = await Payment.find(filter)
    .populate('ticket', 'event category price')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments(filter);

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get attendee statistics
// @route   GET /api/v1/attendees/stats
// @access  Private
export const getAttendeeStats = asyncHandler(async (req, res) => {
  const attendeeId = req.user._id;

  // Total tickets purchased
  const totalTickets = await Ticket.countDocuments({ attendee: attendeeId });

  // Active tickets
  const activeTickets = await Ticket.countDocuments({
    attendee: attendeeId,
    status: 'active'
  });

  // Total amount spent
  const payments = await Payment.find({
    attendee: attendeeId,
    status: 'Success'
  }).select('amount');

  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Events attended
  const uniqueEvents = await Ticket.distinct('event', { attendee: attendeeId });
  const eventsAttended = uniqueEvents.length;

  // Upcoming events
  const upcomingTickets = await Ticket.find({
    attendee: attendeeId,
    status: 'active'
  }).populate('event', 'startDate');

  const upcomingEvents = upcomingTickets.filter(ticket =>
    ticket.event && new Date(ticket.event.startDate) > new Date()
  ).length;

  // Favorite categories
  const categoryStats = await Ticket.aggregate([
    { $match: { attendee: attendeeId } },
    {
      $lookup: {
        from: 'events',
        localField: 'event',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    {
      $group: {
        _id: '$event.category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalTickets,
        activeTickets,
        totalSpent,
        eventsAttended,
        upcomingEvents,
        favoriteCategories: categoryStats
      }
    }
  });
});

// @desc    Get all attendees (Admin only)
// @route   GET /api/v1/attendees
// @access  Private (Admin only)
export const getAttendees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (page - 1) * limit;

  const attendees = await Attendee.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Attendee.countDocuments(filter);

  res.json({
    success: true,
    data: {
      attendees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single attendee (Admin only)
// @route   GET /api/v1/attendees/:id
// @access  Private (Admin only)
export const getAttendee = asyncHandler(async (req, res) => {
  const attendee = await Attendee.findById(req.params.id).select('-password');

  if (!attendee) {
    return res.status(404).json({
      success: false,
      message: 'Attendee not found'
    });
  }

  res.json({
    success: true,
    data: { attendee }
  });
});

// @desc    Update attendee (Admin only)
// @route   PUT /api/v1/attendees/:id
// @access  Private (Admin only)
export const updateAttendee = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const attendee = await Attendee.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  if (!attendee) {
    return res.status(404).json({
      success: false,
      message: 'Attendee not found'
    });
  }

  res.json({
    success: true,
    message: 'Attendee updated successfully',
    data: { attendee }
  });
});

// @desc    Deactivate attendee (Admin only)
// @route   DELETE /api/v1/attendees/:id
// @access  Private (Admin only)
export const deactivateAttendee = asyncHandler(async (req, res) => {
  const attendee = await Attendee.findById(req.params.id);

  if (!attendee) {
    return res.status(404).json({
      success: false,
      message: 'Attendee not found'
    });
  }

  attendee.isActive = false;
  await attendee.save();

  res.json({
    success: true,
    message: 'Attendee deactivated successfully'
  });
});
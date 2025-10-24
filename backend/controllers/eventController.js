import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
export const getEvents = asyncHandler(async (req, res) => {
  const {
    type,
    city,
    date,
    status = 'published',
    limit = 10,
    page = 1,
    sort = '-startDate'
  } = req.query;

  // Build filter object
  const filter = { status };

  if (type && type !== 'all') {
    filter.type = type;
  }

  if (city) {
    filter['venue.address.city'] = new RegExp(city, 'i');
  }

  if (date) {
    const searchDate = new Date(date);
    filter.startDate = {
      $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
      $lt: new Date(searchDate.setHours(23, 59, 59, 999))
    };
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get events with populated fields
  const events = await Event.find(filter)
    .populate('organizer', 'name email')
    .populate('venue', 'name address.city capacity')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-staff -sponsors -vendors -attendees'); // Exclude sensitive arrays

  // Get total count for pagination
  const total = await Event.countDocuments(filter);

  res.json({
    success: true,
    data: {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email companyName')
    .populate('venue', 'name address capacity facilities')
    .populate('staff.staff', 'name role')
    .populate('sponsors.sponsor', 'name sponsorshipType')
    .populate('vendors.vendor', 'name serviceType');

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if event is published or user is organizer/admin
  if (event.status !== 'published' && req.user?.role !== 'admin' && req.user?._id.toString() !== event.organizer._id.toString()) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  res.json({
    success: true,
    data: { event }
  });
});

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private (Organizer/Admin)
export const createEvent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const eventData = {
    ...req.body,
    organizer: req.user._id
  };

  const event = await Event.create(eventData);

  // Update organizer's event count
  await Attendee.findByIdAndUpdate(req.user._id, { $inc: { totalEvents: 1 } });

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event }
  });
});

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Organizer/Admin)
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user is authorized to update
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this event'
    });
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event: updatedEvent }
  });
});

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private (Organizer/Admin)
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user is authorized to delete
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this event'
    });
  }

  // Soft delete by changing status
  event.status = 'cancelled';
  await event.save();

  res.json({
    success: true,
    message: 'Event cancelled successfully'
  });
});

// @desc    Register for event
// @route   POST /api/v1/events/:id/register
// @access  Private (Attendee)
export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Event is not available for registration'
    });
  }

  // Check if user is already registered
  const isRegistered = event.attendees.some(
    attendee => attendee.attendee.toString() === req.user._id.toString()
  );

  if (isRegistered) {
    return res.status(400).json({
      success: false,
      message: 'Already registered for this event'
    });
  }

  // Add attendee to event
  event.attendees.push({
    attendee: req.user._id,
    registeredAt: new Date()
  });

  await event.save();

  res.json({
    success: true,
    message: 'Successfully registered for event'
  });
});

// @desc    Get event analytics
// @route   GET /api/v1/events/:id/analytics
// @access  Private (Organizer/Admin)
export const getEventAnalytics = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user is authorized
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view analytics'
    });
  }

  const analytics = {
    totalRegistrations: event.attendees.length,
    confirmedAttendees: event.attendees.filter(a => a.status === 'registered').length,
    revenue: event.analytics.revenue,
    views: event.analytics.views,
    rating: event.analytics.rating
  };

  res.json({
    success: true,
    data: { analytics }
  });
});
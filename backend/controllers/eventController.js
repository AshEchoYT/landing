import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
export const getEvents = asyncHandler(async (req, res) => {
  const {
    category,
    city,
    date,
    status = 'published',
    limit = 10,
    page = 1,
    organizer,
    sort = '-startDate'
  } = req.query;

  // Build filter object
  const filter = { status };

  if (category && category !== 'all') {
    filter.type = category; // Map category to type
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

  if (organizer) {
    filter.organizer = organizer;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get events with populated fields
  const events = await Event.find(filter)
    .populate('organizer', 'name email')
    .populate('venue', 'name address capacity')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-staff -sponsors -vendors'); // Keep attendees for analytics

  // Transform events to match frontend expectations
  const transformedEvents = events.map(event => ({
    _id: event._id,
    title: event.name, // Map name to title
    description: event.description,
    date: event.startDate.toISOString().split('T')[0], // Format date
    venue: {
      _id: event.venue._id,
      name: event.venue.name,
      location: `${event.venue.address?.city || ''}, ${event.venue.address?.state || ''}`,
      capacity: event.venue.capacity
    },
    organizer: event.organizer._id,
    category: event.type, // Map type to category
    tags: event.tags,
    pricing: event.pricing ? [{
      category: 'standard',
      price: event.pricing.minPrice
    }] : [],
    capacity: event.capacity,
    status: event.status,
    image: event.primaryImage?.url || '',
    analytics: {
      ticketsSold: event.attendees.filter(a => a.status === 'registered').length,
      attendees: event.attendees.filter(a => a.status === 'attended').length,
      revenue: event.analytics.revenue
    },
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  }));

  // Get total count for pagination
  const total = await Event.countDocuments(filter);

  res.json({
    success: true,
    data: {
      events: transformedEvents,
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

  // Transform event to match frontend expectations
  const transformedEvent = {
    _id: event._id,
    title: event.name,
    description: event.description,
    date: event.startDate.toISOString().split('T')[0],
    venue: {
      _id: event.venue._id,
      name: event.venue.name,
      location: `${event.venue.address?.city || ''}, ${event.venue.address?.state || ''}`,
      capacity: event.venue.capacity
    },
    organizer: event.organizer._id,
    category: event.type,
    tags: event.tags,
    pricing: event.pricing ? [{
      category: 'standard',
      price: event.pricing.minPrice
    }] : [],
    capacity: event.capacity,
    status: event.status,
    image: event.primaryImage?.url || '',
    analytics: {
      ticketsSold: event.attendees.filter(a => a.status === 'registered').length,
      attendees: event.attendees.filter(a => a.status === 'attended').length,
      revenue: event.analytics.revenue
    },
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };

  res.json({
    success: true,
    data: { event: transformedEvent }
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

  // Transform frontend data to match backend model
  const eventDate = new Date(req.body.date);
  const eventData = {
    name: req.body.title,
    type: req.body.category,
    description: req.body.description,
    startDate: eventDate,
    endDate: eventDate, // For now, assume single day event
    startTime: eventDate.toTimeString().slice(0, 5), // Extract time from date
    endTime: eventDate.toTimeString().slice(0, 5), // For now, same as start time
    venue: req.body.venue,
    capacity: req.body.capacity,
    organizer: req.user._id,
    status: 'published', // Set as published by default
    tags: req.body.tags || [],
    // Transform pricing array to pricing object
    pricing: req.body.pricing && req.body.pricing.length > 0 ? {
      minPrice: Math.min(...req.body.pricing.map(p => p.price)),
      maxPrice: Math.max(...req.body.pricing.map(p => p.price)),
      currency: 'USD' // Default currency
    } : {
      minPrice: 0,
      maxPrice: 0,
      currency: 'USD'
    },
    // Handle image upload
    images: req.body.image ? [{
      url: req.body.image,
      alt: req.body.title,
      isPrimary: true
    }] : []
  };

  const event = await Event.create(eventData);

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

  // Transform frontend data to backend format
  const eventData = {
    name: req.body.title,
    description: req.body.description,
    type: req.body.category,
    startDate: new Date(req.body.date),
    endDate: new Date(req.body.date), // Assuming single day event for now
    venue: req.body.venue,
    tags: req.body.tags,
    capacity: req.body.capacity,
    status: req.body.status,
    pricing: req.body.pricing && req.body.pricing.length > 0 ? {
      minPrice: Math.min(...req.body.pricing.map(p => p.price)),
      maxPrice: Math.max(...req.body.pricing.map(p => p.price)),
      currency: 'USD'
    } : event.pricing,
    // Handle image update
    images: req.body.image ? [{
      url: req.body.image,
      alt: req.body.title,
      isPrimary: true
    }] : event.images
  };

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    eventData,
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
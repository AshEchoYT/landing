import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import Venue from '../models/Venue.js';
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
    .populate('staff.staff', 'name email role')
    .populate('sponsors.sponsor', 'name email companyName sponsorshipType contributionAmount')
    .populate({
      path: 'vendors.vendor',
      select: 'name serviceType'
    })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Transform events to match frontend expectations
  const transformedEvents = events.map(event => ({
    _id: event._id,
    title: event.name, // Map name to title
    description: event.description,
    date: event.startDate.toISOString().split('T')[0], // Format date
    venue: event.venue ? {
      _id: event.venue._id,
      name: event.venue.name,
      location: `${event.venue.address?.city || ''}, ${event.venue.address?.state || ''}`,
      capacity: event.venue.capacity
    } : null,
    organizer: event.organizer ? event.organizer._id : null,
    category: event.type, // Map type to category
    tags: event.tags,
    theme: event.theme,
    budget: event.budget,
    visibility: event.visibility,
    ageRestriction: event.ageRestriction,
    pricing: event.pricing ? [{
      category: 'standard',
      price: event.pricing.minPrice
    }] : [],
    capacity: 60, // Fixed capacity for all events
    status: event.status,
    image: event.primaryImage?.url || '',
    staffCount: event.staffCount,
    sponsor: event.sponsor,
    staff: event.staff ? event.staff.map(staffAssignment => ({
      staff: staffAssignment.staff ? {
        _id: staffAssignment.staff._id,
        name: staffAssignment.staff.name,
        email: staffAssignment.staff.email,
        role: staffAssignment.staff.role
      } : null,
      role: staffAssignment.role,
      assignedAt: staffAssignment.assignedAt
    })) : [],
    sponsors: event.sponsors ? event.sponsors.map(sponsorAssignment => ({
      sponsor: sponsorAssignment.sponsor ? {
        _id: sponsorAssignment.sponsor._id,
        name: sponsorAssignment.sponsor.name,
        company: sponsorAssignment.sponsor.companyName,
        sponsorshipLevel: sponsorAssignment.sponsor.sponsorshipType,
        amount: sponsorAssignment.sponsor.contributionAmount
      } : null,
      contributionAmount: sponsorAssignment.contributionAmount,
      sponsorshipType: sponsorAssignment.sponsorshipType,
      perks: sponsorAssignment.perks
    })) : [],
    vendors: event.vendors ? event.vendors.map(vendorAssignment => ({
      vendor: vendorAssignment.vendor ? {
        _id: vendorAssignment.vendor._id,
        name: vendorAssignment.vendor.name,
        serviceType: vendorAssignment.vendor.serviceType
      } : null,
      serviceType: vendorAssignment.serviceType,
      contractAmount: vendorAssignment.contractAmount
    })) : [],
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
    .populate('staff.staff', 'name email role')
    .populate('sponsors.sponsor', 'name email companyName sponsorshipType contributionAmount')
    .populate({
      path: 'vendors.vendor',
      select: 'name serviceType'
    });

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
    venue: event.venue ? {
      _id: event.venue._id,
      name: event.venue.name,
      location: `${event.venue.address?.city || ''}, ${event.venue.address?.state || ''}`,
      capacity: event.venue.capacity
    } : null,
    organizer: event.organizer ? event.organizer._id : null,
    category: event.type, // Map type to category
    tags: event.tags,
    theme: event.theme,
    budget: event.budget,
    visibility: event.visibility,
    ageRestriction: event.ageRestriction,
    pricing: event.pricing ? [{
      category: 'standard',
      price: event.pricing.minPrice
    }] : [],
    capacity: 60, // Fixed capacity for all events
    status: event.status,
    image: event.primaryImage?.url || '',
    staffCount: event.staffCount,
    sponsor: event.sponsor,
    staff: event.staff ? event.staff.map(staffAssignment => ({
      staff: staffAssignment.staff ? {
        _id: staffAssignment.staff._id,
        name: staffAssignment.staff.name,
        email: staffAssignment.staff.email,
        role: staffAssignment.staff.role
      } : null,
      role: staffAssignment.role,
      assignedAt: staffAssignment.assignedAt
    })) : [],
    sponsors: event.sponsors ? event.sponsors.map(sponsorAssignment => ({
      sponsor: sponsorAssignment.sponsor ? {
        _id: sponsorAssignment.sponsor._id,
        name: sponsorAssignment.sponsor.name,
        company: sponsorAssignment.sponsor.companyName,
        sponsorshipLevel: sponsorAssignment.sponsor.sponsorshipType,
        amount: sponsorAssignment.sponsor.contributionAmount
      } : null,
      contributionAmount: sponsorAssignment.contributionAmount,
      sponsorshipType: sponsorAssignment.sponsorshipType,
      perks: sponsorAssignment.perks
    })) : [],
    vendors: event.vendors ? event.vendors.map(vendorAssignment => ({
      vendor: vendorAssignment.vendor ? {
        _id: vendorAssignment.vendor._id,
        name: vendorAssignment.vendor.name,
        serviceType: vendorAssignment.vendor.serviceType
      } : null,
      serviceType: vendorAssignment.serviceType,
      contractAmount: vendorAssignment.contractAmount
    })) : [],
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
  const eventDateTime = new Date(req.body.date);
  const eventData = {
    name: req.body.title,
    type: req.body.category,
    description: req.body.description,
    startDate: eventDateTime,
    endDate: eventDateTime, // For now, assume single day event
    startTime: eventDateTime.toISOString().slice(11, 16), // Extract time in HH:MM format
    endTime: eventDateTime.toISOString().slice(11, 16), // For now, same as start time
    venue: req.body.venue,
    organizer: req.user._id,
    status: 'published', // Set as published by default
    capacity: 60, // Fixed capacity for all events (same seat map)
    tags: req.body.tags || [],
    theme: req.body.theme || undefined,
    budget: req.body.budget || 0,
    visibility: req.body.visibility || 'public',
    ageRestriction: req.body.ageRestriction || 0,
    // Transform pricing array to pricing object
    pricing: req.body.pricing && req.body.pricing.length > 0 ? {
      minPrice: Math.min(...req.body.pricing.map(p => p.price)),
      maxPrice: Math.max(...req.body.pricing.map(p => p.price)),
      currency: 'INR' // Fixed to INR for India
    } : {
      minPrice: 10000,
      maxPrice: 20800,
      currency: 'INR'
    },
    // Initialize seat map with total capacity
    seatMap: {
      totalSeats: 60,
      availableSeats: 60,
      soldSeats: 0,
      reservedSeats: 0
    },
    // Handle image upload
    images: req.body.image ? [{
      url: req.body.image,
      alt: req.body.title,
      isPrimary: true
    }] : [],
    // Handle staff assignment
    staff: req.body.staff ? req.body.staff.map(staffAssignment => ({
      staff: staffAssignment.staffId,
      role: staffAssignment.role,
      assignedAt: new Date()
    })) : [],
    // Handle sponsors assignment
    sponsors: req.body.sponsors ? req.body.sponsors.map(sponsorAssignment => ({
      sponsor: sponsorAssignment.sponsorId,
      contributionAmount: sponsorAssignment.contributionAmount,
      sponsorshipType: sponsorAssignment.sponsorshipType,
      perks: sponsorAssignment.perks
    })) : [],
    // Handle vendors assignment from frontend
    vendors: req.body.vendors ? req.body.vendors.map(vendorAssignment => ({
      vendor: vendorAssignment.vendorId,
      serviceType: vendorAssignment.serviceType,
      contractAmount: vendorAssignment.contractAmount || 0
    })) : []
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
    capacity: 60, // Fixed capacity for all events
    tags: req.body.tags,
    theme: req.body.theme || event.theme,
    budget: req.body.budget || event.budget,
    visibility: req.body.visibility || event.visibility,
    ageRestriction: req.body.ageRestriction || event.ageRestriction,
    pricing: req.body.pricing && req.body.pricing.length > 0 ? {
      minPrice: Math.min(...req.body.pricing.map(p => p.price)),
      maxPrice: Math.max(...req.body.pricing.map(p => p.price)),
      currency: 'INR'
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
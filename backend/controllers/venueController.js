import { validationResult } from 'express-validator';
import Venue from '../models/Venue.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all venues
// @route   GET /api/v1/venues
// @access  Public
export const getVenues = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, city, venueType, capacity, sortBy = 'name', sortOrder = 'asc' } = req.query;

  // Build filter object
  const filter = { isActive: true };
  if (city) filter['address.city'] = new RegExp(city, 'i');
  if (venueType) filter.venueType = venueType;
  if (capacity) filter.capacity = { $gte: parseInt(capacity) };

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const venues = await Venue.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-availability'); // Exclude availability for performance

  const total = await Venue.countDocuments(filter);

  res.json({
    success: true,
    data: {
      venues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single venue
// @route   GET /api/v1/venues/:id
// @access  Public
export const getVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findById(req.params.id);

  if (!venue || !venue.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Venue not found'
    });
  }

  res.json({
    success: true,
    data: { venue }
  });
});

// @desc    Create new venue
// @route   POST /api/v1/venues
// @access  Private (Admin only)
export const createVenue = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const venue = await Venue.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Venue created successfully',
    data: { venue }
  });
});

// @desc    Update venue
// @route   PUT /api/v1/venues/:id
// @access  Private (Admin only)
export const updateVenue = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const venue = await Venue.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!venue) {
    return res.status(404).json({
      success: false,
      message: 'Venue not found'
    });
  }

  res.json({
    success: true,
    message: 'Venue updated successfully',
    data: { venue }
  });
});

// @desc    Delete venue
// @route   DELETE /api/v1/venues/:id
// @access  Private (Admin only)
export const deleteVenue = asyncHandler(async (req, res) => {
  const venue = await Venue.findById(req.params.id);

  if (!venue) {
    return res.status(404).json({
      success: false,
      message: 'Venue not found'
    });
  }

  // Check if venue has upcoming events
  const upcomingEvents = await Event.countDocuments({
    venue: req.params.id,
    startDate: { $gte: new Date() },
    status: { $in: ['active', 'published'] }
  });

  if (upcomingEvents > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete venue with upcoming events. Deactivate it instead.'
    });
  }

  // Soft delete by setting isActive to false
  venue.isActive = false;
  await venue.save();

  res.json({
    success: true,
    message: 'Venue deactivated successfully'
  });
});

// @desc    Get venue availability
// @route   GET /api/v1/venues/:id/availability
// @access  Public
export const getVenueAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;

  const venue = await Venue.findById(req.params.id).select('availability name');

  if (!venue || !venue.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Venue not found'
    });
  }

  let availability = venue.availability;

  // Filter by date if provided
  if (date) {
    const queryDate = new Date(date);
    availability = availability.filter(slot =>
      slot.date.toDateString() === queryDate.toDateString()
    );
  }

  res.json({
    success: true,
    data: {
      venueId: venue._id,
      venueName: venue.name,
      availability
    }
  });
});

// @desc    Update venue availability
// @route   PUT /api/v1/venues/:id/availability
// @access  Private (Admin only)
export const updateVenueAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body;

  const venue = await Venue.findById(req.params.id);

  if (!venue) {
    return res.status(404).json({
      success: false,
      message: 'Venue not found'
    });
  }

  venue.availability = availability;
  await venue.save();

  res.json({
    success: true,
    message: 'Venue availability updated successfully',
    data: { availability: venue.availability }
  });
});

// @desc    Get venue statistics
// @route   GET /api/v1/venues/:id/stats
// @access  Private (Admin only)
export const getVenueStats = asyncHandler(async (req, res) => {
  const venueId = req.params.id;

  // Get total events at this venue
  const totalEvents = await Event.countDocuments({ venue: venueId });

  // Get upcoming events
  const upcomingEvents = await Event.countDocuments({
    venue: venueId,
    startDate: { $gte: new Date() },
    status: { $in: ['active', 'published'] }
  });

  // Get completed events
  const completedEvents = await Event.countDocuments({
    venue: venueId,
    status: 'completed'
  });

  // Get total revenue from events at this venue
  const events = await Event.find({ venue: venueId }).select('analytics.revenue');
  const totalRevenue = events.reduce((sum, event) => sum + (event.analytics?.revenue || 0), 0);

  // Get average rating
  const venue = await Venue.findById(venueId).select('rating totalEvents');

  res.json({
    success: true,
    data: {
      venueId,
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalRevenue,
      averageRating: venue.rating,
      totalEventsHosted: venue.totalEvents
    }
  });
});

// @desc    Search venues
// @route   GET /api/v1/venues/search
// @access  Public
export const searchVenues = asyncHandler(async (req, res) => {
  const { q, city, venueType, minCapacity, maxCapacity, facilities } = req.query;

  const filter = { isActive: true };

  // Text search
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { 'address.city': new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') }
    ];
  }

  // Filters
  if (city) filter['address.city'] = new RegExp(city, 'i');
  if (venueType) filter.venueType = venueType;
  if (minCapacity || maxCapacity) {
    filter.capacity = {};
    if (minCapacity) filter.capacity.$gte = parseInt(minCapacity);
    if (maxCapacity) filter.capacity.$lte = parseInt(maxCapacity);
  }
  if (facilities) {
    const facilityArray = Array.isArray(facilities) ? facilities : [facilities];
    filter.facilities = { $in: facilityArray };
  }

  const venues = await Venue.find(filter)
    .select('name address capacity venueType facilities rating images')
    .sort({ rating: -1, name: 1 })
    .limit(50);

  res.json({
    success: true,
    data: { venues }
  });
});
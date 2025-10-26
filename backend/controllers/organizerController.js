import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import Payment from '../models/Payment.js';
import Staff from '../models/Staff.js';
import Sponsor from '../models/Sponsor.js';
import Vendor from '../models/Vendor.js';
import Organizer from '../models/Organizer.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get organizer dashboard data
// @route   GET /api/v1/organizer/dashboard
// @access  Private (Organizer)
export const getOrganizerDashboard = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  // Get organizer's events
  const events = await Event.find({ organizer: organizerId })
    .select('title date status analytics pricing')
    .sort({ date: -1 });

  // Calculate dashboard metrics
  const totalEvents = events.length;
  const activeEvents = events.filter(event => event.status === 'active').length;
  const totalRevenue = events.reduce((sum, event) => sum + (event.analytics.revenue || 0), 0);
  const totalTicketsSold = events.reduce((sum, event) => sum + (event.analytics.ticketsSold || 0), 0);
  const totalAttendees = events.reduce((sum, event) => sum + (event.analytics.attendees || 0), 0);

  // Get recent events (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentEvents = events.filter(event => new Date(event.date) >= thirtyDaysAgo);

  // Get upcoming events
  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date() && event.status === 'active')
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      metrics: {
        totalEvents,
        activeEvents,
        totalRevenue,
        totalTicketsSold,
        totalAttendees
      },
      recentEvents,
      upcomingEvents
    }
  });
});

// @desc    Get organizer's events
// @route   GET /api/v1/organizer/events
// @access  Private (Organizer)
export const getOrganizerEvents = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = { organizer: organizerId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const events = await Event.find(query)
    .populate('venue', 'name location')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Event.countDocuments(query);

  res.json({
    success: true,
    data: {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get event analytics
// @route   GET /api/v1/organizer/events/:eventId/analytics
// @access  Private (Organizer)
export const getEventAnalytics = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const organizerId = req.user._id;

  const event = await Event.findOne({ _id: eventId, organizer: organizerId });
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found or not authorized'
    });
  }

  // Get ticket sales data
  const tickets = await Ticket.find({ event: eventId })
    .populate('attendee', 'name email')
    .sort({ issuedAt: -1 });

  // Get payment data
  const payments = await Payment.find({ ticket: { $in: tickets.map(t => t._id) } })
    .sort({ date: -1 });

  // Calculate analytics
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status === 'active').length;
  const cancelledTickets = tickets.filter(t => t.status === 'cancelled').length;
  const totalRevenue = payments
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0);

  // Category breakdown
  const categoryBreakdown = {};
  tickets.forEach(ticket => {
    if (ticket.status === 'active') {
      categoryBreakdown[ticket.category] = (categoryBreakdown[ticket.category] || 0) + 1;
    }
  });

  // Daily sales data (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dailySales = {};
  payments
    .filter(p => p.status === 'Success' && new Date(p.date) >= thirtyDaysAgo)
    .forEach(payment => {
      const date = new Date(payment.date).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + payment.amount;
    });

  res.json({
    success: true,
    data: {
      event: {
        id: event._id,
        title: event.title,
        date: event.date
      },
      analytics: {
        totalTickets,
        activeTickets,
        cancelledTickets,
        totalRevenue,
        categoryBreakdown,
        dailySales
      },
      recentTickets: tickets.slice(0, 10),
      recentPayments: payments.slice(0, 10)
    }
  });
});

// @desc    Get organizer's staff
// @route   GET /api/v1/organizer/staff
// @access  Private (Organizer)
export const getOrganizerStaff = asyncHandler(async (req, res) => {
  // Return all staff from the database, not just the organizer's staff
  const staff = await Staff.find({})
    .select('name email role permissions isActive')
    .sort({ name: 1 });

  res.json({
    success: true,
    data: { staff }
  });
});

// @desc    Add staff member
// @route   POST /api/v1/organizer/staff
// @access  Private (Organizer)
export const addStaffMember = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const organizerId = req.user._id;
  const { name, email, role, permissions } = req.body;

  // Check if staff member already exists
  const existingStaff = await Staff.findOne({ email, organizer: organizerId });
  if (existingStaff) {
    return res.status(400).json({
      success: false,
      message: 'Staff member with this email already exists'
    });
  }

  const staff = await Staff.create({
    organizer: organizerId,
    name,
    email,
    role,
    skills: permissions, // Map permissions to skills
    contactNo: req.body.contactNo || '', // Add contact number if provided
    availability: [], // Initialize empty availability array
    hoursAssigned: 0, // Initialize hours assigned
    hourlyRate: 0, // Initialize hourly rate
    experience: 0, // Initialize experience
    totalEvents: 0, // Initialize total events
  });

  res.status(201).json({
    success: true,
    message: 'Staff member added successfully',
    data: { staff }
  });
});

// @desc    Update staff member
// @route   PUT /api/v1/organizer/staff/:staffId
// @access  Private (Organizer)
export const updateStaffMember = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const organizerId = req.user._id;
  const { name, email, role, permissions, isActive } = req.body;

  const staff = await Staff.findOne({ _id: staffId, organizer: organizerId });
  if (!staff) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  // Update fields
  if (name) staff.name = name;
  if (email) staff.email = email;
  if (role) staff.role = role;
  if (permissions) staff.permissions = permissions;
  if (typeof isActive === 'boolean') staff.isActive = isActive;

  await staff.save();

  res.json({
    success: true,
    message: 'Staff member updated successfully',
    data: { staff }
  });
});

// @desc    Remove staff member
// @route   DELETE /api/v1/organizer/staff/:staffId
// @access  Private (Organizer)
export const removeStaffMember = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const organizerId = req.user._id;

  const staff = await Staff.findOneAndDelete({ _id: staffId, organizer: organizerId });
  if (!staff) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found'
    });
  }

  res.json({
    success: true,
    message: 'Staff member removed successfully'
  });
});

// @desc    Get organizer's sponsors
// @route   GET /api/v1/organizer/sponsors
// @access  Private (Organizer)
export const getOrganizerSponsors = asyncHandler(async (req, res) => {
  // Return all sponsors from the database, not just the organizer's sponsors
  const sponsors = await Sponsor.find({})
    .sort({ name: 1 });

  res.json({
    success: true,
    data: { sponsors }
  });
});

// @desc    Add sponsor
// @route   POST /api/v1/organizer/sponsors
// @access  Private (Organizer)
export const addSponsor = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const organizerId = req.user._id;
  const { name, email, company, sponsorshipLevel, amount, benefits } = req.body;

  const sponsor = await Sponsor.create({
    organizer: organizerId,
    name,
    email,
    companyName: company, // Map company to companyName
    sponsorshipType: sponsorshipLevel, // Map sponsorshipLevel to sponsorshipType
    contributionAmount: amount, // Map amount to contributionAmount
    perks: benefits, // Map benefits to perks
    contactPerson: req.body.contactPerson || name, // Use name as contact person if not provided
    contactNo: req.body.contactNo || '', // Add contact number if provided
  });

  res.status(201).json({
    success: true,
    message: 'Sponsor added successfully',
    data: { sponsor }
  });
});

// @desc    Get organizer's vendors
// @route   GET /api/v1/organizer/vendors
// @access  Private (Organizer)
export const getOrganizerVendors = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const vendors = await Vendor.find({ organizer: organizerId })
    .sort({ name: 1 });

  res.json({
    success: true,
    data: { vendors }
  });
});

// @desc    Add vendor
// @route   POST /api/v1/organizer/vendors
// @access  Private (Organizer)
export const addVendor = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const organizerId = req.user._id;
  const { name, email, company, serviceType, boothNumber, contractValue } = req.body;

  const vendor = await Vendor.create({
    name,
    email,
    company,
    serviceType,
    boothNumber,
    contractValue,
    organizer: organizerId
  });

  res.status(201).json({
    success: true,
    message: 'Vendor added successfully',
    data: { vendor }
  });
});

// @desc    Get organizer profile
// @route   GET /api/v1/organizer/profile
// @access  Private (Organizer)
export const getOrganizerProfile = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const organizer = await Organizer.findById(organizerId)
    .select('-password');

  if (!organizer) {
    return res.status(404).json({
      success: false,
      message: 'Organizer not found'
    });
  }

  res.json({
    success: true,
    data: { organizer }
  });
});

// @desc    Update organizer profile
// @route   PUT /api/v1/organizer/profile
// @access  Private (Organizer)
export const updateOrganizerProfile = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const {
    name,
    phoneNumbers,
    companyName,
    website,
    description,
    address,
    socialMedia,
    preferences
  } = req.body;

  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    return res.status(404).json({
      success: false,
      message: 'Organizer not found'
    });
  }

  // Update fields
  if (name !== undefined) organizer.name = name;
  if (phoneNumbers !== undefined) organizer.phoneNumbers = phoneNumbers;
  if (companyName !== undefined) organizer.companyName = companyName;
  if (website !== undefined) organizer.website = website;
  if (description !== undefined) organizer.description = description;

  // Update address object
  if (address !== undefined) {
    organizer.address = {
      ...organizer.address,
      ...address
    };
  }

  // Update social media object
  if (socialMedia !== undefined) {
    organizer.socialMedia = {
      ...organizer.socialMedia,
      ...socialMedia
    };
  }

  // Update preferences object
  if (preferences !== undefined) {
    organizer.preferences = {
      ...organizer.preferences,
      ...preferences
    };
  }

  await organizer.save();

  // Return updated organizer without password
  const updatedOrganizer = await Organizer.findById(organizerId).select('-password');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { organizer: updatedOrganizer }
  });
});
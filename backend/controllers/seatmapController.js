import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get seatmap for an event
// @route   GET /api/v1/seatmap/:eventId
// @access  Public
export const getSeatmap = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId).populate('venue');
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (!event.venue) {
    return res.status(404).json({
      success: false,
      message: 'Venue not found for this event'
    });
  }

  // Get all tickets for this event to determine occupied seats
  const tickets = await Ticket.find({
    event: eventId,
    status: 'active'
  }, 'seatNo status category price');

  console.log(`Found ${tickets.length} active tickets for event ${eventId}:`, tickets.map(t => ({ seatNo: t.seatNo, status: t.status })));

  const occupiedSeats = tickets.map(ticket => ticket.seatNo);
  console.log('Occupied seats:', occupiedSeats);

  // Use event pricing if available, otherwise use defaults
  const pricing = event.pricing && event.pricing.length > 0 ? event.pricing : [
    { category: 'vip', price: 20800 },
    { category: 'fan-pit', price: 15000 },
    { category: 'general', price: 10000 },
    { category: 'balcony', price: 12500 }
  ];

  const seatmap = {
    venue: {
      name: event.venue.name,
      capacity: event.venue.capacity,
      layout: 'theater' // Default layout since venue model doesn't have this field
    },
    event: {
      id: event._id,
      title: event.name, // Use name instead of title
      date: event.startDate // Use startDate instead of date
    },
    seats: {
      total: event.venue.capacity,
      available: event.venue.capacity - occupiedSeats.length,
      occupied: occupiedSeats.length,
      reserved: 0, // No reservations anymore
      occupiedSeats,
      reservedSeats: [] // No reserved seats anymore
    },
    pricing
  };

  res.json({
    success: true,
    data: { seatmap }
  });
});

// @desc    Book seat directly
// @route   POST /api/v1/seatmap/book
// @access  Private
export const bookSeat = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { eventId, seatNo, attendeeId, category = 'general', price = 0 } = req.body;

  // Validate seatNo is a positive integer
  const seatNumber = parseInt(seatNo);
  if (isNaN(seatNumber) || seatNumber < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid seat number'
    });
  }

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Event is not active'
    });
  }

  // Check if seat number is within venue capacity
  if (event.venue && seatNumber > event.venue.capacity) {
    return res.status(400).json({
      success: false,
      message: 'Seat number exceeds venue capacity'
    });
  }

  // Check if seat is available
  const existingTicket = await Ticket.findOne({
    event: eventId,
    seatNo: seatNumber,
    status: 'active'
  });

  if (existingTicket) {
    return res.status(400).json({
      success: false,
      message: 'Seat is not available'
    });
  }

  // Create active ticket directly
  const ticket = await Ticket.create({
    attendee: attendeeId,
    event: eventId,
    seatNo: seatNumber,
    category,
    price,
    status: 'active',
    issuedAt: new Date()
  });

  console.log(`Created ticket for seat ${seatNumber} with ID:`, ticket._id);
  console.log('Ticket data:', ticket);

  // Update event analytics
  await Event.findByIdAndUpdate(eventId, {
    $inc: {
      'analytics.ticketsSold': 1,
      'analytics.attendees': 1,
      'analytics.revenue': price
    }
  });

  res.json({
    success: true,
    message: 'Seat booked successfully',
    data: {
      ticketId: ticket._id,
      seatNo: seatNumber,
      category,
      price
    }
  });
});

// @desc    Get available seats for an event
// @route   GET /api/v1/seatmap/:eventId/available
// @access  Public
export const getAvailableSeats = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { category } = req.query;

  const event = await Event.findById(eventId).populate('venue');
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Get all occupied seats
  const occupiedSeats = await Ticket.find({
    event: eventId,
    status: 'active'
  }, 'seatNo category');

  // Generate all possible seats based on venue capacity
  const totalSeats = event.venue ? event.venue.capacity : event.capacity || 100; // Fallback to event capacity or default
  const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  // Filter available seats
  let availableSeats = allSeats.filter(seatNo =>
    !occupiedSeats.some(ticket => ticket.seatNo === seatNo)
  );

  // Filter by category if specified (this is a simplified implementation)
  // In a real system, you'd have seat categories mapped to specific seat ranges
  if (category) {
    // For now, just return all available seats since we don't have category mapping
    // This would need to be enhanced based on venue layout
  }

  res.json({
    success: true,
    data: {
      eventId,
      totalSeats,
      availableSeats,
      availableCount: availableSeats.length,
      occupiedCount: occupiedSeats.length
    }
  });
});

// @desc    Check seat availability
// @route   GET /api/v1/seatmap/:eventId/seat/:seatNo
// @access  Public
export const checkSeatAvailability = asyncHandler(async (req, res) => {
  const { eventId, seatNo } = req.params;

  const seatNumber = parseInt(seatNo);
  if (isNaN(seatNumber) || seatNumber < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid seat number'
    });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  const ticket = await Ticket.findOne({
    event: eventId,
    seatNo: seatNumber,
    status: 'active'
  });

  const isAvailable = !ticket;

  res.json({
    success: true,
    data: {
      eventId,
      seatNo: seatNumber,
      isAvailable,
      status: ticket ? ticket.status : 'available'
    }
  });
});

// @desc    Get seat pricing for an event
// @route   GET /api/v1/seatmap/:eventId/pricing
// @access  Public
export const getSeatPricing = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  res.json({
    success: true,
    data: {
      eventId,
      pricing: event.pricing
    }
  });
});


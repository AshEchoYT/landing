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
  const tickets = await Ticket.find({ event: eventId }, 'seatNo status');

  // Create seat availability map
  const occupiedSeats = tickets
    .filter(ticket => ticket.status === 'active')
    .map(ticket => ticket.seatNo);

  const seatmap = {
    venue: {
      name: event.venue.name,
      capacity: event.venue.capacity,
      layout: event.venue.layout
    },
    event: {
      id: event._id,
      title: event.title,
      date: event.date
    },
    seats: {
      total: event.venue.capacity,
      available: event.venue.capacity - occupiedSeats.length,
      occupied: occupiedSeats.length,
      occupiedSeats
    },
    pricing: event.pricing
  };

  res.json({
    success: true,
    data: { seatmap }
  });
});

// @desc    Reserve seat temporarily
// @route   POST /api/v1/seatmap/reserve
// @access  Private
export const reserveSeat = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { eventId, seatNo, attendeeId } = req.body;

  // Check if event exists
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
  const existingTicket = await Ticket.findOne({
    event: eventId,
    seatNo,
    status: { $in: ['active', 'reserved'] }
  });

  if (existingTicket) {
    return res.status(400).json({
      success: false,
      message: 'Seat is not available'
    });
  }

  // Create temporary reservation ticket
  const reservation = await Ticket.create({
    attendee: attendeeId,
    event: eventId,
    seatNo,
    category: 'standard', // Will be updated during purchase
    price: 0, // Will be updated during purchase
    status: 'reserved',
    reservedAt: new Date(),
    reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  });

  // Set timeout to automatically cancel reservation after 15 minutes
  setTimeout(async () => {
    try {
      const ticket = await Ticket.findById(reservation._id);
      if (ticket && ticket.status === 'reserved') {
        ticket.status = 'cancelled';
        await ticket.save();
      }
    } catch (error) {
      console.error('Error cancelling expired reservation:', error);
    }
  }, 15 * 60 * 1000);

  res.json({
    success: true,
    message: 'Seat reserved successfully',
    data: {
      reservationId: reservation._id,
      seatNo,
      expiresAt: reservation.reservationExpiresAt
    }
  });
});

// @desc    Cancel seat reservation
// @route   DELETE /api/v1/seatmap/reserve/:reservationId
// @access  Private
export const cancelReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;

  const reservation = await Ticket.findById(reservationId);
  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  // Check if user owns the reservation
  if (reservation.attendee.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this reservation'
    });
  }

  if (reservation.status !== 'reserved') {
    return res.status(400).json({
      success: false,
      message: 'Reservation is not active'
    });
  }

  reservation.status = 'cancelled';
  await reservation.save();

  res.json({
    success: true,
    message: 'Reservation cancelled successfully'
  });
});

// @desc    Get available seats for an event
// @route   GET /api/v1/seatmap/:eventId/available
// @access  Public
export const getAvailableSeats = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { category } = req.query;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Get all occupied seats
  const occupiedSeats = await Ticket.find({
    event: eventId,
    status: { $in: ['active', 'reserved'] }
  }, 'seatNo category');

  // Generate all possible seats based on venue capacity
  const totalSeats = event.venue ? event.venue.capacity : 100; // Default if no venue
  const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  // Filter available seats
  let availableSeats = allSeats.filter(seatNo =>
    !occupiedSeats.some(ticket => ticket.seatNo === seatNo)
  );

  // Filter by category if specified
  if (category) {
    const categorySeats = occupiedSeats.filter(ticket => ticket.category === category);
    const occupiedCategorySeats = categorySeats.map(ticket => ticket.seatNo);
    availableSeats = availableSeats.filter(seatNo =>
      !occupiedCategorySeats.includes(seatNo)
    );
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

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  const ticket = await Ticket.findOne({
    event: eventId,
    seatNo: parseInt(seatNo),
    status: { $in: ['active', 'reserved'] }
  });

  const isAvailable = !ticket;

  res.json({
    success: true,
    data: {
      eventId,
      seatNo: parseInt(seatNo),
      isAvailable,
      status: ticket ? ticket.status : 'available',
      reservedUntil: ticket && ticket.status === 'reserved' ? ticket.reservationExpiresAt : null
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

// @desc    Update seat pricing (Organizer only)
// @route   PUT /api/v1/seatmap/:eventId/pricing
// @access  Private (Organizer)
export const updateSeatPricing = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { pricing } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user is the organizer
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update pricing'
    });
  }

  event.pricing = pricing;
  await event.save();

  res.json({
    success: true,
    message: 'Seat pricing updated successfully',
    data: { pricing: event.pricing }
  });
});
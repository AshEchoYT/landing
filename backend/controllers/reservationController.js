import { validationResult } from 'express-validator';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Create reservation
// @route   POST /api/v1/reservations
// @access  Private
export const createReservation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { eventId, seatNo, attendeeId, duration = 15 } = req.body; // duration in minutes

  // Check if event exists and is active
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
  const existingReservation = await Ticket.findOne({
    event: eventId,
    seatNo,
    status: { $in: ['active', 'reserved'] }
  });

  if (existingReservation) {
    return res.status(400).json({
      success: false,
      message: 'Seat is not available'
    });
  }

  // Create reservation
  const reservation = await Ticket.create({
    attendee: attendeeId,
    event: eventId,
    seatNo,
    category: 'standard', // Will be updated during purchase
    price: 0, // Will be updated during purchase
    status: 'reserved',
    reservedAt: new Date(),
    reservationExpiresAt: new Date(Date.now() + duration * 60 * 1000)
  });

  // Set timeout to automatically cancel reservation
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
  }, duration * 60 * 1000);

  res.status(201).json({
    success: true,
    message: 'Reservation created successfully',
    data: {
      reservationId: reservation._id,
      seatNo,
      expiresAt: reservation.reservationExpiresAt,
      duration
    }
  });
});

// @desc    Get user reservations
// @route   GET /api/v1/reservations/:userId
// @access  Private
export const getUserReservations = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user is requesting their own reservations or is admin
  if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these reservations'
    });
  }

  const reservations = await Ticket.find({
    attendee: userId,
    status: 'reserved'
  })
    .populate('event', 'title date venue')
    .sort({ reservedAt: -1 });

  // Clean up expired reservations
  const now = new Date();
  const validReservations = reservations.filter(reservation => {
    if (reservation.reservationExpiresAt < now) {
      // Mark as cancelled if expired
      reservation.status = 'cancelled';
      reservation.save();
      return false;
    }
    return true;
  });

  res.json({
    success: true,
    data: { reservations: validReservations }
  });
});

// @desc    Extend reservation
// @route   PUT /api/v1/reservations/:reservationId/extend
// @access  Private
export const extendReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const { additionalMinutes = 10 } = req.body;

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
      message: 'Not authorized to extend this reservation'
    });
  }

  if (reservation.status !== 'reserved') {
    return res.status(400).json({
      success: false,
      message: 'Reservation is not active'
    });
  }

  // Check if reservation hasn't expired
  if (reservation.reservationExpiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Reservation has expired'
    });
  }

  // Extend reservation
  reservation.reservationExpiresAt = new Date(
    reservation.reservationExpiresAt.getTime() + additionalMinutes * 60 * 1000
  );
  await reservation.save();

  res.json({
    success: true,
    message: 'Reservation extended successfully',
    data: {
      reservationId: reservation._id,
      newExpiresAt: reservation.reservationExpiresAt
    }
  });
});

// @desc    Cancel reservation
// @route   DELETE /api/v1/reservations/:reservationId
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

// @desc    Confirm reservation (convert to ticket)
// @route   POST /api/v1/reservations/:reservationId/confirm
// @access  Private
export const confirmReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const { category, price } = req.body;

  const reservation = await Ticket.findById(reservationId).populate('event');
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
      message: 'Not authorized to confirm this reservation'
    });
  }

  if (reservation.status !== 'reserved') {
    return res.status(400).json({
      success: false,
      message: 'Reservation is not active'
    });
  }

  // Check if reservation hasn't expired
  if (reservation.reservationExpiresAt < new Date()) {
    reservation.status = 'cancelled';
    await reservation.save();
    return res.status(400).json({
      success: false,
      message: 'Reservation has expired'
    });
  }

  // Update reservation to confirmed ticket
  reservation.category = category;
  reservation.price = price;
  reservation.status = 'active';
  reservation.issuedAt = new Date();
  await reservation.save();

  // Update event analytics
  await Event.findByIdAndUpdate(reservation.event._id, {
    $inc: {
      'analytics.ticketsSold': 1,
      'analytics.attendees': 1
    }
  });

  res.json({
    success: true,
    message: 'Reservation confirmed successfully',
    data: { ticket: reservation }
  });
});

// @desc    Get reservation details
// @route   GET /api/v1/reservations/:reservationId
// @access  Private
export const getReservationDetails = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;

  const reservation = await Ticket.findById(reservationId)
    .populate('attendee', 'name email')
    .populate('event', 'title date venue');

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  // Check if user owns the reservation or is admin
  if (reservation.attendee._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this reservation'
    });
  }

  if (reservation.status !== 'reserved') {
    return res.status(404).json({
      success: false,
      message: 'This is not an active reservation'
    });
  }

  res.json({
    success: true,
    data: { reservation }
  });
});

// @desc    Clean up expired reservations (Admin utility)
// @route   POST /api/v1/reservations/cleanup
// @access  Private (Admin)
export const cleanupExpiredReservations = asyncHandler(async (req, res) => {
  const now = new Date();

  const expiredReservations = await Ticket.find({
    status: 'reserved',
    reservationExpiresAt: { $lt: now }
  });

  const updatePromises = expiredReservations.map(reservation => {
    reservation.status = 'cancelled';
    return reservation.save();
  });

  await Promise.all(updatePromises);

  res.json({
    success: true,
    message: `${expiredReservations.length} expired reservations cleaned up`
  });
});
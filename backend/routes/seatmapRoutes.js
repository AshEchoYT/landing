import express from 'express';
import { body } from 'express-validator';
import {
  getSeatmap,
  reserveSeat,
  cancelReservation,
  getAvailableSeats,
  checkSeatAvailability,
  getSeatPricing,
  updateSeatPricing
} from '../controllers/seatmapController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   GET /api/v1/seatmap/:eventId
// @desc    Get seatmap for an event
// @access  Public
router.get('/:eventId', getSeatmap);

// @route   POST /api/v1/seatmap/reserve
// @desc    Reserve seat temporarily
// @access  Private
router.post(
  '/reserve',
  authenticateToken,
  [
    body('eventId').isMongoId().withMessage('Valid event ID is required'),
    body('seatNo').isInt({ min: 1 }).withMessage('Valid seat number is required'),
    body('attendeeId').isMongoId().withMessage('Valid attendee ID is required')
  ],
  reserveSeat
);

// @route   DELETE /api/v1/seatmap/reserve/:reservationId
// @desc    Cancel seat reservation
// @access  Private
router.delete('/reserve/:reservationId', authenticateToken, cancelReservation);

// @route   GET /api/v1/seatmap/:eventId/available
// @desc    Get available seats for an event
// @access  Public
router.get('/:eventId/available', getAvailableSeats);

// @route   GET /api/v1/seatmap/:eventId/seat/:seatNo
// @desc    Check seat availability
// @access  Public
router.get('/:eventId/seat/:seatNo', checkSeatAvailability);

// @route   GET /api/v1/seatmap/:eventId/pricing
// @desc    Get seat pricing for an event
// @access  Public
router.get('/:eventId/pricing', getSeatPricing);

// @route   PUT /api/v1/seatmap/:eventId/pricing
// @desc    Update seat pricing (Organizer only)
// @access  Private (Organizer)
router.put(
  '/:eventId/pricing',
  authenticateToken,
  requireRole(['organizer', 'admin']),
  [
    body('pricing').isArray().withMessage('Pricing must be an array'),
    body('pricing.*.category').notEmpty().withMessage('Category is required for each pricing item'),
    body('pricing.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
  ],
  updateSeatPricing
);

export default router;
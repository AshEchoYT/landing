import express from 'express';
import { body } from 'express-validator';
import {
  getSeatmap,
  bookSeat,
  getAvailableSeats,
  checkSeatAvailability,
  getSeatPricing
} from '../controllers/seatmapController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   GET /api/v1/seatmap/:eventId
// @desc    Get seatmap for an event
// @access  Public
router.get('/:eventId', getSeatmap);

// @route   POST /api/v1/seatmap/book
// @desc    Book seat directly
// @access  Private
router.post(
  '/book',
  authenticateToken,
  [
    body('eventId').isMongoId().withMessage('Valid event ID is required'),
    body('seatNo').isInt({ min: 1 }).withMessage('Valid seat number is required'),
    body('attendeeId').isMongoId().withMessage('Valid attendee ID is required')
  ],
  bookSeat
);

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

export default router;
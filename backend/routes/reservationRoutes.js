import express from 'express';
import { body } from 'express-validator';
import {
  createReservation,
  getUserReservations,
  extendReservation,
  cancelReservation,
  confirmReservation,
  getReservationDetails,
  cleanupExpiredReservations
} from '../controllers/reservationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   POST /api/v1/reservations
// @desc    Create reservation
// @access  Private
router.post(
  '/',
  authenticateToken,
  [
    body('eventId').isMongoId().withMessage('Valid event ID is required'),
    body('seatNo').isInt({ min: 1 }).withMessage('Valid seat number is required'),
    body('attendeeId').isMongoId().withMessage('Valid attendee ID is required'),
    body('duration').optional().isInt({ min: 1, max: 60 }).withMessage('Duration must be between 1-60 minutes')
  ],
  createReservation
);

// @route   GET /api/v1/reservations/:userId
// @desc    Get user reservations
// @access  Private
router.get('/:userId', authenticateToken, getUserReservations);

// @route   PUT /api/v1/reservations/:reservationId/extend
// @desc    Extend reservation
// @access  Private
router.put(
  '/:reservationId/extend',
  authenticateToken,
  [
    body('additionalMinutes').optional().isInt({ min: 1, max: 30 }).withMessage('Additional minutes must be between 1-30')
  ],
  extendReservation
);

// @route   DELETE /api/v1/reservations/:reservationId
// @desc    Cancel reservation
// @access  Private
router.delete('/:reservationId', authenticateToken, cancelReservation);

// @route   POST /api/v1/reservations/:reservationId/confirm
// @desc    Confirm reservation (convert to ticket)
// @access  Private
router.post(
  '/:reservationId/confirm',
  authenticateToken,
  [
    body('category').isIn(['standard', 'vip', 'premium']).withMessage('Invalid ticket category'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
  ],
  confirmReservation
);

// @route   GET /api/v1/reservations/:reservationId
// @desc    Get reservation details
// @access  Private
router.get('/:reservationId', authenticateToken, getReservationDetails);

// @route   POST /api/v1/reservations/cleanup
// @desc    Clean up expired reservations (Admin utility)
// @access  Private (Admin)
router.post('/cleanup', authenticateToken, requireRole(['admin']), cleanupExpiredReservations);

export default router;
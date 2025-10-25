import express from 'express';
import { body } from 'express-validator';
import {
  issueTicket,
  getUserTickets,
  getTicketDetails,
  cancelTicket,
  transferTicket,
  getEventTickets,
  validateTicket,
  downloadTicket
} from '../controllers/ticketController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   POST /api/v1/tickets/issue
// @desc    Issue ticket after payment
// @access  Private
router.post(
  '/issue',
  authenticateToken,
  [
    body('attendeeId').isMongoId().withMessage('Valid attendee ID is required'),
    body('eventId').isMongoId().withMessage('Valid event ID is required'),
    body('seatNo').isInt({ min: 1 }).withMessage('Valid seat number is required'),
    body('category').isIn(['standard', 'vip', 'premium']).withMessage('Invalid ticket category'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
  ],
  issueTicket
);

// @route   GET /api/v1/tickets/:userId
// @desc    Get user's tickets
// @access  Private
router.get('/:userId', authenticateToken, getUserTickets);

// @route   GET /api/v1/tickets/detail/:ticketId
// @desc    Get ticket details
// @access  Private
router.get('/detail/:ticketId', authenticateToken, getTicketDetails);

// @route   PUT /api/v1/tickets/:ticketId/cancel
// @desc    Cancel ticket
// @access  Private
router.put(
  '/:ticketId/cancel',
  authenticateToken,
  [
    body('reason').notEmpty().withMessage('Cancellation reason is required')
  ],
  cancelTicket
);

// @route   PUT /api/v1/tickets/:ticketId/transfer
// @desc    Transfer ticket
// @access  Private
router.put(
  '/:ticketId/transfer',
  authenticateToken,
  [
    body('newAttendeeId').isMongoId().withMessage('Valid new attendee ID is required')
  ],
  transferTicket
);

// @route   GET /api/v1/tickets/event/:eventId
// @desc    Get event tickets (for organizers)
// @access  Private (Organizer/Admin)
router.get('/event/:eventId', authenticateToken, requireRole(['organizer', 'admin']), getEventTickets);

// @route   GET /api/v1/tickets/:ticketId/download
// @desc    Download ticket
// @access  Private
router.get('/:ticketId/download', authenticateToken, downloadTicket);

export default router;
import express from 'express';
import { body } from 'express-validator';
import {
  getAttendeeProfile,
  updateAttendeeProfile,
  getAttendeeTickets,
  getAttendeeEvents,
  getAttendeePayments,
  getAttendeeStats,
  getAttendees,
  getAttendee,
  updateAttendee,
  deactivateAttendee
} from '../controllers/attendeeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All attendee routes require authentication
router.use(authenticateToken);

// @route   GET /api/v1/attendees/profile
// @desc    Get current attendee profile
// @access  Private
router.get('/profile', getAttendeeProfile);

// @route   PUT /api/v1/attendees/profile
// @desc    Update current attendee profile
// @access  Private
router.put(
  '/profile',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phoneNumbers').optional().isArray().withMessage('Phone numbers must be an array'),
    body('phoneNumbers.*').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number format'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
  ],
  updateAttendeeProfile
);

// @route   GET /api/v1/attendees/tickets
// @desc    Get attendee's ticket history
// @access  Private
router.get('/tickets', getAttendeeTickets);

// @route   GET /api/v1/attendees/events
// @desc    Get attendee's event history
// @access  Private
router.get('/events', getAttendeeEvents);

// @route   GET /api/v1/attendees/payments
// @desc    Get attendee's payment history
// @access  Private
router.get('/payments', getAttendeePayments);

// @route   GET /api/v1/attendees/stats
// @desc    Get attendee statistics
// @access  Private
router.get('/stats', getAttendeeStats);

// Admin only routes
// @route   GET /api/v1/attendees
// @desc    Get all attendees
// @access  Private (Admin only)
router.get('/', requireRole(['admin']), getAttendees);

// @route   GET /api/v1/attendees/:id
// @desc    Get single attendee
// @access  Private (Admin only)
router.get('/:id', requireRole(['admin']), getAttendee);

// @route   PUT /api/v1/attendees/:id
// @desc    Update attendee
// @access  Private (Admin only)
router.put(
  '/:id',
  requireRole(['admin']),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phoneNumbers').optional().isArray().withMessage('Phone numbers must be an array'),
    body('role').optional().isIn(['attendee', 'organizer', 'admin']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
  ],
  updateAttendee
);

// @route   DELETE /api/v1/attendees/:id
// @desc    Deactivate attendee
// @access  Private (Admin only)
router.delete('/:id', requireRole(['admin']), deactivateAttendee);

export default router;
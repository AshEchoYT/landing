import express from 'express';
import { body } from 'express-validator';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventAnalytics
} from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   GET /api/v1/events
// @desc    Get all events with filtering and pagination
// @access  Public
router.get('/', getEvents);

// @route   GET /api/v1/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', getEvent);

// @route   POST /api/v1/events
// @desc    Create new event
// @access  Private (Organizer only)
router.post(
  '/',
  authenticateToken,
  requireRole(['organizer', 'admin']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Please provide a valid date'),
    body('venue').notEmpty().withMessage('Venue is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('pricing').isArray().withMessage('Pricing must be an array'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
  ],
  createEvent
);

// @route   PUT /api/v1/events/:id
// @desc    Update event
// @access  Private (Organizer only)
router.put(
  '/:id',
  authenticateToken,
  requireRole(['organizer', 'admin']),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('date').optional().isISO8601().withMessage('Please provide a valid date'),
    body('venue').optional().notEmpty().withMessage('Venue cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('pricing').optional().isArray().withMessage('Pricing must be an array'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
  ],
  updateEvent
);

// @route   DELETE /api/v1/events/:id
// @desc    Delete event
// @access  Private (Organizer only)
router.delete('/:id', authenticateToken, requireRole(['organizer', 'admin']), deleteEvent);

// @route   POST /api/v1/events/:id/register
// @desc    Register for event
// @access  Private (Attendee only)
router.post(
  '/:id/register',
  authenticateToken,
  requireRole(['attendee']),
  [
    body('attendeeId').isMongoId().withMessage('Valid attendee ID is required'),
    body('ticketType').optional().isIn(['standard', 'vip', 'premium']).withMessage('Invalid ticket type')
  ],
  registerForEvent
);

// @route   GET /api/v1/events/:id/analytics
// @desc    Get event analytics
// @access  Private (Organizer/Admin)
router.get('/:id/analytics', authenticateToken, requireRole(['organizer', 'admin']), getEventAnalytics);

export default router;
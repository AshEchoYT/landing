import express from 'express';
import { body } from 'express-validator';
import {
  getVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  getVenueAvailability,
  updateVenueAvailability,
  getVenueStats,
  searchVenues
} from '../controllers/venueController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   GET /api/v1/venues
// @desc    Get all venues with filtering and pagination
// @access  Public
router.get('/', getVenues);

// @route   GET /api/v1/venues/search
// @desc    Search venues
// @access  Public
router.get('/search', searchVenues);

// @route   GET /api/v1/venues/:id
// @desc    Get single venue
// @access  Public
router.get('/:id', getVenue);

// @route   POST /api/v1/venues
// @desc    Create new venue
// @access  Private (Admin only)
router.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  [
    body('name').notEmpty().withMessage('Venue name is required'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.zipCode').isLength({ min: 6, max: 6 }).withMessage('Zip code must be 6 digits'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('venueType').isIn(['indoor', 'outdoor', 'hybrid']).withMessage('Invalid venue type'),
    body('facilities').optional().isArray().withMessage('Facilities must be an array')
  ],
  createVenue
);

// @route   PUT /api/v1/venues/:id
// @desc    Update venue
// @access  Private (Admin only)
router.put(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  [
    body('name').optional().notEmpty().withMessage('Venue name cannot be empty'),
    body('address.street').optional().notEmpty().withMessage('Street address cannot be empty'),
    body('address.city').optional().notEmpty().withMessage('City cannot be empty'),
    body('address.state').optional().notEmpty().withMessage('State cannot be empty'),
    body('address.zipCode').optional().isLength({ min: 6, max: 6 }).withMessage('Zip code must be 6 digits'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('venueType').optional().isIn(['indoor', 'outdoor', 'hybrid']).withMessage('Invalid venue type'),
    body('facilities').optional().isArray().withMessage('Facilities must be an array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  updateVenue
);

// @route   DELETE /api/v1/venues/:id
// @desc    Delete venue (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteVenue);

// @route   GET /api/v1/venues/:id/availability
// @desc    Get venue availability
// @access  Public
router.get('/:id/availability', getVenueAvailability);

// @route   PUT /api/v1/venues/:id/availability
// @desc    Update venue availability
// @access  Private (Admin only)
router.put(
  '/:id/availability',
  authenticateToken,
  requireRole(['admin']),
  [
    body('availability').isArray().withMessage('Availability must be an array'),
    body('availability.*.date').isISO8601().withMessage('Valid date is required'),
    body('availability.*.startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required'),
    body('availability.*.endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required')
  ],
  updateVenueAvailability
);

// @route   GET /api/v1/venues/:id/stats
// @desc    Get venue statistics
// @access  Private (Admin only)
router.get('/:id/stats', authenticateToken, requireRole(['admin']), getVenueStats);

export default router;
import express from 'express';
import { body } from 'express-validator';
import {
  getOrganizerDashboard,
  getOrganizerEvents,
  getEventAnalytics,
  getOrganizerStaff,
  addStaffMember,
  updateStaffMember,
  removeStaffMember,
  getOrganizerSponsors,
  addSponsor,
  getOrganizerVendors,
  addVendor,
  getOrganizerProfile,
  updateOrganizerProfile
} from '../controllers/organizerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All organizer routes require authentication and organizer role
router.use(authenticateToken);
router.use(requireRole(['organizer', 'admin']));

// @route   GET /api/v1/organizer/dashboard
// @desc    Get organizer dashboard data
// @access  Private (Organizer)
router.get('/dashboard', getOrganizerDashboard);

// @route   GET /api/v1/organizer/events
// @desc    Get organizer's events
// @access  Private (Organizer)
router.get('/events', getOrganizerEvents);

// @route   GET /api/v1/organizer/events/:eventId/analytics
// @desc    Get event analytics
// @access  Private (Organizer)
router.get('/events/:eventId/analytics', getEventAnalytics);

// @route   GET /api/v1/organizer/staff
// @desc    Get organizer's staff
// @access  Private (Organizer)
router.get('/staff', getOrganizerStaff);

// @route   POST /api/v1/organizer/staff
// @desc    Add staff member
// @access  Private (Organizer)
router.post(
  '/staff',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('role').notEmpty().withMessage('Role is required'),
    body('permissions').isArray().withMessage('Permissions must be an array')
  ],
  addStaffMember
);

// @route   PUT /api/v1/organizer/staff/:staffId
// @desc    Update staff member
// @access  Private (Organizer)
router.put(
  '/staff/:staffId',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('role').optional().notEmpty().withMessage('Role cannot be empty'),
    body('permissions').optional().isArray().withMessage('Permissions must be an array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  updateStaffMember
);

// @route   DELETE /api/v1/organizer/staff/:staffId
// @desc    Remove staff member
// @access  Private (Organizer)
router.delete('/staff/:staffId', removeStaffMember);

// @route   GET /api/v1/organizer/sponsors
// @desc    Get organizer's sponsors
// @access  Private (Organizer)
router.get('/sponsors', getOrganizerSponsors);

// @route   POST /api/v1/organizer/sponsors
// @desc    Add sponsor
// @access  Private (Organizer)
router.post(
  '/sponsors',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('company').notEmpty().withMessage('Company is required'),
    body('sponsorshipLevel').notEmpty().withMessage('Sponsorship level is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('benefits').isArray().withMessage('Benefits must be an array')
  ],
  addSponsor
);

// @route   GET /api/v1/organizer/vendors
// @desc    Get organizer's vendors
// @access  Private (Organizer)
router.get('/vendors', getOrganizerVendors);

// @route   POST /api/v1/organizer/vendors
// @desc    Add vendor
// @access  Private (Organizer)
router.post(
  '/vendors',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('company').notEmpty().withMessage('Company is required'),
    body('serviceType').notEmpty().withMessage('Service type is required'),
    body('boothNumber').optional().notEmpty().withMessage('Booth number cannot be empty'),
    body('contractValue').isFloat({ min: 0 }).withMessage('Contract value must be a positive number')
  ],
  addVendor
);

// @route   GET /api/v1/organizer/profile
// @desc    Get organizer profile
// @access  Private (Organizer)
router.get('/profile', getOrganizerProfile);

// @route   PUT /api/v1/organizer/profile
// @desc    Update organizer profile
// @access  Private (Organizer)
router.put(
  '/profile',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('company').optional().notEmpty().withMessage('Company cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('socialLinks').optional().isObject().withMessage('Social links must be an object')
  ],
  updateOrganizerProfile
);

export default router;
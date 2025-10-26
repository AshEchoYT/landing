import express from 'express';
import { body } from 'express-validator';
import {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorsByServiceType,
  searchVendors,
  getVendorStats
} from '../controllers/vendorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   GET /api/v1/vendors
// @desc    Get all vendors with filtering and pagination
// @access  Public
router.get('/', getVendors);

// @route   GET /api/v1/vendors/search
// @desc    Search vendors
// @access  Public
router.get('/search', searchVendors);

// @route   GET /api/v1/vendors/service/:serviceType
// @desc    Get vendors by service type
// @access  Public
router.get('/service/:serviceType', getVendorsByServiceType);

// @route   GET /api/v1/vendors/:id
// @desc    Get single vendor
// @access  Public
router.get('/:id', getVendor);

// @route   POST /api/v1/vendors
// @desc    Create new vendor
// @access  Private (Admin only)
router.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  [
    body('name').notEmpty().withMessage('Vendor name is required'),
    body('serviceType').isIn([
      'catering', 'sound', 'lighting', 'security', 'decoration',
      'photography', 'videography', 'transportation', 'medical',
      'cleaning', 'ticketing', 'merchandise', 'other'
    ]).withMessage('Invalid service type'),
    body('contactNo').matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit phone number'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('contractStart').isISO8601().withMessage('Valid contract start date is required'),
    body('contractEnd').isISO8601().withMessage('Valid contract end date is required')
  ],
  createVendor
);

// @route   PUT /api/v1/vendors/:id
// @desc    Update vendor
// @access  Private (Admin only)
router.put(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  [
    body('name').optional().notEmpty().withMessage('Vendor name cannot be empty'),
    body('serviceType').optional().isIn([
      'catering', 'sound', 'lighting', 'security', 'decoration',
      'photography', 'videography', 'transportation', 'medical',
      'cleaning', 'ticketing', 'merchandise', 'other'
    ]).withMessage('Invalid service type'),
    body('contactNo').optional().matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit phone number'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('contractStart').optional().isISO8601().withMessage('Valid contract start date is required'),
    body('contractEnd').optional().isISO8601().withMessage('Valid contract end date is required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  updateVendor
);

// @route   DELETE /api/v1/vendors/:id
// @desc    Delete vendor (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteVendor);

// @route   GET /api/v1/vendors/:id/stats
// @desc    Get vendor statistics
// @access  Private (Admin only)
router.get('/:id/stats', authenticateToken, requireRole(['admin']), getVendorStats);

export default router;
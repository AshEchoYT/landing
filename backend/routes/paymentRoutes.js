import express from 'express';
import { body } from 'express-validator';
import {
  initiatePayment,
  processPayment,
  processMockPayment,
  getUserPayments,
  getPaymentStats,
  processRefund,
  getPaymentDetails,
  cancelPayment
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   POST /api/v1/payments/initiate
// @desc    Initiate payment for a ticket
// @access  Private
router.post(
  '/initiate',
  authenticateToken,
  [
    body('ticketId').isMongoId().withMessage('Valid ticket ID is required'),
    body('paymentMethod').isIn(['card', 'upi', 'netbanking', 'wallet', 'cod']).withMessage('Invalid payment method'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').optional().isIn(['vip', 'fan-pit', 'general', 'balcony']).withMessage('Invalid ticket category')
  ],
  initiatePayment
);

// @route   POST /api/v1/payments/:paymentId/process
// @desc    Process payment
// @access  Private
router.post('/:paymentId/process', authenticateToken, processPayment);

// @route   DELETE /api/v1/payments/:paymentId
// @desc    Cancel payment
// @access  Private
router.delete('/:paymentId', authenticateToken, cancelPayment);

// @route   POST /api/v1/payments/mock
// @desc    Process mock payment
// @access  Private
router.post(
  '/mock',
  authenticateToken,
  [
    body('attendeeId').isMongoId().withMessage('Valid attendee ID is required'),
    body('ticketId').isMongoId().withMessage('Valid ticket ID is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('mode').isIn(['card', 'upi', 'netbanking', 'wallet']).withMessage('Invalid payment mode')
  ],
  processMockPayment
);

// @route   GET /api/v1/payments/:userId
// @desc    Get user payment history
// @access  Private
router.get('/:userId', authenticateToken, getUserPayments);

// @route   GET /api/v1/payments/stats/:userId
// @desc    Get payment statistics
// @access  Private
router.get('/stats/:userId', authenticateToken, getPaymentStats);

// @route   POST /api/v1/payments/:paymentId/refund
// @desc    Process refund
// @access  Private (Admin only)
router.post(
  '/:paymentId/refund',
  authenticateToken,
  requireRole(['admin']),
  [
    body('reason').notEmpty().withMessage('Refund reason is required'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number')
  ],
  processRefund
);

// @route   GET /api/v1/payments/:paymentId
// @desc    Get payment details
// @access  Private
router.get('/:paymentId', authenticateToken, getPaymentDetails);

export default router;
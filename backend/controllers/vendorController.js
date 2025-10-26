import { validationResult } from 'express-validator';
import Vendor from '../models/Vendor.js';
import Venue from '../models/Venue.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all vendors
// @route   GET /api/v1/vendors
// @access  Public
export const getVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, serviceType, isActive = true, sortBy = 'name', sortOrder = 'asc' } = req.query;

  // Build filter object
  const filter = {};
  if (serviceType) filter.serviceType = serviceType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const vendors = await Vendor.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-portfolio -certifications -notes'); // Exclude heavy fields for performance

  const total = await Vendor.countDocuments(filter);

  res.json({
    success: true,
    data: {
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single vendor
// @route   GET /api/v1/vendors/:id
// @access  Public
export const getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor || !vendor.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  res.json({
    success: true,
    data: { vendor }
  });
});

// @desc    Create new vendor
// @route   POST /api/v1/vendors
// @access  Private (Admin only)
export const createVendor = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const vendor = await Vendor.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Vendor created successfully',
    data: { vendor }
  });
});

// @desc    Update vendor
// @route   PUT /api/v1/vendors/:id
// @access  Private (Admin only)
export const updateVendor = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  res.json({
    success: true,
    message: 'Vendor updated successfully',
    data: { vendor }
  });
});

// @desc    Delete vendor
// @route   DELETE /api/v1/vendors/:id
// @access  Private (Admin only)
export const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  // Check if vendor is associated with any venues
  const associatedVenues = await Venue.countDocuments({ vendors: req.params.id });
  if (associatedVenues > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete vendor associated with venues. Deactivate it instead.'
    });
  }

  // Soft delete by setting isActive to false
  vendor.isActive = false;
  await vendor.save();

  res.json({
    success: true,
    message: 'Vendor deactivated successfully'
  });
});

// @desc    Get vendors by service type
// @route   GET /api/v1/vendors/service/:serviceType
// @access  Public
export const getVendorsByServiceType = asyncHandler(async (req, res) => {
  const { serviceType } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const vendors = await Vendor.find({
    serviceType: serviceType,
    isActive: true
  })
    .sort({ rating: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Vendor.countDocuments({
    serviceType: serviceType,
    isActive: true
  });

  res.json({
    success: true,
    data: {
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Search vendors
// @route   GET /api/v1/vendors/search
// @access  Public
export const searchVendors = asyncHandler(async (req, res) => {
  const { q, serviceType, minRating } = req.query;

  const filter = { isActive: true };

  // Text search
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { serviceType: new RegExp(q, 'i') },
      { companyName: new RegExp(q, 'i') }
    ];
  }

  // Filters
  if (serviceType) filter.serviceType = serviceType;
  if (minRating) filter.rating = { $gte: parseFloat(minRating) };

  const vendors = await Vendor.find(filter)
    .select('name serviceType companyName contactNo email rating totalEvents')
    .sort({ rating: -1, name: 1 })
    .limit(50);

  res.json({
    success: true,
    data: { vendors }
  });
});

// @desc    Get vendor statistics
// @route   GET /api/v1/vendors/:id/stats
// @access  Private (Admin only)
export const getVendorStats = asyncHandler(async (req, res) => {
  const vendorId = req.params.id;

  const vendor = await Vendor.findById(vendorId).select('name totalEvents rating');

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  // Get associated venues count
  const associatedVenues = await Venue.countDocuments({ vendors: vendorId });

  res.json({
    success: true,
    data: {
      vendorId,
      vendorName: vendor.name,
      totalEvents: vendor.totalEvents,
      averageRating: vendor.rating,
      associatedVenues
    }
  });
});
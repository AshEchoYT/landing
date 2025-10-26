import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import Attendee from '../models/Attendee.js';
import Organizer from '../models/Organizer.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, email, phoneNumbers, password, role } = req.body;

  // Check if user already exists in either table
  const existingAttendee = await Attendee.findOne({ email });
  const existingOrganizer = await Organizer.findOne({ email });

  if (existingAttendee || existingOrganizer) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  let user;

  // Create user based on role
  if (role === 'organizer') {
    user = await Organizer.create({
      name,
      email,
      phoneNumbers: phoneNumbers || [],
      password,
      role: 'organizer',
      companyName: req.body.companyName || '',
      description: req.body.description || '',
      address: req.body.address || {},
      isVerified: false
    });
  } else {
    user = await Attendee.create({
      name,
      email,
      phoneNumbers: phoneNumbers || [],
      password,
      role: 'attendee'
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.getPublicProfile(),
      accessToken
    }
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Check if user exists in either table and get password
  let user = await Attendee.findOne({ email }).select('+password');
  if (!user) {
    user = await Organizer.findOne({ email }).select('+password');
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicProfile(),
      accessToken
    }
  });
});

// @desc    Refresh access token
// @route   GET /api/v1/auth/refresh
// @access  Public (with refresh token)
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    );

    // Check if user still exists in either table
    let user = await Attendee.findById(decoded.userId);
    if (!user) {
      user = await Organizer.findById(decoded.userId);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Get current user profile
// @route   GET /api/v1/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.getPublicProfile()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phoneNumbers, preferences } = req.body;

  let user;
  if (req.user.role === 'organizer') {
    user = await Organizer.findByIdAndUpdate(
      req.user._id,
      {
        name: name || req.user.name,
        phoneNumbers: phoneNumbers || req.user.phoneNumbers,
        preferences: preferences || req.user.preferences
      },
      { new: true, runValidators: true }
    );
  } else {
    user = await Attendee.findByIdAndUpdate(
      req.user._id,
      {
        name: name || req.user.name,
        phoneNumbers: phoneNumbers || req.user.phoneNumbers,
        preferences: preferences || req.user.preferences
      },
      { new: true, runValidators: true }
    );
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getPublicProfile()
    }
  });
});

// @desc    Change user password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  let user;
  if (req.user.role === 'organizer') {
    user = await Organizer.findById(req.user._id).select('+password');
  } else {
    user = await Attendee.findById(req.user._id).select('+password');
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});
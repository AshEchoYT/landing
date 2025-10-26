import jwt from 'jsonwebtoken';
import Attendee from '../models/Attendee.js';
import Organizer from '../models/Organizer.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.accessToken;

    console.log('Auth middleware - Token received:', token ? 'YES' : 'NO');

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your-access-secret-key');
    console.log('Auth middleware - Token decoded, userId:', decoded.userId);

    // Get user from Attendee model first (for authentication)
    const attendee = await Attendee.findById(decoded.userId).select('-password');
    if (attendee) {
      console.log('Auth middleware - Found attendee:', attendee.name, 'role:', attendee.role);
      // Check if user is active
      if (!attendee.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Attach user to request
      req.user = attendee;
      return next();
    }

    // If not found in Attendee, check Organizer model
    const organizer = await Organizer.findById(decoded.userId);
    if (organizer) {
      console.log('Auth middleware - Found organizer:', organizer.name);
      // Check if organizer is active
      if (!organizer.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Attach full organizer object to request (consistent with attendee handling)
      req.user = organizer;
      return next();
    }

    // User not found in either model
    console.log('Auth middleware - User not found in either model');
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Specific role middlewares for convenience
export const requireOrganizer = roleMiddleware('organizer', 'admin');
export const requireAdmin = roleMiddleware('admin');
export const requireAttendee = roleMiddleware('attendee', 'organizer', 'admin');

// Alias for backward compatibility
export const requireRole = roleMiddleware;
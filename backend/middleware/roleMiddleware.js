export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log('Role middleware - Checking user:', req.user ? req.user.name : 'No user');
      console.log('Role middleware - User role:', req.user ? req.user.role : 'No role');
      console.log('Role middleware - Allowed roles:', allowedRoles);

      if (!req.user) {
        console.log('Role middleware - No user found');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Handle both array format and spread arguments
      let rolesToCheck = allowedRoles;
      if (allowedRoles.length === 1 && Array.isArray(allowedRoles[0])) {
        rolesToCheck = allowedRoles[0];
      }

      if (!rolesToCheck.includes(req.user.role)) {
        console.log('Role middleware - Role not allowed');
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${rolesToCheck.join(' or ')}`
        });
      }

      console.log('Role middleware - Access granted');
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
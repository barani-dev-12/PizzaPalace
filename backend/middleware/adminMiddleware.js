const { USER_ROLES } = require("../config/constants");
const { sendError } = require("../utils/apiResponse");

/**
 * Admin Authorization Middleware
 * - Must be used AFTER the protect (auth) middleware
 * - Checks if the authenticated user has the admin role
 * - Returns 403 Forbidden if the user is not an admin
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLES.ADMIN) {
    next();
  } else {
    return sendError(
      res,
      403,
      "Access denied. Admin privileges required."
    );
  }
};

module.exports = adminOnly;

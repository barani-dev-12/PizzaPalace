const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/apiResponse");

/**
 * Authentication Middleware
 * - Extracts JWT token from the Authorization header (Bearer <token>)
 * - Verifies the token and decodes the user payload
 * - Fetches the full user document (excluding password) and attaches it to req.user
 * - Rejects requests with missing, invalid, or expired tokens
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token provided
    if (!token) {
      return sendError(res, 401, "Access denied. No token provided.");
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, 401, "User belonging to this token no longer exists.");
    }

    // Attach user to the request object for downstream use
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Invalid token. Please log in again.");
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Token has expired. Please log in again.");
    }
    return sendError(res, 401, "Authentication failed.");
  }
};

module.exports = protect;
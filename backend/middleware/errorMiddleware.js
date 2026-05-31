/**
 * Global Error Handling Middleware
 * - Catches all unhandled errors thrown in route handlers
 * - Provides structured JSON error responses
 * - Hides stack traces in production for security
 * - Handles common Mongoose and MongoDB error types
 */

const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ─── Mongoose Validation Error ────────────────────────────────
  // Triggered when schema validation fails (e.g., required fields, enum mismatch)
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(". ");
  }

  // ─── Mongoose CastError ──────────────────────────────────────
  // Triggered when an invalid ObjectId is passed as a route parameter
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ─── MongoDB Duplicate Key Error ─────────────────────────────
  // Triggered when a unique constraint is violated (e.g., duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}. Please use another value.`;
  }

  // ─── JWT Errors ──────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please log in again.";
  }

  // Log the error for debugging (only full stack in development)
  console.error(`❌ Error: ${message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Send structured error response
  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Middleware
 * - Catches requests to undefined routes
 * - Must be placed after all route definitions
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };

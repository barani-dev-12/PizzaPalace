const { validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

/**
 * Validation Result Handler Middleware
 * - Runs after express-validator validation chains
 * - Checks for validation errors and returns a 400 response with details
 * - If no errors, passes control to the next middleware/controller
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Extract only the error messages for a cleaner response
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendError(
      res,
      400,
      "Validation failed",
      extractedErrors
    );
  }

  next();
};

module.exports = handleValidationErrors;

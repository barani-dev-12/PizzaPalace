const mongoose = require("mongoose");
const { sendError } = require("../utils/apiResponse");

/**
 * Block API routes if MongoDB is not connected (avoids opaque "buffering timed out" errors).
 */
const ensureDb = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  return sendError(
    res,
    503,
    "Database is not connected. On Render, check MONGO_URI and MongoDB Atlas → Network Access (allow 0.0.0.0/0)."
  );
};

module.exports = ensureDb;

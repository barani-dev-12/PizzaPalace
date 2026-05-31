const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/**
 * Generate JWT Token
 * @param {string} id - User's MongoDB _id
 * @param {string} role - User's role (customer/admin)
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ════════════════════════════════════════════════════════════════
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ════════════════════════════════════════════════════════════════
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, "A user with this email already exists.");
    }

    // Create user (password is hashed via the pre-save hook in User model)
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 201, "User registered successfully", {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Login user & return token
// @route   POST /api/auth/login
// @access  Public
// ════════════════════════════════════════════════════════════════
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password (excluded by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return sendError(res, 401, "Invalid email or password.");
    }

    // Compare passwords using the model instance method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password.");
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    user.password = undefined;

    return sendSuccess(res, 200, "Login successful", {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get current user's profile
// @route   GET /api/auth/profile
// @access  Private (requires authentication)
// ════════════════════════════════════════════════════════════════
exports.getUserProfile = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    return sendSuccess(res, 200, "User profile retrieved successfully", {
      user,
    });
  } catch (error) {
    next(error);
  }
};
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const { validateRegistration, validateLogin } = require("../middleware/validators");
const handleValidationErrors = require("../middleware/handleValidation");

/**
 * Auth Routes
 * POST   /api/auth/register  - Register a new user (public)
 * POST   /api/auth/login     - Login and get token (public)
 * GET    /api/auth/profile   - Get current user profile (protected)
 */

// @route   POST /api/auth/register
router.post("/register", validateRegistration, handleValidationErrors, registerUser);

// @route   POST /api/auth/login
router.post("/login", validateLogin, handleValidationErrors, loginUser);

// @route   GET /api/auth/profile
router.get("/profile", protect, getUserProfile);

module.exports = router;
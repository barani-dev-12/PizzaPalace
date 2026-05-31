const express = require("express");
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

// All payment routes require authentication
router.use(protect);

/**
 * Payment Routes
 * POST   /api/payments/order   - Create a Razorpay order based on backend order ID
 * POST   /api/payments/verify  - Verify Razorpay payment signature and mark order paid
 */
router.post("/order", createRazorpayOrder);
router.post("/verify", verifyPayment);

module.exports = router;

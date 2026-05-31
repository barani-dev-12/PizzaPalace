const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  validateOrder,
  validateOrderStatus,
  validateObjectId,
} = require("../middleware/validators");
const handleValidationErrors = require("../middleware/handleValidation");

/**
 * Order Routes
 * POST   /api/orders           - Place a new order (authenticated)
 * GET    /api/orders/my        - Get logged-in user's orders (authenticated)
 * GET    /api/orders/:id       - Get single order by ID (owner or admin)
 * GET    /api/orders           - Get all orders (admin only)
 * PUT    /api/orders/:id/status - Update order status (admin only)
 * DELETE /api/orders/:id       - Delete an order (admin only)
 */

// IMPORTANT: Place specific routes BEFORE parameterized routes to avoid conflicts

// @route   POST /api/orders (Authenticated users)
router.post("/", protect, validateOrder, handleValidationErrors, placeOrder);

// @route   GET /api/orders/my (Authenticated users — own orders)
router.get("/my", protect, getMyOrders);

// @route   GET /api/orders (Admin only — all orders)
router.get("/", protect, adminOnly, getAllOrders);

// @route   GET /api/orders/:id (Owner or Admin)
router.get(
  "/:id",
  protect,
  validateObjectId,
  handleValidationErrors,
  getOrderById
);

// @route   PUT /api/orders/:id/status (Admin only)
router.put(
  "/:id/status",
  protect,
  adminOnly,
  validateObjectId,
  validateOrderStatus,
  handleValidationErrors,
  updateOrderStatus
);

// @route   DELETE /api/orders/:id (Admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  validateObjectId,
  handleValidationErrors,
  deleteOrder
);

module.exports = router;

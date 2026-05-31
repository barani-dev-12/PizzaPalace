const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// Initialize Razorpay client with keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

/**
 * @desc    Create a new Razorpay order
 * @route   POST /api/payments/order
 * @access  Private (authenticated users)
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return sendError(res, 400, "Order ID is required.");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return sendError(res, 404, "Order not found.");
    }

    // Verify order ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. This order does not belong to you.");
    }

    if (order.isPaid) {
      return sendError(res, 400, "This order has already been paid.");
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amount = Math.round(order.totalAmount * 100);

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_order_${order._id.toString().substring(0, 20)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return sendSuccess(res, 200, "Razorpay order created successfully", {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Private (authenticated users)
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return sendError(res, 400, "Missing payment details for verification.");
    }

    // Verify signature using crypto
    const text = razorpayOrderId + "|" + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return sendError(res, 400, "Payment verification failed. Invalid signature.");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return sendError(res, 404, "Order not found during verification.");
    }

    // Mark as paid and set status to Preparing
    order.isPaid = true;
    order.orderStatus = "Preparing";
    await order.save();

    // Populate pizza details for response
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("orderItems.pizza", "name image");

    return sendSuccess(res, 200, "Payment verified and order status updated to Preparing", {
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

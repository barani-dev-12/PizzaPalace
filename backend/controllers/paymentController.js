const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getRazorpayKeys = () => ({
  keyId: process.env.KEY_ID || process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.KEY_SECRET || process.env.RAZORPAY_KEY_SECRET,
});

let razorpayClient = null;

const getRazorpayClient = () => {
  const { keyId, keySecret } = getRazorpayKeys();
  if (!keyId || !keySecret) {
    return null;
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayClient;
};

/**
 * @desc    Create a new Razorpay order
 * @route   POST /api/payments/order
 * @access  Private (authenticated users)
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const razorpay = getRazorpayClient();
    const { keyId } = getRazorpayKeys();
    if (!razorpay) {
      return sendError(
        res,
        503,
        "Online payment is not configured. Set KEY_ID and KEY_SECRET on the server."
      );
    }

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
      keyId,
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
    const { keySecret } = getRazorpayKeys();
    if (!keySecret) {
      return sendError(
        res,
        503,
        "Online payment is not configured. Set KEY_ID and KEY_SECRET on the server."
      );
    }

    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return sendError(res, 400, "Missing payment details for verification.");
    }

    // Verify signature using crypto
    const text = razorpayOrderId + "|" + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
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

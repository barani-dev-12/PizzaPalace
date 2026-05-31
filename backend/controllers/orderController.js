const Order = require("../models/Order");
const Pizza = require("../models/Pizza");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { PAGINATION, ORDER_STATUS } = require("../config/constants");

// ════════════════════════════════════════════════════════════════
// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (authenticated users)
// ════════════════════════════════════════════════════════════════
exports.placeOrder = async (req, res, next) => {
  try {
    const { orderItems, deliveryAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return sendError(res, 400, "Order must contain at least one item.");
    }

    // ─── Validate each order item and calculate total ───────────
    let totalAmount = 0;
    const processedItems = [];

    for (const item of orderItems) {
      // Verify the pizza exists and is available
      const pizza = await Pizza.findById(item.pizza);

      if (!pizza) {
        return sendError(
          res,
          404,
          `Pizza not found with ID: ${item.pizza}`
        );
      }

      if (!pizza.isAvailable) {
        return sendError(
          res,
          400,
          `"${pizza.name}" is currently unavailable.`
        );
      }

      // Verify the requested size exists for this pizza
      if (!pizza.sizes.includes(item.size)) {
        return sendError(
          res,
          400,
          `Size "${item.size}" is not available for "${pizza.name}". Available sizes: ${pizza.sizes.join(", ")}`
        );
      }

      // Get the price for the requested size
      const price = pizza.prices.get(item.size);
      if (!price) {
        return sendError(
          res,
          400,
          `Price not found for size "${item.size}" of "${pizza.name}".`
        );
      }

      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      processedItems.push({
        pizza: item.pizza,
        quantity: item.quantity,
        size: item.size,
        price: itemTotal,
      });
    }

    // Calculate delivery fee and taxes to store grand total in DB
    const deliveryFee = totalAmount > 500 ? 0 : 40;
    const taxes = Math.round(totalAmount * 0.05);
    const grandTotal = totalAmount + deliveryFee + taxes;

    // ─── Create the order ───────────────────────────────────────
    const order = await Order.create({
      user: req.user._id,
      orderItems: processedItems,
      totalAmount: grandTotal,
      deliveryAddress,
      paymentMethod,
      orderStatus: ORDER_STATUS.PENDING,
      isPaid: false,
    });

    // Populate pizza details in the response
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("orderItems.pizza", "name image");

    return sendSuccess(res, 201, "Order placed successfully", {
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get orders of the logged-in user
// @route   GET /api/orders/my
// @access  Private (authenticated users)
// ════════════════════════════════════════════════════════════════
exports.getMyOrders = async (req, res, next) => {
  try {
    // ─── Pagination ─────────────────────────────────────────────
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    // Optional filter by order status
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("orderItems.pizza", "name image")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, 200, "Your orders retrieved successfully", {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
// ════════════════════════════════════════════════════════════════
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.pizza", "name image category");

    if (!order) {
      return sendError(res, 404, "Order not found.");
    }

    // Only the order owner or an admin can view the order
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return sendError(
        res,
        403,
        "Access denied. You can only view your own orders."
      );
    }

    return sendSuccess(res, 200, "Order retrieved successfully", { order });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
// ════════════════════════════════════════════════════════════════
exports.getAllOrders = async (req, res, next) => {
  try {
    // ─── Pagination ─────────────────────────────────────────────
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = {};

    // Optional filter by order status
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    // Optional filter by user ID
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .populate("orderItems.pizza", "name image")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, 200, "All orders retrieved successfully", {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
// ════════════════════════════════════════════════════════════════
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendError(res, 404, "Order not found.");
    }

    // Prevent updating a cancelled or delivered order
    if (
      order.orderStatus === ORDER_STATUS.CANCELLED ||
      order.orderStatus === ORDER_STATUS.DELIVERED
    ) {
      return sendError(
        res,
        400,
        `Cannot update a ${order.orderStatus.toLowerCase()} order.`
      );
    }

    // Update the order status
    order.orderStatus = orderStatus;

    // Mark as paid when delivered (for Cash on Delivery)
    if (orderStatus === ORDER_STATUS.DELIVERED) {
      order.isPaid = true;
    }

    const updatedOrder = await order.save();

    // Populate references for the response
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate("user", "name email")
      .populate("orderItems.pizza", "name image");

    return sendSuccess(res, 200, "Order status updated successfully", {
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Delete an order (Admin only)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
// ════════════════════════════════════════════════════════════════
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendError(res, 404, "Order not found.");
    }

    await Order.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 200, "Order deleted successfully");
  } catch (error) {
    next(error);
  }
};

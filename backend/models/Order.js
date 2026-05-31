const mongoose = require("mongoose");
const {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  PAYMENT_METHODS,
} = require("../config/constants");

/**
 * Order Item Sub-Schema
 * - Embedded document within each order
 * - References the Pizza model via ObjectId
 * - Stores the size, quantity, and price at the time of order
 */
const orderItemSchema = new mongoose.Schema(
  {
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
      required: [true, "Pizza reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [20, "Quantity cannot exceed 20"],
    },
    size: {
      type: String,
      required: [true, "Size is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: false } // No separate _id for sub-documents
);

/**
 * Order Model
 * - Represents a customer order containing one or more pizza items
 * - References the User model for order ownership
 * - Tracks order lifecycle via orderStatus field
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    orderItems: {
      type: [orderItemSchema],
      required: [true, "Order must contain at least one item"],
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    deliveryAddress: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: PAYMENT_METHODS,
        message: `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}`,
      },
    },
    orderStatus: {
      type: String,
      enum: {
        values: ORDER_STATUS_VALUES,
        message: `Order status must be one of: ${ORDER_STATUS_VALUES.join(", ")}`,
      },
      default: ORDER_STATUS.PENDING,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Indexes for efficient queries
 */
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

/**
 * Transform JSON output to clean up response
 */
orderSchema.methods.toJSON = function () {
  const order = this.toObject();
  delete order.__v;
  return order;
};

module.exports = mongoose.model("Order", orderSchema);

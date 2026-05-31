const { body, param, query } = require("express-validator");
const { PIZZA_CATEGORIES, PIZZA_SIZES, PAYMENT_METHODS, ORDER_STATUS_VALUES } = require("../config/constants");

/**
 * Validation Middleware using express-validator
 * - Provides reusable validation chains for all API endpoints
 * - Returns descriptive error messages for each validation rule
 */

// ════════════════════════════════════════════════════════════════
// AUTH VALIDATIONS
// ════════════════════════════════════════════════════════════════

/**
 * Validate user registration input
 */
const validateRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

/**
 * Validate user login input
 */
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// ════════════════════════════════════════════════════════════════
// PIZZA VALIDATIONS
// ════════════════════════════════════════════════════════════════

/**
 * Validate pizza creation / update input
 */
const validatePizza = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Pizza name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Pizza name must be between 2 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(PIZZA_CATEGORIES)
    .withMessage(`Category must be one of: ${PIZZA_CATEGORIES.join(", ")}`),

  body("sizes")
    .isArray({ min: 1 })
    .withMessage("At least one size is required"),

  body("sizes.*")
    .isIn(PIZZA_SIZES)
    .withMessage(`Each size must be one of: ${PIZZA_SIZES.join(", ")}`),

  body("prices")
    .notEmpty()
    .withMessage("Prices are required")
    .isObject()
    .withMessage("Prices must be an object mapping size to price"),

  body("image")
    .optional()
    .trim(),

  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),
];

// ════════════════════════════════════════════════════════════════
// ORDER VALIDATIONS
// ════════════════════════════════════════════════════════════════

/**
 * Validate order placement input
 */
const validateOrder = [
  body("orderItems")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),

  body("orderItems.*.pizza")
    .notEmpty()
    .withMessage("Pizza ID is required for each order item")
    .isMongoId()
    .withMessage("Invalid Pizza ID format"),

  body("orderItems.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1, max: 20 })
    .withMessage("Quantity must be between 1 and 20"),

  body("orderItems.*.size")
    .trim()
    .notEmpty()
    .withMessage("Size is required for each order item"),

  body("deliveryAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),

  body("deliveryAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("deliveryAddress.state")
    .trim()
    .notEmpty()
    .withMessage("State is required"),

  body("deliveryAddress.zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip code is required"),

  body("deliveryAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(", ")}`),
];

/**
 * Validate order status update input
 */
const validateOrderStatus = [
  body("orderStatus")
    .trim()
    .notEmpty()
    .withMessage("Order status is required")
    .isIn(ORDER_STATUS_VALUES)
    .withMessage(`Order status must be one of: ${ORDER_STATUS_VALUES.join(", ")}`),
];

/**
 * Validate MongoDB ObjectId parameter
 */
const validateObjectId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid ID format"),
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePizza,
  validateOrder,
  validateOrderStatus,
  validateObjectId,
};

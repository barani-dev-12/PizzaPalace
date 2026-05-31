/**
 * Centralized Constants
 * - Order statuses, user roles, pagination defaults, and sort options
 * - Single source of truth for all enums used across the application
 */

// User roles
const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
};

// Order status values
const ORDER_STATUS = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// All valid order status values (for schema enum validation)
const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

// Pizza categories
const PIZZA_CATEGORIES = [
  "Veg",
  "Non-Veg",
  "Premium",
  "Classic",
  "Specialty",
];

// Pizza sizes
const PIZZA_SIZES = ["Small", "Medium", "Large", "Extra Large"];

// Payment methods
const PAYMENT_METHODS = ["Cash on Delivery", "Credit Card", "Debit Card", "UPI", "Net Banking"];

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

module.exports = {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  PIZZA_CATEGORIES,
  PIZZA_SIZES,
  PAYMENT_METHODS,
  PAGINATION,
};

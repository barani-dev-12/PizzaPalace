const mongoose = require("mongoose");
const { PIZZA_CATEGORIES, PIZZA_SIZES } = require("../config/constants");

/**
 * Pizza Model
 * - Represents a pizza item on the menu
 * - Supports multiple sizes with individual pricing
 * - Category-based classification for filtering
 * - isAvailable flag for toggling menu visibility
 */
const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pizza name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Pizza name must be at least 2 characters"],
      maxlength: [100, "Pizza name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: PIZZA_CATEGORIES,
        message: `Category must be one of: ${PIZZA_CATEGORIES.join(", ")}`,
      },
    },
    sizes: {
      type: [String],
      required: [true, "At least one size is required"],
      validate: {
        validator: function (val) {
          return val.length > 0 && val.every((s) => PIZZA_SIZES.includes(s));
        },
        message: `Sizes must be from: ${PIZZA_SIZES.join(", ")}`,
      },
    },
    prices: {
      type: Map,
      of: Number,
      required: [true, "Prices are required"],
      validate: {
        validator: function (val) {
          // Every size listed in the sizes array must have a corresponding price
          if (!this.sizes) return true;
          return this.sizes.every((size) => val.has(size) && val.get(size) > 0);
        },
        message: "Each size must have a corresponding price greater than 0",
      },
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/300x200?text=Pizza+Image",
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Index for efficient searching and sorting
 */
pizzaSchema.index({ name: "text", description: "text" });
pizzaSchema.index({ category: 1 });
pizzaSchema.index({ isAvailable: 1 });

/**
 * Transform JSON output to clean up response
 */
pizzaSchema.methods.toJSON = function () {
  const pizza = this.toObject({ flattenMaps: true });
  delete pizza.__v;
  return pizza;
};

module.exports = mongoose.model("Pizza", pizzaSchema);

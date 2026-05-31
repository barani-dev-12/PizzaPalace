const Pizza = require("../models/Pizza");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { PAGINATION } = require("../config/constants");
const { deletePizzaImageFile } = require("../utils/pizzaImage");
const { resolveUploadedImageUrl } = require("../utils/cloudinaryUpload");

// ════════════════════════════════════════════════════════════════
// @desc    Get all pizzas (with pagination, search, filter, sort)
// @route   GET /api/pizzas
// @access  Public
// ════════════════════════════════════════════════════════════════
exports.getAllPizzas = async (req, res, next) => {
  try {
    // ─── Pagination ─────────────────────────────────────────────
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    // ─── Build filter query ─────────────────────────────────────
    const filter = {};

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by availability
    if (req.query.isAvailable !== undefined) {
      filter.isAvailable = req.query.isAvailable === "true";
    }

    // Search by name (case-insensitive partial match)
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    // ─── Sorting ────────────────────────────────────────────────
    // Default sort: newest first. Accepts: name, -name, createdAt, -createdAt
    const sort = req.query.sort || "-createdAt";

    // ─── Execute query ──────────────────────────────────────────
    const [pizzas, total] = await Promise.all([
      Pizza.find(filter).sort(sort).skip(skip).limit(limit),
      Pizza.countDocuments(filter),
    ]);

    // ─── Pagination metadata ────────────────────────────────────
    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, 200, "Pizzas retrieved successfully", {
      pizzas,
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
// @desc    Get a single pizza by ID
// @route   GET /api/pizzas/:id
// @access  Public
// ════════════════════════════════════════════════════════════════
exports.getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return sendError(res, 404, "Pizza not found.");
    }

    return sendSuccess(res, 200, "Pizza retrieved successfully", { pizza });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Create a new pizza
// @route   POST /api/pizzas
// @access  Private/Admin
// ════════════════════════════════════════════════════════════════
exports.createPizza = async (req, res, next) => {
  try {
    const { name, description, category, sizes, prices, isAvailable } = req.body;

    // Check for duplicate pizza name
    const existingPizza = await Pizza.findOne({ name });
    if (existingPizza) {
      return sendError(res, 400, "A pizza with this name already exists.");
    }

    let image = "https://via.placeholder.com/300x200?text=Pizza+Image";
    if (req.file) {
      image = (await resolveUploadedImageUrl(req.file)) || image;
    }

    const pizza = await Pizza.create({
      name,
      description,
      category,
      sizes,
      prices,
      image,
      isAvailable,
    });

    return sendSuccess(res, 201, "Pizza created successfully", { pizza });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Update a pizza
// @route   PUT /api/pizzas/:id
// @access  Private/Admin
// ════════════════════════════════════════════════════════════════
exports.updatePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return sendError(res, 404, "Pizza not found.");
    }

    // Update only the fields that are provided
    const updatableFields = [
      "name",
      "description",
      "category",
      "sizes",
      "prices",
      "image",
      "isAvailable",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        pizza[field] = req.body[field];
      }
    });

    if (req.file) {
      await deletePizzaImageFile(pizza.image);
      const newImage = await resolveUploadedImageUrl(req.file);
      if (newImage) pizza.image = newImage;
    }

    const updatedPizza = await pizza.save();

    return sendSuccess(res, 200, "Pizza updated successfully", {
      pizza: updatedPizza,
    });
  } catch (error) {
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════
// @desc    Delete a pizza
// @route   DELETE /api/pizzas/:id
// @access  Private/Admin
// ════════════════════════════════════════════════════════════════
exports.deletePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return sendError(res, 404, "Pizza not found.");
    }

    await deletePizzaImageFile(pizza.image);

    await Pizza.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 200, "Pizza deleted successfully");
  } catch (error) {
    next(error);
  }
};

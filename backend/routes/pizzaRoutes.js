const express = require("express");
const router = express.Router();
const {
  getAllPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
} = require("../controllers/pizzaController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { uploadPizzaImage } = require("../middleware/uploadMiddleware");
const parsePizzaForm = require("../middleware/parsePizzaForm");
const { validatePizza, validateObjectId } = require("../middleware/validators");
const handleValidationErrors = require("../middleware/handleValidation");

const handleUpload = (req, res, next) => {
  uploadPizzaImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Image upload failed.",
      });
    }
    next();
  });
};

/**
 * Pizza Routes
 * GET    /api/pizzas          - Get all pizzas with pagination/search/filter (public)
 * GET    /api/pizzas/:id      - Get single pizza by ID (public)
 * POST   /api/pizzas          - Create a new pizza (admin only)
 * PUT    /api/pizzas/:id      - Update a pizza (admin only)
 * DELETE /api/pizzas/:id      - Delete a pizza (admin only)
 */

// @route   GET /api/pizzas
router.get("/", getAllPizzas);

// @route   GET /api/pizzas/:id
router.get("/:id", validateObjectId, handleValidationErrors, getPizzaById);

// @route   POST /api/pizzas (Admin only)
router.post(
  "/",
  protect,
  adminOnly,
  handleUpload,
  parsePizzaForm,
  validatePizza,
  handleValidationErrors,
  createPizza
);

// @route   PUT /api/pizzas/:id (Admin only)
router.put(
  "/:id",
  protect,
  adminOnly,
  handleUpload,
  parsePizzaForm,
  validateObjectId,
  validatePizza,
  handleValidationErrors,
  updatePizza
);

// @route   DELETE /api/pizzas/:id (Admin only)
router.delete(
  "/:id",
  protect,
  adminOnly,
  validateObjectId,
  handleValidationErrors,
  deletePizza
);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");

// GET all products
router.get("/", getProducts);

// GET single product
router.get("/:id", getProductById);

// CREATE product
router.post("/", protect, authorize("admin"), createProduct);

// UPDATE product (PUT)
router.put("/:id", protect, authorize("admin"), updateProduct);

// Allows PATCH requests for partial updates
router.patch("/:id", protect, authorize("admin"), updateProduct);

// DELETE product
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
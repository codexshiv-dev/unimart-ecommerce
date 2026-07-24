const express = require("express");
const router = express.Router();

const {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/auth");

// Public reads - storefront needs these without logging in
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategoryById);

// Admin-only writes
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;

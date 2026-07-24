const Category = require("../models/Category");
const Product = require("../models/Product");

// @desc   Get all categories
// @route  GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc   Get a single category by slug (used by storefront category pages)
// @route  GET /api/categories/slug/:slug
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug.toLowerCase() });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc   Get a single category by id (used by the admin edit form)
// @route  GET /api/categories/:id
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc   Create a new category
// @route  POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = await Category.create({ name: name.trim() });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A category with this name already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc   Update a category's name
// @route  PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // The slug intentionally does NOT change here, even though the name can -
    // see the comment in Category.js for why.
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A category with this name already exists" });
    }
    next(error);
  }
};

// @desc   Delete a category - blocked if any product still references it
// @route  DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete - ${productCount} product${productCount === 1 ? "" : "s"} still assigned to this category. Reassign or remove them first.`,
      });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

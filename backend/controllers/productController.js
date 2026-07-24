const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * ==========================================================================
 * 🏬 UNIMART CENTRAL PRODUCT CONTROL ENGINE
 * ==========================================================================
 */

// @desc   Get all products with Advanced Pagination, Filtering & Search
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 20, onlyActive } = req.query;
    
    const queryPipeline = {};

   //: If 'onlyActive' is sent from the frontend, filter by it
    if (onlyActive === 'true') {
      queryPipeline.status = 'active';
    }

    if (search) queryPipeline.name = { $regex: search, $options: "i" };

    // category is now an ObjectId reference, but the frontend still filters by
    // the human-readable slug (e.g. ?category=toys) - resolve it here.
    if (category && category !== "all") {
      const categoryDoc = await Category.findOne({ slug: category.toLowerCase().trim() });
      if (!categoryDoc) {
        // No matching category - return an empty result explicitly rather than
        // querying with a filter that can't match anything, or crash trying to
        // cast an arbitrary string into an ObjectId.
        return res.status(200).json({
          success: true,
          count: 0,
          pagination: { totalItems: 0, totalPages: 0, currentPage: Number(page), limit: Number(limit) },
          data: [],
        });
      }
      queryPipeline.category = categoryDoc._id;
    }

    if (minPrice || maxPrice) {
      queryPipeline.price = {};
      if (minPrice) queryPipeline.price.$gte = Number(minPrice);
      if (maxPrice) queryPipeline.price.$lte = Number(maxPrice);
    }

    const skipIndex = (Number(page) - 1) * Number(limit);
    
    const [products, totalProducts] = await Promise.all([
      Product.find(queryPipeline)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skipIndex)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(queryPipeline)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        totalItems: totalProducts,
        totalPages: Math.ceil(totalProducts / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit)
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single product by Object Identifier
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name slug").lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc   Create highly structured new inventory item
exports.createProduct = async (req, res, next) => {
  console.log("🔥 CREATE PRODUCT HIT");
  console.log("BODY SIZE:", JSON.stringify(req.body).length);
  try {
    const { name, price, oldPrice, category, stockQuantity, description, images, tags, sku } = req.body;

    // Category is now a reference, not free text - confirm it actually points
    // at a real Category document before saving, so Product.category never
    // holds a dangling/invalid id.
    if (category) {
      const categoryExists = await Category.exists({ _id: category });
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Invalid category" });
      }
    }

    const productData = {
      name: name?.trim(),
      description: description?.trim(),
      category: category || undefined,
      price: Math.abs(Number(price || 0)),
      oldPrice: oldPrice ? Math.abs(Number(oldPrice)) : undefined,
      stockQuantity: Math.abs(Math.floor(Number(stockQuantity || 0))),
      images: Array.isArray(images) ? images : [],
      tags: Array.isArray(tags) ? tags.map(t => t.toLowerCase().trim()) : [],
      sku: sku ? sku.toUpperCase().trim() : `GEN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    };

    const newProduct = await Product.create(productData);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "Duplicate SKU detected." });
    next(error);
  }
};


exports.updateProduct = async (req, res, next) => {
  try {
    // 1. SECURITY: Prevent unauthorized modification of sensitive fields
    const forbiddenFields = ['_id', 'createdAt', 'updatedAt', '__v'];
    forbiddenFields.forEach(field => delete req.body[field]);

    // 2. DATA SANITIZATION: Ensure status is always normalized
    if (req.body.status) {
      req.body.status = req.body.status.toLowerCase().trim();
    }

    // 3. ATOMIC UPDATE: Perform the database operation
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true, runValidators: true }
    );

    // 4. ELEGANT ERROR HANDLING: Check for existence
    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // 5. SUCCESS RESPONSE
    res.status(200).json({ success: true, data: updatedProduct });
    
  } catch (error) {
    // 6. PRODUCTION-READY LOGGING
    console.error(`❌ Update Error [ID: ${req.params.id}]:`, error.message);
    
    // Distinguish between validation errors and database crashes
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    next(error); // Pass to global error handler
  }
};

// @desc   Permanently remove an inventory record
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product record not found." });
    res.status(200).json({ success: true, message: "Product removed successfully." });
  } catch (error) {
    next(error);
  }
};
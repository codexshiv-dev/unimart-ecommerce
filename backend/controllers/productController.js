const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");

/**
 * ==========================================================================
 * 🏬 UNIMART CENTRAL PRODUCT CONTROL ENGINE
 * ==========================================================================
 */

// Shared validation for create/update. `isUpdate=true` skips "required" checks
// for fields that weren't included in the request, since a PATCH-style partial
// update shouldn't fail just because it left `name` out.
const validateProductFields = (data, isUpdate = false) => {
  const { name, price, oldPrice, stockQuantity, images } = data;

  if (!isUpdate || name !== undefined) {
    if (!name || !String(name).trim()) {
      return "Product name is required";
    }
  }

  if (!isUpdate || price !== undefined) {
    const numericPrice = Number(price);
    if (price === undefined || price === null || isNaN(numericPrice) || numericPrice <= 0) {
      return "Price is required and must be a positive number";
    }
  }

  if (oldPrice !== undefined && oldPrice !== null && oldPrice !== "") {
    const numericOldPrice = Number(oldPrice);
    if (isNaN(numericOldPrice) || numericOldPrice < 0) {
      return "Old price must be a non-negative number";
    }
  }

  if (stockQuantity !== undefined && stockQuantity !== null && stockQuantity !== "") {
    const numericStock = Number(stockQuantity);
    if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
      return "Stock quantity must be a non-negative whole number";
    }
  }

  // Images are now {url, publicId} objects, not bare strings. publicId in
  // particular is required for the automatic Cloudinary cleanup on delete to
  // work - without it, that image can never be removed from storage later.
  if (images !== undefined) {
    if (!Array.isArray(images)) {
      return "Images must be an array";
    }
    const hasInvalidImage = images.some(
      (img) => !img || typeof img !== "object" || !img.url || !img.publicId
    );
    if (hasInvalidImage) {
      return "Each image must include a valid url and publicId";
    }
  }

  return null;
};

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
  try {
    const { name, price, oldPrice, category, stockQuantity, description, images, tags, sku } = req.body;

    const validationError = validateProductFields(req.body, false);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

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
      name: name.trim(),
      description: description?.trim(),
      category: category || undefined,
      price: Number(price),
      oldPrice: oldPrice !== undefined && oldPrice !== null && oldPrice !== "" ? Number(oldPrice) : undefined,
      stockQuantity: stockQuantity !== undefined && stockQuantity !== null && stockQuantity !== "" ? Number(stockQuantity) : 0,
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

    // 2. VALIDATION: reject bad data with a clear message instead of silently
    // coercing it (e.g. a negative price should be rejected, not flipped positive)
    const validationError = validateProductFields(req.body, true);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // 3. If category is being changed, it must reference a real Category
    // document - same rule createProduct already enforces.
    if (req.body.category) {
      const categoryExists = await Category.exists({ _id: req.body.category });
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Invalid category" });
      }
    }

    // 4. DATA SANITIZATION: Ensure status is always normalized
    if (req.body.status) {
      req.body.status = req.body.status.toLowerCase().trim();
    }

    // 5. ATOMIC UPDATE: Perform the database operation
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true, runValidators: true }
    );

    // 6. ELEGANT ERROR HANDLING: Check for existence
    if (!updatedProduct) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // 7. SUCCESS RESPONSE
    res.status(200).json({ success: true, data: updatedProduct });
    
  } catch (error) {
    // 8. PRODUCTION-READY LOGGING
    console.error(`❌ Update Error [ID: ${req.params.id}]:`, error.message);
    
    // Distinguish between validation errors and database crashes
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    next(error); // Pass to global error handler
  }
};

// @desc   Permanently remove an inventory record (blocked while the product is active)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product record not found." });

    // Safety gate: an active product (visible to customers right now) can't be
    // hard-deleted directly. It must be deactivated first - a deliberate,
    // reversible step - before the irreversible delete is allowed.
    if (product.status === "active") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete an active product. Set its status to inactive first.",
      });
    }

    // Clean up Cloudinary images before removing the product record, so no
    // orphaned files are left behind in storage. A failure to delete one
    // image doesn't block the product deletion itself - it's logged
    // server-side instead, since the admin's primary intent (remove the
    // product) shouldn't be blocked by a secondary cleanup step failing.
    if (Array.isArray(product.images) && product.images.length > 0) {
      await Promise.all(
        product.images
          .filter((img) => img.publicId)
          .map((img) =>
            cloudinary.uploader.destroy(img.publicId).catch((err) => {
              console.error(`⚠️ Failed to delete Cloudinary image ${img.publicId}:`, err.message);
              return null;
            })
          )
      );
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product removed successfully." });
  } catch (error) {
    next(error);
  }
};
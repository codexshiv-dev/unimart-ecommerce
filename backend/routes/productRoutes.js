const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus // Make sure you import this, or use updateProduct
} = require("../controllers/productController");

// GET all products
router.get("/", getProducts);

// GET single product
router.get("/:id", getProductById);

// CREATE product
router.post("/", createProduct);

// UPDATE product (PUT)
router.put("/:id", updateProduct);

//ADD THIS LINE: Allows PATCH requests for partial updates
router.patch("/:id", updateProduct); 

// DELETE product
router.delete("/:id", deleteProduct);

module.exports = router;
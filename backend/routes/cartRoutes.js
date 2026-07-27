const express = require("express");
const router = express.Router();

const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  syncCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

// Every cart route requires login - guest carts live entirely in the
// frontend's localStorage and never reach the backend.
router.use(protect);

router.get("/", getCart);
router.post("/item", addItem);
router.put("/item/:productId", updateItemQuantity);
router.delete("/item/:productId", removeItem);
router.delete("/", clearCart);
router.post("/sync", syncCart);

module.exports = router;

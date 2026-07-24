const express = require("express");
const router = express.Router();

const { createOrder, getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

// CREATE ORDER - stays public to preserve guest checkout
router.post("/", createOrder);

// GET ALL ORDERS - admin only
router.get("/", protect, authorize("admin"), getAllOrders);

// UPDATE STATUS - admin only
router.patch("/:id", protect, authorize("admin"), updateOrderStatus);

module.exports = router;

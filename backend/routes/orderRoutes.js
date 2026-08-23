const express = require("express");
const router = express.Router();

const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

// Order creation no longer lives here - see routes/checkoutRoutes.js
// (POST /api/checkout). This file is now admin-management only.

// GET ALL ORDERS - admin only
router.get("/", protect, authorize("admin"), getAllOrders);

// UPDATE STATUS - admin only
router.patch("/:id", protect, authorize("admin"), updateOrderStatus);

module.exports = router;

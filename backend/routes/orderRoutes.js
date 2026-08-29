const express = require("express");
const router = express.Router();

const { getAllOrders, updateOrderStatus, getMyOrders, getMyOrderById, cancelMyOrder } = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

// Order creation no longer lives here - see routes/checkoutRoutes.js
// (POST /api/checkout). This file is now admin-management only, plus the
// customer-facing "my orders" routes below.

// CUSTOMER - own orders only, ownership enforced in the controller query
router.get("/mine", protect, getMyOrders);
router.get("/mine/:id", protect, getMyOrderById);
router.patch("/mine/:id/cancel", protect, cancelMyOrder);

// GET ALL ORDERS - admin only
router.get("/", protect, authorize("admin"), getAllOrders);

// UPDATE STATUS - admin only
router.patch("/:id", protect, authorize("admin"), updateOrderStatus);

module.exports = router;

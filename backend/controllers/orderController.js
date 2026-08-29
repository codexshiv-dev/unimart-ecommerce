const mongoose = require("mongoose");
const Order = require("../models/Order");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc   Get the logged-in customer's own orders, newest first
// @route  GET /api/orders/mine
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc   Get a single order - ONLY if it belongs to the logged-in customer
// @route  GET /api/orders/mine/:id
// Ownership is enforced directly in the query filter (user: req.user._id),
// not checked after fetching - a malformed or someone-else's id both result
// in the same 404, never leaking whether the order exists for another user.
exports.getMyOrderById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc   Cancel the logged-in customer's own order, only while still Pending
// @route  PATCH /api/orders/mine/:id/cancel
exports.cancelMyOrder = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status !== "Pending") {
      return res.status(400).json({ success: false, message: `Order cannot be cancelled once it is ${order.status}` });
    }
    order.status = "Cancelled";
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc   Get all orders
// @route  GET /api/orders
// Admin only - exposes customer name/phone/address for every order.
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc   Update an order's status
// @route  PATCH /api/orders/:id
// Admin only.
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

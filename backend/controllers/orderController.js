const Order = require("../models/Order");

// @desc Fetch all orders
// @route GET /api/orders
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        next(err);
    }
};
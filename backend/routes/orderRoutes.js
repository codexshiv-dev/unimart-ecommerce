const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// CREATE ORDER
router.post("/", async (req, res) => {
    try {
        const {
            orderId,
            customerName,
            customerPhone,
            customerAddress,
            items,
            totalAmount,
            paymentMethod
        } = req.body;

        if (!customerName || !customerPhone || !customerAddress) {
            return res.status(400).json({ message: "Missing customer details" });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const order = new Order({
            orderId,
            customerName,
            customerPhone,
            customerAddress,
            items,
            totalAmount,
            paymentMethod,
            status: "Pending"
        });

        const saved = await order.save();

        res.status(201).json(saved);

    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// GET ALL
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE STATUS (FIXED)
router.patch("/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status required" });
        }

        const allowed = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(updated);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
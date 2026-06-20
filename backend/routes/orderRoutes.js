const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


// CREATE ORDER
router.post("/", async (req, res) => {
    try {

        const {
            customerName,
            customerAddress,
            paymentMethod,
            itemsSubtotal,
            deliveryFee,
            grandTotal,
            cartItems
        } = req.body;

        // Basic validation: ensure critical data exists
        if (!customerName || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Missing required order information" });
        }

        const order = new Order({
            customerName,
            customerAddress,
            paymentMethod,
            itemsSubtotal,
            deliveryFee,
            grandTotal,
            cartItems
        });

        const savedOrder = await order.save();

        res.status(201).json(savedOrder);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });
    }
});


// GET ALL ORDERS
router.get("/", async (req, res) => {
    try {

        const orders =
            await Order.find()
            .sort({ createdAt: -1 });

        res.json(orders);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
});


// UPDATE STATUS
router.patch("/:id", async (req, res) => {

    try {

        // Validate that status is provided
        if (!req.body.status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updatedOrder =
            await Order.findByIdAndUpdate(
                req.params.id,
                {
                    status: req.body.status
                },
                {
                    new: true, runValidators: true
                }
            );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(updatedOrder);

    } catch (err) {

        res.status(400).json({
            message:
                "Failed to update status"
        });
    }
});

module.exports = router;
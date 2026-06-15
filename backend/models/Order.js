const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Pending", enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] },
    paymentStatus: { type: String, default: "Unpaid", enum: ["Unpaid", "Paid", "Failed"] }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
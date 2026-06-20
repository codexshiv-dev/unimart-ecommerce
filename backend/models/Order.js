const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true // Fast lookup for Admin search
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
        type: String, 
        default: "Pending", 
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        index: true // Fast filtering for Admin Dashboard
    },
    paymentStatus: { 
        type: String, 
        default: "Unpaid", 
        enum: ["Unpaid", "Paid", "Failed"] 
    }
}, { 
    timestamps: true 
});


module.exports = mongoose.model("Order", orderSchema);
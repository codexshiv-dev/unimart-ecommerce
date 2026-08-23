const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    orderId:{
        type:String,
        required:true,
        unique:true,
        index:true
    },

    // Optional - present for logged-in checkouts, absent for guest orders.
    // Guest checkout must remain fully supported, so this is never required.
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:false,
        index:true
    },

    customerName:{
        type:String,
        required:true,
        trim:true
    },

    customerPhone:{
        type:String,
        required:true,
        trim:true
    },

    customerAddress:{
        type:String,
        required:true,
        trim:true
    },

    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },

            name:{
                type:String,
                required:true
            },

            quantity:{
                type:Number,
                required:true,
                min:1
            },

            price:{
                type:Number,
                required:true
            }
        }
    ],

    totalAmount:{
        type:Number,
        required:true
    },

    paymentMethod:{
        type:String,
        default:"WhatsApp"
    },

    status:{
        type:String,
        default:"Pending",
        enum:[
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ],
        index:true
    },

    paymentStatus:{
        type:String,
        default:"Unpaid",
        enum:[
            "Unpaid",
            "Paid",
            "Failed"
        ]
    }

},{
    timestamps:true
});

// AUTO orderId generator (PRODUCTION SAFE)
// Runs in pre("validate"), not pre("save") - orderId is required, and
// validation runs BEFORE pre("save") hooks fire.
// No `next` parameter - Mongoose 9's hook execution doesn't support the old
// callback-style next() the way earlier versions did. Same fix already
// applied to User.js's password-hashing hook.
orderSchema.pre("validate", function () {
    if (!this.orderId) {
        this.orderId = "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    }
});

module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // No price stored here deliberately - price is always resolved live
        // from Product at read time, so the cart can never show a stale
        // price. See TECHNICAL_DEBT.md #14 for the related pricing-trust
        // issue this is intentionally avoiding repeating.
        quantity: {
          type: Number,
          required: true,
          min: 1,
          max: 99,
        },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);

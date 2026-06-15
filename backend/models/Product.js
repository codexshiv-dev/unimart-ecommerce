const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    images: {
      type: [String], // Array of image URLs
      default: [],
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    sku: {
      type: String,
      unique: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [
        {
          user: String,
          comment: String,
          rating: Number,
          date: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
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
      // Array of {url, publicId} - publicId is required to delete the image
      // from Cloudinary later. _id:false because each image doesn't need its
      // own separate identifier beyond publicId, which already serves that role.
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
          _id: false,
        },
      ],
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
      sparse: true,
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
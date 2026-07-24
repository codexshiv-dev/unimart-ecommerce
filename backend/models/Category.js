const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// AUTO slug generator (runs before validation, not before save)
// Slug must exist before validation runs, since it's a required field -
// generating it in pre("save") would be too late and fail validation first.
// Once a slug is set, it is never regenerated, even if the name changes later,
// so existing storefront URLs/bookmarks for this category keep working.
categorySchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  
});

module.exports = mongoose.model("Category", categorySchema);

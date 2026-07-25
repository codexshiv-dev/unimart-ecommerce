// testCloudinary.js
// Run standalone: node testCloudinary.js
// Completely outside Express/multer - if this also throws "Invalid Signature",
// the problem is confirmed to be credential loading, not the upload code.

require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Diagnostic logging - never logs the actual secret value, only its shape,
// so this is safe to leave in your terminal output / share if needed.
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY_API_SECRET is set:", Boolean(process.env.CLOUDINARY_API_SECRET));
console.log("CLOUDINARY_API_SECRET length:", process.env.CLOUDINARY_API_SECRET?.length);
console.log(
  "CLOUDINARY_API_SECRET starts/ends with whitespace or quotes:",
  /^["'\s]|["'\s]$/.test(process.env.CLOUDINARY_API_SECRET || "")
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads from a remote URL (Cloudinary's own public demo image) so you don't
// need a local test file - it fetches and re-uploads it to YOUR account.
cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { folder: "unimart/products" },
  (error, result) => {
    if (error) {
      console.error("❌ Upload failed:", error);
    } else {
      console.log("✅ Upload succeeded:", result.secure_url);
    }
  }
);

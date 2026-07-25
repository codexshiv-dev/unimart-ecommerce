const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const { uploadImages, deleteImage } = require("../controllers/uploadController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Rate limited like auth endpoints - Cloudinary usage is billed/quota-based,
// so an unrestricted endpoint is a cost/abuse vector, not just a security one.
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many upload requests, please slow down." },
});

// Wraps multer so its errors (file too large, too many files, wrong type)
// return a clean 400 instead of falling through to the generic 500 handler.
const handleImageUpload = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Each image must be 5MB or smaller" });
      }
      if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ success: false, message: "You can upload a maximum of 5 images at once" });
      }
      return res.status(400).json({ success: false, message: err.message || "Image upload failed" });
    }
    next();
  });
};

router.post("/images", protect, authorize("admin"), uploadLimiter, handleImageUpload, uploadImages);
router.delete("/image", protect, authorize("admin"), deleteImage);

module.exports = router;

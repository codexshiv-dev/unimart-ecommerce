const multer = require("multer");

// Memory storage, not disk storage - Render's filesystem is ephemeral, so
// buffers are streamed straight to Cloudinary without ever touching disk.
const storage = multer.memoryStorage();

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 5, // max 5 images per request
  },
});

module.exports = upload;

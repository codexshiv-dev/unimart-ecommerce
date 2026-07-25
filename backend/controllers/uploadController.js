const cloudinary = require("../config/cloudinary");

// multer's memory storage gives us a buffer, not a file path - Cloudinary's
// SDK needs a stream to upload from a buffer, so this wraps that in a Promise
// to use with async/await and Promise.all below.
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "unimart/products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// @desc   Upload up to 5 product images to Cloudinary
// @route  POST /api/uploads/images
exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image file is required" });
    }

    const uploadResults = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer))
    );

    const images = uploadResults.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));

    res.status(201).json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete a single image from Cloudinary
// @route  DELETE /api/uploads/image
// Note: this only removes the file from Cloudinary storage. If the image is
// still referenced in a product's `images` array, that reference must be
// removed separately via a product update - the two are not linked
// automatically. See docs/FRONTEND_INTEGRATION_NOTES.md.
exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ success: false, message: "publicId is required" });
    }

    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};

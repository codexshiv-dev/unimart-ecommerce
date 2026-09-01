/**
 * UNiMART Admin — Upload service. Wraps /api/uploads exactly as implemented
 * in backend/controllers/uploadController.js + middleware/upload.js.
 * Backend limits: max 5 images per request, 5MB each, JPEG/PNG/WEBP only.
 */
const AdminUploadService = {
  // POST /api/uploads/images (multipart, field name "images", up to 5 files)
  // -> { success, data: [{ url, publicId }] }
  uploadImages: (fileList) => {
    const formData = new FormData();
    Array.from(fileList).forEach((file) => formData.append("images", file));
    return AdminApiClient.postMultipart(AdminConfig.getUrl("uploadImages"), formData);
  },

  // DELETE /api/uploads/image { publicId } -> { success, message }
  // Only removes the file from Cloudinary storage - if it's still referenced
  // on a product, that reference must be removed separately via a product
  // update (the two are not linked automatically on the backend).
  deleteImage: (publicId) => AdminApiClient.delete(AdminConfig.getUrl("uploadImage"), { publicId }),
};

const ADMIN_UPLOAD_LIMITS = {
  maxFiles: 5,
  maxFileSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
};

window.AdminUploadService = AdminUploadService;
window.ADMIN_UPLOAD_LIMITS = ADMIN_UPLOAD_LIMITS;

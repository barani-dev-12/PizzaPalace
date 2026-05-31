const { cloudinary, isCloudinaryConfigured, PIZZA_IMAGE_FOLDER } = require("../config/cloudinary");

/**
 * Upload image buffer to Cloudinary (permanent HTTPS URL for Render/production).
 */
const uploadPizzaImageToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: PIZZA_IMAGE_FOLDER,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Remove image from Cloudinary when pizza is updated/deleted.
 */
const deleteCloudinaryImage = async (imageUrl) => {
  if (!isCloudinaryConfigured() || !imageUrl?.includes("res.cloudinary.com")) {
    return;
  }

  try {
    const afterUpload = imageUrl.split("/upload/")[1];
    if (!afterUpload) return;

    const publicId = afterUpload
      .replace(/^v\d+\//, "")
      .replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Cloudinary delete skipped:", err.message);
  }
};

/**
 * Resolve image URL after admin upload (Cloudinary or local disk).
 */
const resolveUploadedImageUrl = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured() && file.buffer) {
    return uploadPizzaImageToCloudinary(file.buffer);
  }

  if (file.filename) {
    return `/uploads/pizzas/${file.filename}`;
  }

  return null;
};

module.exports = {
  uploadPizzaImageToCloudinary,
  deleteCloudinaryImage,
  resolveUploadedImageUrl,
  isCloudinaryConfigured,
};

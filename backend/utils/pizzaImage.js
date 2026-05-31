const fs = require("fs");
const path = require("path");
const { deleteCloudinaryImage } = require("./cloudinaryUpload");

const deletePizzaImageFile = async (imagePath) => {
  if (!imagePath) return;

  if (imagePath.includes("res.cloudinary.com")) {
    await deleteCloudinaryImage(imagePath);
    return;
  }

  if (!imagePath.startsWith("/uploads/pizzas/")) {
    return;
  }

  const fullPath = path.join(__dirname, "..", imagePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { deletePizzaImageFile };

const fs = require("fs");
const path = require("path");

const deletePizzaImageFile = (imagePath) => {
  if (!imagePath || !imagePath.startsWith("/uploads/pizzas/")) {
    return;
  }

  const fullPath = path.join(__dirname, "..", imagePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = { deletePizzaImageFile };

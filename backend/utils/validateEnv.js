/**
 * Logs missing required env vars on startup (Render dashboard must set these).
 */
const validateEnv = () => {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error("\n❌ Missing required environment variables on Render:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error(
      "\n   Render → your service → Environment → add each variable, then redeploy.\n"
    );
    return false;
  }

  const uri = process.env.MONGO_URI.trim();
  // Atlas URIs should include a database name: ...mongodb.net/pizzapalace?...
  const hasDbName =
    /mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri) && !uri.includes(".net/?");
  if (!hasDbName) {
    console.warn(
      "⚠️  MONGO_URI may be missing a database name. Example:\n" +
        "   mongodb+srv://user:pass@cluster.mongodb.net/pizzapalace?retryWrites=true&w=majority"
    );
  }

  if (!process.env.KEY_ID || !process.env.KEY_SECRET) {
    console.warn(
      "⚠️  KEY_ID / KEY_SECRET not set — online payments disabled (COD still works)."
    );
  }

  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;
  if (process.env.NODE_ENV === "production" && !hasCloudinary) {
    console.warn(
      "⚠️  Cloudinary not configured — uploaded images on Render will be lost after redeploy. See CLOUDINARY_SETUP.md"
    );
  }

  return true;
};

module.exports = validateEnv;

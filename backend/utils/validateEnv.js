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

  if (!process.env.KEY_ID || !process.env.KEY_SECRET) {
    console.warn(
      "⚠️  KEY_ID / KEY_SECRET not set — online payments disabled (COD still works)."
    );
  }

  return true;
};

module.exports = validateEnv;

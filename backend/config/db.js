const mongoose = require("mongoose");
const dbConfig = require("./db.config");

const connectDB = async () => {
  const url = dbConfig.getMongoUrl();
  if (!url) {
    console.error(
      "\n❌ MONGO_URI is not set.\n" +
        "   Render → Environment → add MONGO_URI with your Atlas connection string.\n" +
        "   Example: mongodb+srv://user:pass@cluster.mongodb.net/pizzapalace?retryWrites=true&w=majority\n"
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(url, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Database: ${conn.connection.name}`);

    // Connection event listeners for monitoring
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Graceful shutdown — close the MongoDB connection
 * before the Node.js process exits
 */
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during MongoDB shutdown:", err);
    process.exit(1);
  }
};

// Listen for process termination signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

module.exports = connectDB;

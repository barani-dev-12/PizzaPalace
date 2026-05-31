const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const validateEnv = require("./utils/validateEnv");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const pizzaRoutes = require("./routes/pizzaRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Parse JSON request bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// CORS: Vercel production URL, preview deployments, and local dev
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = [process.env.CLIENT_URL, "http://localhost:3000"].filter(Boolean);
      const isAllowed =
        allowed.includes(origin) || /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin);
      if (isAllowed) return callback(null, true);
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

// Serve uploaded pizza images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// HTTP request logging (dev format for development)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}


// Health check / welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Pizza Palace API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      pizzas: "/api/pizzas",
      orders: "/api/orders",
      payments: "/api/payments",
    },
  });
});

// Mount route modules
app.use("/api/auth", authRoutes);
app.use("/api/pizzas", pizzaRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);


// Handle 404 — route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!validateEnv()) {
    process.exit(1);
  }

  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🍕 ═══════════════════════════════════════════════`);
    console.log(`   Pizza Palace API Server`);
    console.log(`   Running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`═══════════════════════════════════════════════════\n`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

module.exports = app;
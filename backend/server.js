const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const validateEnv = require("./utils/validateEnv");
const ensureDb = require("./middleware/ensureDb");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { sendSuccess } = require("./utils/apiResponse");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const pizzaRoutes = require("./routes/pizzaRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// CORS must be first so OPTIONS preflight succeeds before body parsers / DB checks
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean);
    const isAllowed =
      allowed.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
    if (isAllowed) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Parse JSON request bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

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

// DB health (for debugging registration / API issues on Render)
app.get("/api/health", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  return sendSuccess(res, dbReady ? 200 : 503, dbReady ? "API and database OK" : "Database not connected", {
    database: dbReady ? "connected" : "disconnected",
    dbName: mongoose.connection.name || null,
  });
});

app.use("/api", (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  return ensureDb(req, res, next);
});
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
    console.log(`   Pizza Palace API Server`);
    console.log(`   Running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

module.exports = app;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading media files in frontend from server/uploads
}));
app.use(compression());
app.use(morgan("dev"));

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:8080";
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting (200 requests per 15 mins per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api/", limiter);

// Serve uploads folder static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route imports
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const locationRoutes = require("./routes/locationRoutes");
const statsRoutes = require("./routes/statsRoutes");

// Route registrations
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/stats", statsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Root fallback / index
app.get("/", (req, res) => {
  res.send("CityScan API Running");
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack || err);
  res.status(500).json({ message: "Internal server error" });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cityscan";
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route imports
const complaintRoutes = require("./routes/complaintRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const locationRoutes = require("./routes/locationRoutes");

// Route registrations
app.use("/api/complaints", complaintRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/location", locationRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Public Eye API Running");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

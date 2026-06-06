const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


const complaintRoutes = require("./routes/complaintRoutes");

const app = express();
const rewardRoutes = require("./routes/rewardRoutes");
app.use("/api/rewards", rewardRoutes);
const locationRoutes = require("./routes/locationRoutes");
app.use("/api/location", locationRoutes);



// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/complaints", complaintRoutes);

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

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get logged-in user's points
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ points: user.points });
  } catch (err) {
    console.error("Get Points Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Claim reward (requires authenticated user)
router.post("/claim", auth, async (req, res) => {
  try {
    const { points } = req.body;

    // Validate points: must be positive, integer, non-zero
    const pointsToClaim = parseInt(points, 10);
    if (isNaN(pointsToClaim) || pointsToClaim <= 0 || !Number.isInteger(pointsToClaim)) {
      return res.status(400).json({ message: "Invalid points value to claim" });
    }

    // Atomic update: only decrement points if the user has enough points
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, points: { $gte: pointsToClaim } },
      { $inc: { points: -pointsToClaim } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: "Not enough points or user not found" });
    }

    res.json({
      message: "Reward claimed successfully",
      remainingPoints: user.points,
    });

  } catch (err) {
    console.error("Claim Reward Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

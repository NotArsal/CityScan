const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get user points
router.get("/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.params.firebaseUid,
    });

    if (!user) {
      return res.json({ points: 0 });
    }

    res.json({ points: user.points });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Claim reward
router.post("/claim", async (req, res) => {
  try {
    const { firebaseUid, points } = req.body;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.points < points) {
      return res.status(400).json({ message: "Not enough points" });
    }

    user.points -= points;
    await user.save();

    res.json({ message: "Reward claimed successfully", remainingPoints: user.points });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

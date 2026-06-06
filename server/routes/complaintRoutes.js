const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const User = require("../models/User");


// ================= CREATE COMPLAINT =================
router.post("/", async (req, res) => {
  try {

    // 🔥 SAFE UNIQUE ID (no duplicates, no countDocuments)
    const complaintId = `CVC-${Date.now()}`;

    // ---------------- PRIORITY LOGIC ----------------
    let priority = "Medium";

    if (req.body.type === "potholes" || req.body.type === "Waterlogging") {
      priority = "High";
    } else if (req.body.type === "garbage") {
      priority = "Low";
    }

    // ---------------- SAFE USER HANDLING ----------------
    let user = null;

    if (req.body.firebaseUid) {
      user = await User.findOne({
        firebaseUid: req.body.firebaseUid,
      });

      if (!user) {
        user = new User({
          firebaseUid: req.body.firebaseUid,
          email: req.body.email || "",
        });
        await user.save();
      }
    }

    // ---------------- ESTIMATED RESOLUTION ----------------
    let estimatedDate = new Date();

    if (priority === "High") {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
    } else if (priority === "Medium") {
      estimatedDate.setDate(estimatedDate.getDate() + 3);
    } else {
      estimatedDate.setDate(estimatedDate.getDate() + 5);
    }

    const complaint = new Complaint({
      complaintId,
      ...req.body,
      userId: user ? user._id : null,
      status: "Pending",
      priority,
      estimatedResolution: estimatedDate,
      progressHistory: [{ status: "Pending" }],
    });

    const savedComplaint = await complaint.save();

    res.status(201).json(savedComplaint);

  } catch (error) {
    console.error("🔥 Complaint Creation Error:", error);
    res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }
});


// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("🔥 Get All Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================= GET BY ID =================
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);

  } catch (error) {
    console.error("🔥 Get By ID Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================= UPDATE STATUS =================
router.put("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const newStatus = req.body.status;

    complaint.status = newStatus;

    // Reward logic (safe)
    if (newStatus === "Resolved" && !complaint.rewardGiven) {
      if (complaint.userId) {
        const user = await User.findById(complaint.userId);

        if (user) {
          user.points += 10;
          await user.save();
        }
      }

      complaint.rewardGiven = true;
    }

    // Add to progress history
    complaint.progressHistory.push({
      status: newStatus,
    });

    await complaint.save();

    res.json(complaint);

  } catch (error) {
    console.error("🔥 Status Update Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// ================= ADD FEEDBACK =================
router.post("/:id/feedback", async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const complaint = await Complaint.findOne({
      complaintId: req.params.id,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status !== "Resolved") {
      return res.status(400).json({
        message: "Feedback allowed only after complaint is resolved",
      });
    }

    complaint.feedback = {
      rating,
      comment,
      submittedAt: new Date(),
    };

    await complaint.save();

    res.json({ message: "Feedback submitted successfully" });

  } catch (error) {
    console.error("🔥 Feedback Error:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;

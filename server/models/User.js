const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");


// ================= CREATE COMPLAINT =================
router.post("/", async (req, res) => {
  try {
    const count = await Complaint.countDocuments();
    const nextNumber = count + 1;
    const complaintId = `CVC-${nextNumber.toString().padStart(6, "0")}`;

    // ---------------- PRIORITY LOGIC ----------------
    let priority = "Medium";

    if (req.body.type === "potholes" || req.body.type === "Waterlogging") {
      priority = "High";
    } else if (req.body.type === "garbage") {
      priority = "Low";
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
      status: "Pending",
      priority,
      estimatedResolution: estimatedDate,
      progressHistory: [
        {
          status: "Pending",
        },
      ],
    });

    const savedComplaint = await complaint.save();
    res.status(201).json(savedComplaint);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
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

    // Add to progress history
    complaint.progressHistory.push({
      status: newStatus,
    });

    await complaint.save();

    res.json(complaint);

  } catch (error) {
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
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const upload = require("../middleware/upload");
const { classifyImage, analyzeText } = require("../services/mlService");

// Multipart form upload handler wrapper
const cpUpload = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "voiceNote", maxCount: 1 }
]);

const handleUpload = (req, res, next) => {
  cpUpload(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Helper for department auto-routing
function getDepartment(type) {
  const t = type ? type.toLowerCase() : "other";
  if (t.includes("pothole") || t.includes("road")) return "Roads & Infrastructure";
  if (t.includes("garbage") || t.includes("waste") || t.includes("sanitation")) return "Sanitation & Waste Management";
  if (t.includes("waterlogging") || t.includes("drain") || t.includes("sewer")) return "Drainage & Sewerage Department";
  if (t.includes("water") || t.includes("leak")) return "Water Supply Department";
  if (t.includes("light") || t.includes("lamp") || t.includes("electrical")) return "Electrical Department";
  return "General Administration";
}

// ================= CREATE COMPLAINT =================
// Requires authentication and accepts multipart form data (files)
router.post("/", auth, handleUpload, async (req, res) => {
  try {
    const { title, description, type, zone, location } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ message: "Title, description, and type are required" });
    }

    const complaintId = `CVC-${Date.now()}`;

    // Priority logic (case-insensitive default)
    let priority = "Medium";
    const typeLower = type.toLowerCase();
    if (typeLower === "potholes" || typeLower === "waterlogging" || typeLower === "road") {
      priority = "High";
    } else if (typeLower === "garbage" || typeLower === "streetlight") {
      priority = "Low";
    }

    // Default department based on user-entered type
    let department = getDepartment(type);

    // Build base URL for absolute paths
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Process uploaded files
    const imageUrls = [];
    if (req.files && req.files["images"]) {
      req.files["images"].forEach(file => {
        imageUrls.push(`${baseUrl}/uploads/images/${file.filename}`);
      });
    }

    let voiceNoteUrl = "";
    if (req.files && req.files["voiceNote"] && req.files["voiceNote"][0]) {
      voiceNoteUrl = `${baseUrl}/uploads/voice/${req.files["voiceNote"][0].filename}`;
    }

    // Parse location
    let parsedLocation = {};
    if (location) {
      if (typeof location === "string") {
        try {
          parsedLocation = JSON.parse(location);
        } catch (e) {
          parsedLocation = { address: location };
        }
      } else {
        parsedLocation = location;
      }
    }

    // Initialize ML prediction fields
    const mlPrediction = {
      category: "",
      confidence: 0,
      department: "",
      urgencyScore: 0,
      isDuplicate: false,
      similarComplaintId: "",
    };

    // --- ML/DL Pipeline Execution (Fail-safe wrapper) ---
    try {
      // 1. Image Classification (if image is uploaded)
      if (req.files && req.files["images"] && req.files["images"][0]) {
        const primaryImage = req.files["images"][0];
        const imagePath = path.join(__dirname, "../uploads/images", primaryImage.filename);
        const imageBuffer = fs.readFileSync(imagePath);

        const imgResult = await classifyImage(imageBuffer, primaryImage.mimetype, primaryImage.filename);
        if (imgResult) {
          mlPrediction.category = imgResult.category;
          mlPrediction.confidence = imgResult.confidence;
          mlPrediction.department = getDepartment(imgResult.category);

          // If ML is high confidence, overwrite department
          if (imgResult.confidence > 0.75) {
            department = mlPrediction.department;
          }
        }
      }

      // 2. Text Urgency & Duplicate Detection
      const recentComplaints = await Complaint.find({
        zone: zone || "Unknown Zone",
        status: { $ne: "Resolved" }
      })
      .select("complaintId description")
      .limit(50);

      const existingComplaints = recentComplaints.map(c => ({
        id: c.complaintId,
        text: c.description
      }));

      const textResult = await analyzeText(description, zone || "Unknown Zone", existingComplaints);
      if (textResult) {
        mlPrediction.urgencyScore = textResult.urgencyScore;
        mlPrediction.isDuplicate = textResult.isDuplicate;
        mlPrediction.similarComplaintId = textResult.similarComplaintId || "";

        // Urgency-based auto-escalation
        if (textResult.urgencyScore > 0.7) {
          priority = "High";
        }
      }
    } catch (mlErr) {
      console.warn("ML Service is offline or returned an error. Proceeding with heuristics. Error:", mlErr.message);
    }

    // Estimated resolution date calculation
    let estimatedDate = new Date();
    if (priority === "High") {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
    } else if (priority === "Medium") {
      estimatedDate.setDate(estimatedDate.getDate() + 3);
    } else {
      estimatedDate.setDate(estimatedDate.getDate() + 5);
    }

    // Construct complaint strictly avoiding mass assignment
    const complaint = new Complaint({
      complaintId,
      title,
      description,
      type,
      zone: zone || "Unknown Zone",
      location: {
        address: parsedLocation.address || "",
        latitude: parsedLocation.latitude,
        longitude: parsedLocation.longitude,
        timestamp: parsedLocation.timestamp ? new Date(parsedLocation.timestamp) : new Date(),
      },
      userId: req.user._id,
      status: "Pending",
      priority,
      department,
      estimatedResolution: estimatedDate,
      imageUrls,
      voiceNoteUrl,
      mlPrediction,
      progressHistory: [{ status: "Pending", updatedAt: new Date(), notes: "Complaint submitted" }],
    });

    const savedComplaint = await complaint.save();
    res.status(201).json(savedComplaint);

  } catch (error) {
    console.error("Complaint Creation Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= GET ALL (with Pagination & Filtering) =================
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.zone) {
      filter.zone = req.query.zone;
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "displayName email avatar");

    res.json({
      complaints,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get All Complaints Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= GET BY ID =================
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id })
      .populate("userId", "displayName email avatar");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Get Complaint By ID Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= UPDATE STATUS (Admin Only) =================
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;

    // Reward points safely
    if (status === "Resolved" && !complaint.rewardGiven) {
      if (complaint.userId) {
        await User.findByIdAndUpdate(
          complaint.userId,
          { $inc: { points: 10 } }
        );
      }
      complaint.rewardGiven = true;
    }

    // Add to progress history
    complaint.progressHistory.push({
      status,
      updatedAt: new Date(),
      notes: notes || `Status updated to ${status}`,
    });

    await complaint.save();
    res.json(complaint);

  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= ADD FEEDBACK =================
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check ownership
    if (complaint.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: "Access forbidden: you can only submit feedback for your own complaints" });
    }

    if (complaint.status !== "Resolved") {
      return res.status(400).json({
        message: "Feedback is only allowed for resolved complaints",
      });
    }

    complaint.feedback = {
      rating,
      comment: comment || "",
      submittedAt: new Date(),
    };

    await complaint.save();
    res.json({ message: "Feedback submitted successfully" });

  } catch (error) {
    console.error("Feedback Submission Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

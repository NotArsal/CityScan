const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["garbage", "water", "streetlight", "road", "potholes", "waterlogging", "other"],
        message: "{VALUE} is not a supported complaint type",
      },
    },
    status: {
      type: String,
      default: "Pending",
      enum: {
        values: ["Pending", "In Progress", "Resolved", "Rejected"],
        message: "{VALUE} is not a valid status",
      },
    },
    department: {
      type: String,
      default: "General Department",
    },
    zone: {
      type: String,
      default: "Unknown Zone",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User association is required"],
    },
    location: {
      address: {
        type: String,
      },
      latitude: {
        type: Number,
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"],
      },
      longitude: {
        type: Number,
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    estimatedResolution: {
      type: Date,
    },
    progressHistory: [
      {
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Resolved", "Rejected"],
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          default: "",
        },
      },
    ],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 1000,
      },
      submittedAt: {
        type: Date,
      },
    },
    rewardGiven: {
      type: Boolean,
      default: false,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    voiceNoteUrl: {
      type: String,
      default: "",
    },
    mlPrediction: {
      category: { type: String, default: "" },
      confidence: { type: Number, default: 0 },
      department: { type: String, default: "" },
      urgencyScore: { type: Number, default: 0 },
      isDuplicate: { type: Boolean, default: false },
      similarComplaintId: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries and sorting
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ zone: 1, status: 1 });
complaintSchema.index({ userId: 1, createdAt: -1 });
complaintSchema.index({ type: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);

const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Pending",
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
  ref: "User"
},


    location: {
      address: {
        type: String,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
      timestamp: {
        type: String,
      },
    },

    /* ================= NEW FEATURES ================= */

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
        },
        updatedAt: {
          type: Date,
          default: Date.now,
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
      },
      submittedAt: {
        type: Date,
      },
    },

    rewardGiven: {
      type: Boolean,
      default: false,
    },

    /* ================================================= */
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);

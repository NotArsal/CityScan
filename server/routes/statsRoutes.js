const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

// ================= OVERVIEW STATS =================
router.get("/overview", async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 };
    const resolutionRate = result.total > 0 ? Math.round((result.resolved / result.total) * 100) : 0;

    res.json({
      total: result.total,
      pending: result.pending,
      inProgress: result.inProgress,
      resolved: result.resolved,
      rejected: result.rejected,
      resolutionRate,
    });
  } catch (error) {
    console.error("Overview Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= BY ZONE STATS =================
router.get("/by-zone", async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: "$zone",
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          zone: "$_id",
          total: 1,
          resolved: 1,
          pending: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("By Zone Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= BY TYPE STATS =================
router.get("/by-type", async (req, res) => {
  try {
    const totalCount = await Complaint.countDocuments();
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
          percentage: {
            $cond: [
              { $gt: [totalCount, 0] },
              { $round: [{ $multiply: [{ $divide: ["$count", totalCount] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("By Type Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= BY DEPARTMENT RESOLUTION RATE =================
router.get("/by-department", async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: "$department",
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          total: 1,
          resolved: 1,
          rate: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$resolved", "$total"] }, 100] }, 0] },
              0,
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("By Department Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= TRENDS (12 WEEKS) =================
router.get("/trends", async (req, res) => {
  try {
    // Lookback 12 weeks
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);

    const stats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          week: { $concat: ["Wk ", { $toString: "$_id.week" }, " (", { $toString: "$_id.year" }, ")"] },
          submitted: 1,
          resolved: 1,
          sortingKey: { $add: [{ $multiply: ["$_id.year", 100] }, "$_id.week"] },
        },
      },
      { $sort: { sortingKey: 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Trends Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================= HEATMAP LOCATIONS =================
router.get("/heatmap", async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $match: {
          "location.latitude": { $exists: true, $ne: null },
          "location.longitude": { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$complaintId",
          title: 1,
          type: 1,
          status: 1,
          latitude: "$location.latitude",
          longitude: "$location.longitude",
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Heatmap Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// Reverse Geocoding Route
router.get("/reverse", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and Longitude required" });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "PublicEyeApp"
        }
      }
    );

    const data = await response.json();

    res.json({
      address: data.display_name || "Address not found"
    });

  } catch (error) {
    console.error("Reverse Geocoding Error:", error);
    res.status(500).json({ message: "Failed to fetch address" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const NodeCache = require("node-cache");

// Cache geocoding requests for 24 hours (86400 seconds)
const geocodeCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// Reverse Geocoding Route
router.get("/reverse", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and Longitude required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: "Invalid latitude. Must be between -90 and 90." });
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: "Invalid longitude. Must be between -180 and 180." });
    }

    // Round coordinates to 5 decimal places (~1.1 meter accuracy) for caching
    const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
    const cachedAddress = geocodeCache.get(cacheKey);

    if (cachedAddress) {
      return res.json({ address: cachedAddress, cached: true });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "User-Agent": "CityScanApp/1.0 (local development)"
        }
      }
    );

    const data = await response.json();
    const address = data.display_name || "Address not found";

    // Store in cache
    geocodeCache.set(cacheKey, address);

    res.json({ address, cached: false });

  } catch (error) {
    console.error("Reverse Geocoding Error:", error);
    res.status(500).json({ message: "Failed to fetch address" });
  }
});

module.exports = router;

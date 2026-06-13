const { Blob } = require("buffer");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * Classify a complaint image by sending it to the FastAPI microservice.
 * @param {Buffer} imageBuffer File buffer
 * @param {string} mimeType Mime type (e.g. image/jpeg)
 * @param {string} filename Original filename
 * @returns {Promise<{category: string, confidence: number}>}
 */
async function classifyImage(imageBuffer, mimeType, filename) {
  try {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append("file", blob, filename);

    const res = await fetch(`${ML_SERVICE_URL}/predict/image`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`ML classification failed: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("ML classifyImage Error:", error.message);
    throw error;
  }
}

/**
 * Analyze complaint text for urgency and duplicate detection.
 * @param {string} text Description of the complaint
 * @param {string} zone Zone identifier
 * @param {Array} existingComplaints Array of {id, text} complaints in same zone
 * @returns {Promise<{urgencyScore: number, urgencyKeywords: string[], isDuplicate: boolean, similarComplaintId: string, similarity: number}>}
 */
async function analyzeText(text, zone, existingComplaints = []) {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/predict/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, zone, existingComplaints }),
    });

    if (!res.ok) {
      throw new Error(`ML text analysis failed: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("ML analyzeText Error:", error.message);
    throw error;
  }
}

module.exports = {
  classifyImage,
  analyzeText,
};

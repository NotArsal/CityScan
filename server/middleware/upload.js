const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "images") {
      cb(null, path.join(__dirname, "../uploads/images"));
    } else if (file.fieldname === "voiceNote") {
      cb(null, path.join(__dirname, "../uploads/voice"));
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },
  filename: (req, file, cb) => {
    // Generate: {uuid}-{timestamp}.{ext}
    const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "images") {
    // Images: jpeg, jpg, png, webp
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
    }
  } else if (file.fieldname === "voiceNote") {
    // Voice notes: webm, mp3, wav, m4a, mp4, ogg, 3gp
    const allowedTypes = /webm|mp3|wav|m4a|mp4|ogg|3gp|octet-stream/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()) || file.originalname === "blob";
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname || mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Only audio files (webm, mp3, wav, m4a, mp4, ogg) are allowed"));
    }
  }
  cb(new Error("Unknown field name"), false);
};

// Multer upload config
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: (req, file, cb) => {
      if (file.fieldname === "images") {
        return 10 * 1024 * 1024; // 10MB limit for images
      }
      if (file.fieldname === "voiceNote") {
        return 25 * 1024 * 1024; // 25MB limit for voice notes
      }
      return 1024 * 1024;
    }
  }
});

module.exports = upload;

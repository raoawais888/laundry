const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary-v2");
const cloudinary = require("../config/Cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "doorlaundry/orders",
    resource_type: "image",
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 8,                  // matches the frontend's photos.slice(0, 8) cap
  },
});

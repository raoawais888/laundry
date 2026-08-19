const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary-v2");
const cloudinary = require("../config/Cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        // Groups uploads by field name (avatar, licenseFront, selfie, ...)
        // so the Cloudinary dashboard mirrors what each file actually is.
        folder: (req, file) => `doorlaundry/${file.fieldname}`,
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
        fileSize: 5 * 1024 * 1024, //5MB
    },
});

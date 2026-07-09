const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true, unique: true, index: true },

    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "car", "van", "pickup"],
      required: true,
    },
    registrationNumber: { type: String, trim: true, required: true },

    insuranceFront: { type: String },
    insuranceBack: { type: String },

    vehiclePhotos: [{ type: String }], // array of image URLs

    status: {
      type: String,
      enum: ["in_review", "passed", "rejected"],
      default: "in_review",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
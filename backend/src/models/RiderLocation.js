const mongoose = require("mongoose");

// Live GPS crumb trail — TTL index auto-deletes records after 24 hours
const riderLocationSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    speed: Number,    // km/h
    heading: Number,  // degrees 0-360
    accuracy: Number, // meters

    recordedAt: { type: Date, default: Date.now, index: true },

    // Auto-purge after 24 hours
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: false }
);

riderLocationSchema.index({ location: "2dsphere" });
riderLocationSchema.index({ rider: 1, recordedAt: -1 });

module.exports = mongoose.model("RiderLocation", riderLocationSchema);
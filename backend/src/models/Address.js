// models/Address.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    unitNumber:          { type: String },
    streetAddress:       { type: String, required: true },
    suburb:              { type: String, required: true },
    state:               { type: String, required: true },
    postcode:            { type: String, required: true },
    deliveryInstruction: { type: String },
    gpsLocation: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ gpsLocation: "2dsphere" });
addressSchema.index({ user: 1, isDefault: 1 });

module.exports = mongoose.model("Address", addressSchema);
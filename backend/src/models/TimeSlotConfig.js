const mongoose = require("mongoose");

const timeSlotConfigSchema = new mongoose.Schema(
  {
    slotType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
      index: true,
    },
    label: { type: String, required: true },    // "Morning (9 AM – 11 AM)"
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "11:00"
    daysAvailable: [
      {
        type: Number,
        min: 0,
        max: 6, // 0=Sun, 1=Mon ... 6=Sat
      },
    ],
    maxBookings: { type: Number, default: 50 }, // capacity per day per slot
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeSlotConfig", timeSlotConfigSchema);
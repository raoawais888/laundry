const mongoose = require("mongoose");

const pricingRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["surge", "holiday", "express_premium", "distance_fee", "weight_fee"],
      required: true,
      index: true,
    },

    // When does this rule apply?
    appliesOn: {
      dates: [Date],         // specific holiday dates
      daysOfWeek: [Number],  // 0=Sun … 6=Sat
      startTime: String,     // "18:00"
      endTime: String,       // "22:00"
    },

    // How much extra?
    multiplier: { type: Number, default: 1 },   // 1.5 = 50% surge on top
    flatAmount: { type: Number, default: 0 },    // fixed extra PKR amount
    percentage: { type: Number, default: 0 },    // alternative % increase

    appliesTo: {
      type: String,
      enum: ["all", "delivery_fee", "service_price"],
      default: "all",
    },

    priority: { type: Number, default: 0 }, // higher = evaluated first
    isActive: { type: Boolean, default: true, index: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingRule", pricingRuleSchema);
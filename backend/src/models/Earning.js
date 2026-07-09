const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    orderNumber: { type: String },

    amount: { type: Number, required: true },
    type: { type: String, enum: ["delivery", "incentive"], default: "delivery" },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    payoutRequestedAt: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Earning", earningSchema);
const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },

    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", index: true },
    riderAssignedAt: { type: Date },

    pickupAddress: { /* your existing shape */ type: Object },
    deliveryAddress: { type: Object },
    pickupSlot: { type: Object },
    deliverySlot: { type: Object },
    items: { type: Array },

    estimatedWeight: Number,
    numberOfBags: Number,
    isFragile: Boolean,
    specialInstructions: String,
    isExpress: Boolean,
    paymentMethod: String,
    pricing: { type: Object },
    photos: { type: Array },

    // Pickup OTP the customer shows the rider
    pickupOtp: { type: String },

    // The rider payout for this job (shown as the $120 badge)
    payout: { type: Number, default: 0 },
    distanceKm: { type: Number },

    status: {
      type: String,
      enum: [
        "pending",
        "available",
        "accepted",
        "picked_up",
        "dropped_off",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // rider flow sub-docs
    pickup: { type: Object },
    dropoff: { type: Object },
    delivery: { type: Object },

    autoCancelAt: Date,

    isDeleted: { type: Boolean, default: false },
    isReviewed: { type: Boolean, default: false },
    cancellationReason: { type: String },
    cancelledBy: { type: String },
    cancelledAt: { type: Date },
    estimatedWeightKg: { type: Number },
  },
  { timestamps: true }
);

// Auto-generate orderNumber + a pickup OTP before saving
orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    this.orderNumber = `LM-${Date.now().toString().slice(-5)}`;
  }
  if (!this.pickupOtp) {
    this.pickupOtp = Math.floor(100000 + Math.random() * 900000).toString();
  }
});

module.exports = mongoose.model("Order", orderSchema);
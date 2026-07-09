const mongoose = require("mongoose");

const riderorderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },

    customer: {
      name: { type: String, required: true },
      phone: { type: String },
      avatar: { type: String },
      address: { type: String, required: true },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", index: true },

    serviceType: { type: String, default: "Wash & Fold" },
    estimatedWeightKg: { type: Number },
    distanceKm: { type: Number },
    payout: { type: Number, required: true },

    // Pickup OTP the customer shows the rider (Image 5)
    pickupOtp: { type: String },

    status: {
      type: String,
      enum: [
        "available",   // shown in Available Pickups
        "accepted",    // rider accepted
        "picked_up",   // Confirm Pickup done
        "dropped_off", // Laundry Drop-off done
        "delivered",   // Confirm Delivery done
        "cancelled",
      ],
      default: "available",
      index: true,
    },

    // Pickup details (Image 5)
    pickup: {
      photos: [{ type: String }],
      bags: { type: Number },
      isFragile: { type: Boolean, default: false },
      instructions: { type: String },
      confirmedAt: { type: Date },
    },

    // Drop-off at laundry hub (Image 4)
    dropoff: {
      centerName: { type: String, default: "Lume Laundry Hub" },
      centerAddress: { type: String, default: "2 Industrial Ave, Werribee" },
      photo: { type: String },
      confirmedAt: { type: Date },
    },

    // Delivery back to customer (Image 3)
    delivery: {
      signature: { type: String }, // base64 or image URL
      photo: { type: String },
      confirmedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RiderOrder", orderSchema);
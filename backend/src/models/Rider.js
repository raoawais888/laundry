const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["motorcycle", "bicycle", "car", "van"],
      required: true,
    },
    make: String,
    model: String,
    year: Number,
    plateNumber: { type: String, uppercase: true },
    color: String,
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cnic", "license", "vehicle_registration", "insurance", "selfie"],
    },
    url: String,
    publicId: String, // Cloudinary
    verifiedAt: Date,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: String,
  },
  { _id: false }
);

const riderSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, lowercase: true, sparse: true },
    avatar: {
      url: String,
      publicId: String,
    },
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },

    // ── Vehicle ───────────────────────────────────────────────────────────────
    vehicle: vehicleSchema,

    // ── Documents ────────────────────────────────────────────────────────────
    documents: [documentSchema],
    isDocumentVerified: { type: Boolean, default: false },

    // ── Auth ─────────────────────────────────────────────────────────────────
    isPhoneVerified: { type: Boolean, default: false },
    refreshTokens: [
      {
        token: String,
        deviceId: String,
        expiresAt: Date,
      },
    ],
    fcmToken: String,

    // ── Live State ────────────────────────────────────────────────────────────
    isOnline: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: false, index: true }, // not on an active order
    socketId: { type: String, default: null },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    lastLocationAt: Date,
    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    // ── Performance ───────────────────────────────────────────────────────────
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },

    // ── Financials ────────────────────────────────────────────────────────────
    walletBalance: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "blocked", "inactive"],
      default: "pending",
      index: true,
    },
    isDeleted: { type: Boolean, default: false },

    // ── Stripe ────────────────────────────────────────────────────────────────
    stripeAccountId: String, // for payouts
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
riderSchema.index({ currentLocation: "2dsphere" });
riderSchema.index({ isOnline: 1, isAvailable: 1, status: 1 });
riderSchema.index({ status: 1, isDeleted: 1 });

// ── Virtual ───────────────────────────────────────────────────────────────────
riderSchema.virtual("completionRate").get(function () {
  const total = this.completedOrders + this.cancelledOrders;
  return total === 0 ? 100 : Math.round((this.completedOrders / total) * 100);
});

module.exports = mongoose.model("Rider", riderSchema);
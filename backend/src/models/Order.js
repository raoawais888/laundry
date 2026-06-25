const mongoose = require("mongoose");

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const timeSlotSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    slotStart: { type: String, required: true }, // "09:00"
    slotEnd: { type: String, required: true },   // "11:00"
    slotLabel: String,                           // "Morning (9 AM - 11 AM)"
  },
  { _id: false }
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    fullAddress: String,
    apartment: String,
    area: String,
    city: String,
    landmark: String,
    deliveryInstructions: String,
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number], // [lng, lat]
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceName: String,    // snapshot at order time
    category: String,
    unit: String,           // per_kg / per_piece etc.
    unitPrice: Number,
    estimatedQty: Number,   // customer estimate
    actualQty: Number,      // filled by laundry after pickup
    estimatedPrice: Number,
    actualPrice: Number,
    isExpress: { type: Boolean, default: false },
    notes: String,
  },
  { _id: false }
);

const pricingBreakdownSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    expressFee: { type: Number, default: 0 },
    surgeFee: { type: Number, default: 0 },
    holidayFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    walletDeduction: { type: Number, default: 0 },
    rewardPointsUsed: { type: Number, default: 0 },
    rewardPointsValue: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    estimatedTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, refPath: "changedByModel" },
    changedByModel: { type: String, enum: ["User", "Rider", "Admin"] },
    note: String,
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: [Number],
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const photoSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String, // Cloudinary
    uploadedBy: { type: String, enum: ["customer", "rider", "laundry"] },
    uploadedAt: { type: Date, default: Date.now },
    caption: String,
  },
  { _id: false }
);

// ── Main Order Schema ──────────────────────────────────────────────────────────

const orderSchema = new mongoose.Schema(
  {
    // ── Reference Numbers ──────────────────────────────────────────────────────
    orderNumber: {
      type: String,
      unique: true,
      index: true,
      uppercase: true,
    }, // e.g. LUM-2024-00001

    // ── Parties ───────────────────────────────────────────────────────────────
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
      index: true,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    // ── Addresses ─────────────────────────────────────────────────────────────
    pickupAddress: { type: addressSnapshotSchema, required: true },
    deliveryAddress: { type: addressSnapshotSchema, required: true },

    // ── Schedule ──────────────────────────────────────────────────────────────
    pickupSlot: { type: timeSlotSchema, required: true },
    deliverySlot: { type: timeSlotSchema, required: true },

    // Actual times recorded
    actualPickupAt: Date,
    actualDeliveredAt: Date,
    processingStartedAt: Date,
    processingCompletedAt: Date,

    // ── Items / Services ──────────────────────────────────────────────────────
    items: [orderItemSchema],

    // ── Physical Details ──────────────────────────────────────────────────────
    estimatedWeight: { type: Number, min: 0 }, // kg
    actualWeight: { type: Number, min: 0 },
    numberOfBags: { type: Number, min: 1, default: 1 },
    isFragile: { type: Boolean, default: false },
    specialInstructions: { type: String, maxlength: 1000 },

    // ── Media ─────────────────────────────────────────────────────────────────
    photos: [photoSchema],

    // ── Pricing ───────────────────────────────────────────────────────────────
    pricing: { type: pricingBreakdownSchema, default: () => ({}) },
    isExpress: { type: Boolean, default: false },
    isSurge: { type: Boolean, default: false },

    // ── Coupon ────────────────────────────────────────────────────────────────
    coupon: {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
      code: String,
      discountType: { type: String, enum: ["percentage", "fixed"] },
      discountValue: Number,
      discountAmount: Number,
    },

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["cash", "wallet", "card", "paypal", "apple_pay", "google_pay", "mixed"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial", "refunded", "failed"],
      default: "pending",
      index: true,
    },
    paymentRef: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rider_assigned",
        "rider_arriving",
        "picked_up",
        "laundry_processing",
        "washing",
        "drying",
        "ironing",
        "quality_check",
        "packed",
        "out_for_delivery",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    statusHistory: [statusHistorySchema],

    // ── Cancellation ─────────────────────────────────────────────────────────
    cancellationReason: String,
    cancelledBy: { type: String, enum: ["customer", "rider", "admin", "system"] },
    cancelledAt: Date,
    refundAmount: { type: Number, default: 0 },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },

    // ── Rider Earnings ────────────────────────────────────────────────────────
    riderEarnings: { type: Number, default: 0 },
    adminCommission: { type: Number, default: 0 },
    commissionPercent: { type: Number, default: 10 },

    // ── Loyalty ───────────────────────────────────────────────────────────────
    rewardPointsEarned: { type: Number, default: 0 },

    // ── Auto-cancel timer ────────────────────────────────────────────────────
    autoCancelAt: Date, // set when pending, cron checks this

    // ── Rating ────────────────────────────────────────────────────────────────
    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
    isReviewed: { type: Boolean, default: false },

    // ── Soft delete ───────────────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ customer: 1, status: 1, createdAt: -1 });
orderSchema.index({ rider: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "pickupSlot.date": 1, status: 1 });
orderSchema.index({ autoCancelAt: 1, status: 1 }); // for cron
orderSchema.index({ pickupAddress: "2dsphere" });
orderSchema.index({ deliveryAddress: "2dsphere" });

// ── Order Number Auto-generation ──────────────────────────────────────────────
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `LUM-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  // Push to history on status change
  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

// ── Virtuals ──────────────────────────────────────────────────────────────────
orderSchema.virtual("isRatable").get(function () {
  return this.status === "completed" && !this.isReviewed;
});

orderSchema.virtual("finalTotal").get(function () {
  return this.pricing?.total || this.pricing?.estimatedTotal || 0;
});

module.exports = mongoose.model("Order", orderSchema);
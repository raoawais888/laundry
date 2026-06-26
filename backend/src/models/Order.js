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
// paymentStatus already has index: true on the field above — no need to redeclare it here.
orderSchema.index({ "pickupSlot.date": 1, status: 1 });
orderSchema.index({ autoCancelAt: 1, status: 1 }); // for cron
// 2dsphere indexes must target the actual GeoJSON field, not the parent
// address object — indexing "pickupAddress" itself would fail when Mongo
// tries to build the index, since it expects a { type, coordinates } shape.
orderSchema.index({ "pickupAddress.location": "2dsphere" });
orderSchema.index({ "deliveryAddress.location": "2dsphere" });

// ── Geo Coordinate Cleanup ─────────────────────────────────────────────────────
//
// addressSnapshotSchema declares a nested `location: { type, coordinates }`
// path. Mongoose always materializes that whole sub-object the moment
// pickupAddress/deliveryAddress exists — even when nobody ever supplies
// location data — because `coordinates` is an array field, and array fields
// default to `[]` rather than staying undefined. The result is a document
// shaped like `location: { coordinates: [] }`, which looks "present" to
// MongoDB but isn't valid GeoJSON (a Point needs exactly 2 numbers).
//
// MongoDB's 2dsphere index silently skips documents where the indexed field
// is genuinely missing, null, or an empty array — but `{ coordinates: [] }`
// is none of those from Mongo's point of view; it's a malformed Point, and
// inserting it throws "Can't extract geo keys" / "unknown GeoJSON type"
// instead of being skipped. So the fix has to happen before the document
// reaches Mongo: strip `location` entirely on any address that doesn't have
// two real numbers in `coordinates`, so the field is truly absent rather
// than present-but-broken.
function hasValidPointCoordinates(location) {
  return (
    !!location &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    location.coordinates.every((n) => typeof n === "number" && !Number.isNaN(n))
  );
}

// ── Order Number Auto-generation ──────────────────────────────────────────────
//
// NOTE: countDocuments()-based numbering has a race condition under concurrent
// writes (two orders saved at once can read the same count and collide on the
// unique index). We retry on duplicate-key error instead of trusting the count
// to be correct, which keeps it simple without adding a separate counters
// collection. If you expect heavy concurrent order creation, switch this to an
// atomic counter document with findOneAndUpdate({ $inc: { seq: 1 } }).
orderSchema.pre("save", async function () {
  // ── Order number ──────────────────────────────────────────────────────
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `LUM-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  // ── Status history ────────────────────────────────────────────────────
  // this.isNew covers first-time creation: isModified("status") is false
  // on a brand-new document when status was never explicitly passed in
  // (it only got there via the schema's `default: "pending"`, which
  // Mongoose doesn't count as a modification) — so without this.isNew,
  // the very first status entry would silently never get logged.
  if (this.isNew || this.isModified("status")) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }

  // ── Geo coordinate cleanup ─────────────────────────────────────────────
  // Must run AFTER the statusHistory.push() above, not before — a freshly
  // pushed entry has no location set, and Mongoose still materializes
  // `location: { coordinates: [] }` on it the same way it does for
  // pickupAddress/deliveryAddress (see comment above hasValidPointCoordinates).
  // Cleaning up before the push would miss this exact entry.
  for (const field of ["pickupAddress", "deliveryAddress"]) {
    const addr = this[field];
    if (addr && !hasValidPointCoordinates(addr.location)) {
      addr.location = undefined;
    }
  }
  for (const entry of this.statusHistory) {
    if (entry && !hasValidPointCoordinates(entry.location)) {
      entry.location = undefined;
    }
  }

  // No next() here — an async pre-hook in modern Mongoose (7+/8+) is
  // promise-based: Mongoose awaits the returned promise instead of passing
  // a real `next` callback into the function. Calling next() in an async
  // hook throws "next is not a function" because next is undefined here.
  // Throwing (or letting countDocuments() reject) is how you signal an
  // error instead of calling next(err).
});

// ── Virtuals ──────────────────────────────────────────────────────────────────
orderSchema.virtual("isRatable").get(function () {
  return this.status === "completed" && !this.isReviewed;
});

orderSchema.virtual("finalTotal").get(function () {
  return this.pricing?.total || this.pricing?.estimatedTotal || 0;
});

module.exports = mongoose.model("Order", orderSchema);
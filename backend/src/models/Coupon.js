const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: String,

    // ── Discount ──────────────────────────────────────────────────────────────
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null }, // cap for percentage
    minimumOrderAmount: { type: Number, default: 0 },

    // ── Applicability ─────────────────────────────────────────────────────────
    applicableServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    // empty = all services

    // ── Validity ──────────────────────────────────────────────────────────────
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true, index: true },

    // ── Usage Limits ──────────────────────────────────────────────────────────
    totalUsageLimit: { type: Number, default: null },   // null = unlimited
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },

    // ── Restrictions ─────────────────────────────────────────────────────────
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // empty = all users
    firstOrderOnly: { type: Boolean, default: false },
    newUserOnly: { type: Boolean, default: false },

    // ── Status ────────────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false },

    // ── Type classification ───────────────────────────────────────────────────
    type: {
      type: String,
      enum: ["promotional", "referral", "loyalty", "seasonal", "partner"],
      default: "promotional",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, expiryDate: 1 });

// ── Methods ───────────────────────────────────────────────────────────────────
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    !this.isDeleted &&
    now >= this.startDate &&
    now <= this.expiryDate &&
    (this.totalUsageLimit === null || this.usedCount < this.totalUsageLimit)
  );
};

couponSchema.methods.calculateDiscount = function (orderAmount) {
  if (orderAmount < this.minimumOrderAmount) return 0;
  let discount = 0;
  if (this.discountType === "percentage") {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else {
    discount = Math.min(this.discountValue, orderAmount);
  }
  return Math.round(discount * 100) / 100;
};

module.exports = mongoose.model("Coupon", couponSchema);
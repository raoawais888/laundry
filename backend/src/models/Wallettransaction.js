const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    // ── Owner ─────────────────────────────────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "ownerModel",
      index: true,
    },
    ownerModel: {
      type: String,
      enum: ["User", "Rider"],
      required: true,
    },

    // ── Transaction ───────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "credit",
        "debit",
        "refund",
        "bonus",
        "referral_reward",
        "order_payment",
        "withdrawal",
        "admin_adjustment",
        "rider_earning",
        "commission",
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },

    // ── Balance snapshot ──────────────────────────────────────────────────────
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },

    // ── References ────────────────────────────────────────────────────────────
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ── Description ───────────────────────────────────────────────────────────
    description: { type: String, required: true },
    note: String, // admin note

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"],
      default: "completed",
      index: true,
    },
    failureReason: String,

    // ── Source ────────────────────────────────────────────────────────────────
    source: {
      type: String,
      enum: ["order", "referral", "promotion", "admin", "withdrawal", "refund", "system"],
    },

    // ── Idempotency ────────────────────────────────────────────────────────────
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ owner: 1, ownerModel: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1, status: 1 });
walletTransactionSchema.index({ order: 1 });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
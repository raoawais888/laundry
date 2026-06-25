const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────────────────────────────
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Gateway ───────────────────────────────────────────────────────────────
    gateway: {
      type: String,
      enum: ["stripe", "paypal", "apple_pay", "google_pay", "paystack", "cash", "wallet"],
      required: true,
    },
    gatewayPaymentId: { type: String, index: true, sparse: true }, // Stripe PaymentIntent ID etc.
    gatewayOrderId: String,   // PayPal order ID
    gatewayCustomerId: String,
    savedCardId: { type: mongoose.Schema.Types.ObjectId, ref: "SavedCard" },

    // ── Amount ────────────────────────────────────────────────────────────────
    currency: { type: String, default: "PKR", uppercase: true },
    amount: { type: Number, required: true, min: 0 },
    walletAmount: { type: Number, default: 0 },   // portion paid from wallet
    gatewayAmount: { type: Number, default: 0 },  // portion paid via gateway

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "initiated",
        "pending",
        "processing",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      default: "initiated",
      index: true,
    },

    // ── Refund ────────────────────────────────────────────────────────────────
    refundAmount: { type: Number, default: 0 },
    refundReason: String,
    refundedAt: Date,
    gatewayRefundId: String,

    // ── Raw gateway response (never expose to client) ─────────────────────────
    gatewayResponse: { type: mongoose.Schema.Types.Mixed, select: false },
    webhookEvents: [
      {
        eventId: String,
        eventType: String,
        receivedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Metadata ─────────────────────────────────────────────────────────────
    description: String,
    failureReason: String,
    paidAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ gateway: 1, status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
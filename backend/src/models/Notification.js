const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // ── Recipient ─────────────────────────────────────────────────────────────
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
      index: true,
    },
    recipientModel: {
      type: String,
      enum: ["User", "Rider", "Admin"],
      required: true,
    },

    // ── Content ───────────────────────────────────────────────────────────────
    title: { type: String, required: true },
    body: { type: String, required: true },
    imageUrl: String,

    // ── Classification ────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "order_placed",
        "order_accepted",
        "rider_assigned",
        "rider_arriving",
        "order_picked_up",
        "order_processing",
        "order_out_for_delivery",
        "order_delivered",
        "order_cancelled",
        "payment_success",
        "payment_failed",
        "refund_processed",
        "wallet_credited",
        "wallet_debited",
        "otp",
        "promotion",
        "referral_reward",
        "review_reminder",
        "system",
      ],
      required: true,
      index: true,
    },

    // ── Deep Link Data ────────────────────────────────────────────────────────
    data: {
      screen: String,    // e.g. "OrderDetail"
      orderId: String,
      actionUrl: String,
      extra: mongoose.Schema.Types.Mixed,
    },

    // ── State ─────────────────────────────────────────────────────────────────
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    isSent: { type: Boolean, default: false }, // Firebase delivered
    sentAt: Date,
    failedReason: String,

    // ── Channel ───────────────────────────────────────────────────────────────
    channels: [{ type: String, enum: ["push", "in_app", "sms", "email"] }],

    // ── Expiry ────────────────────────────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, recipientModel: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
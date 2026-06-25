const mongoose = require("mongoose");

// NEVER stores raw card numbers — only tokenized gateway references
const savedCardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ["stripe", "paypal"],
      required: true,
    },

    // Tokenized references only (safe to store)
    gatewayToken: { type: String, required: true }, // Stripe PaymentMethod ID
    gatewayCustomerId: String,                       // Stripe Customer ID

    // Display info only — received from gateway, not entered by user
    cardType: {
      type: String,
      enum: ["visa", "mastercard", "amex", "discover", "paypal", "apple_pay", "google_pay", "other"],
    },
    last4: String,
    expiryMonth: String,
    expiryYear: String,
    cardholderName: String,
    fingerprint: String, // detect duplicate cards

    isDefault: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

savedCardSchema.index({ user: 1, isActive: 1 });

// Ensure only one default card per user
savedCardSchema.pre("save", async function (next) {
  if (this.isDefault && this.isModified("isDefault")) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model("SavedCard", savedCardSchema);
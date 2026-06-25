const mongoose = require("mongoose");

// Stores revoked JWT tokens until they naturally expire
// TTL index auto-purges them so the collection stays lean
const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["logout", "password_change", "admin_revoke", "suspicious"],
      default: "logout",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // auto-purge when JWT would have expired anyway
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlacklistedToken", blacklistedTokenSchema);
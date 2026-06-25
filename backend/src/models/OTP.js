const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    type: {
      type: String,
      enum: ["login", "verify_phone", "forgot_device"],
      default: "login",
    },
    attempts: { type: Number, default: 0, max: 5 },
    isUsed: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL — auto-deletes expired OTPs
    },
    ipAddress: String,
    deviceId: String,
  },
  { timestamps: true }
);

otpSchema.index({ phone: 1, type: 1 });

otpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

otpSchema.methods.isMaxAttemptsReached = function () {
  return this.attempts >= 5;
};

module.exports = mongoose.model("OTP", otpSchema);
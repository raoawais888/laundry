const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    phone: String,
    avatar: { url: String, publicId: String },

    role: {
      type: String,
      enum: ["super_admin", "admin", "manager", "support", "finance"],
      default: "support",
      index: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_riders",
          "manage_orders",
          "manage_services",
          "manage_coupons",
          "manage_payments",
          "manage_wallet",
          "view_reports",
          "manage_notifications",
          "manage_admins",
        ],
      },
    ],

    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: Date,
    fcmToken: String,
    refreshTokens: [
      {
        token: String,
        deviceId: String,
        expiresAt: Date,
      },
    ],

    resetCode: { type: String, select: false },
    resetCodeExpires: { type: Date, select: false },
    resetCodeAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

adminSchema.methods.hasPermission = function (perm) {
  return this.role === "super_admin" || this.permissions.includes(perm);
};

adminSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    avatar: this.avatar,
    role: this.role,
    permissions: this.permissions,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
  };
};

module.exports = mongoose.model("Admin", adminSchema);
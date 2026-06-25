const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema(
  {
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    wallet: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
  },
  { _id: false }
);

const membershipSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      default: "free",
    },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },

    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    isGuest: {
      type: Boolean,
      default: false,
    },

    refreshTokens: [
      {
        token: String,
        deviceId: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
      },
    ],

    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSpending: {
      type: Number,
      default: 0,
    },

    orderCount: {
      type: Number,
      default: 0,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    referralEarnings: {
      type: Number,
      default: 0,
    },

    referralCount: {
      type: Number,
      default: 0,
    },

    preferredPaymentMethod: {
      type: String,
      enum: [
        "cash",
        "wallet",
        "card",
        "paypal",
        "apple_pay",
        "google_pay",
      ],
      default: "cash",
    },

    notificationSettings: {
      type: notificationSettingsSchema,
      default: () => ({}),
    },

    language: {
      type: String,
      enum: ["en", "ar", "fr", "ur"],
      default: "en",
    },

    fcmToken: {
      type: String,
      default: null,
    },

    membership: {
      type: membershipSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ["active", "blocked", "suspended"],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    stripeCustomerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.virtual("addresses", {
  ref: "Address",
  localField: "_id",
  foreignField: "user",
});

userSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "customer",
});

userSchema.index({
  status: 1,
  isDeleted: 1,
});

userSchema.index({
  createdAt: -1,
});

// Modern pre-save hook (no next())
userSchema.pre("save", function () {
  if (!this.referralCode) {
    this.referralCode =
      "LUME" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();

  delete obj.refreshTokens;
  delete obj.stripeCustomerId;
  delete obj.fcmToken;

  return obj;
};

userSchema.methods.creditWallet = async function (amount, session) {
  this.walletBalance += amount;
  return session ? this.save({ session }) : this.save();
};

userSchema.methods.debitWallet = async function (amount, session) {
  if (this.walletBalance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  this.walletBalance -= amount;

  return session ? this.save({ session }) : this.save();
};

module.exports = mongoose.model("User", userSchema);
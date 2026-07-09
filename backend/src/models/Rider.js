const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },

    // Profile Setup (Image 12)
    fullLegalName: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: { type: Date },
    email: { type: String, trim: true, lowercase: true, index: true },
    address: { type: String, trim: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    emergencyContact: { type: String, trim: true },
    avatar: { type: String },

    // Verification flags (drive the "Approval Pending" screen — Image 7)
    verification: {
      idCheck: {
        status: { type: String, enum: ["not_submitted", "in_review", "passed", "rejected"], default: "not_submitted" },
      },
      policeCheck: {
        status: { type: String, enum: ["not_submitted", "in_review", "passed", "rejected"], default: "not_submitted" },
      },
      vehicleCheck: {
        status: { type: String, enum: ["not_submitted", "in_review", "passed", "rejected"], default: "not_submitted" },
      },
      workRights: {
        status: { type: String, enum: ["not_submitted", "in_review", "passed", "rejected"], default: "not_submitted" },
      },
    },

    // Onboarding progress tracking
    onboardingStep: {
      type: String,
      enum: ["otp_verified", "profile_setup", "id_verification", "work_rights", "police_check", "vehicle_details", "pending_approval", "approved"],
      default: "otp_verified",
    },

    // Overall account status
    accountStatus: {
      type: String,
      enum: ["pending", "approved", "suspended", "rejected"],
      default: "pending",
    },

    // Dashboard state (Image 6)
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },

    isPhoneVerified: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

riderSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Recompute account status from the four verification checks
riderSchema.methods.recomputeStatus = function () {
  const v = this.verification;
  const checks = [v.idCheck, v.policeCheck, v.vehicleCheck, v.workRights];

  if (checks.some((c) => c.status === "rejected")) {
    this.accountStatus = "rejected";
  } else if (checks.every((c) => c.status === "passed")) {
    this.accountStatus = "approved";
    this.onboardingStep = "approved";
  } else {
    this.accountStatus = "pending";
  }
};

module.exports = mongoose.model("Rider", riderSchema);
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// OLD:
// const admin = require("../config/firebaseAdmin");

// NEW:
const { adminAuth } = require("../config/firebaseAdmin.js");
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

// ============================
// POST /api/v1/auth/firebase-login
// Frontend sends the Firebase ID token after successful SMS OTP
// ============================

// POST /api/v1/auth/firebase-login
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken is required" });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const phone = decoded.phone_number;

    if (!phone) {
      return res.status(400).json({ success: false, message: "No phone number in token" });
    }

    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        phone,
        firebaseUid: decoded.uid,
        isPhoneVerified: true,
        isProfileComplete: false,
      });
    } else {
      user.isPhoneVerified = true;
      user.lastLoginAt = new Date();
      if (!user.firebaseUid) user.firebaseUid = decoded.uid;
      await user.save();
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: user.toSafeObject(),
      isNewUser,
      isProfileComplete: user.isProfileComplete,
    });
  } catch (err) {
    console.error("firebaseLogin error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// ============================
// POST /api/v1/auth/setup-profile
// Called only for first-time users after login
// ============================
exports.setupProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const trimmedFirstName = (firstName || "").trim();
    const trimmedLastName = (lastName || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();

    if (!trimmedFirstName || !trimmedLastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const existingUser = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already in use",
      });
    }

    user.firstName = trimmedFirstName;
    user.lastName = trimmedLastName;
    user.name = `${trimmedFirstName} ${trimmedLastName}`;
    user.email = trimmedEmail;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      user.avatar = `/uploads/profile/${req.file.filename}`;
    }

    user.isProfileComplete = true;
    await user.save();

    // NOTE: removed the email-OTP block that was here.
    // Firebase already verified the phone; no second OTP needed after profile setup.

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("setupProfile error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
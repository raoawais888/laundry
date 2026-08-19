const Rider = require("../models/Rider");
const jwt = require("jsonwebtoken");
const { adminAuth } = require("../config/firebaseAdmin");

const generateToken = (id) =>
  jwt.sign({ id, role: "rider" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

// POST /api/v1/rider/auth/firebase-login
// Mirrors the customer flow (auth.controller.js#firebaseLogin): the rider
// app verifies the phone number with Firebase client-side, then hands us
// the resulting ID token to exchange for our own JWT.
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

    let rider = await Rider.findOne({ phone });
    if (!rider) {
      rider = await Rider.create({
        phone,
        firebaseUid: decoded.uid,
        isPhoneVerified: true,
        onboardingStep: "otp_verified",
      });
    } else {
      rider.isPhoneVerified = true;
      rider.lastLoginAt = new Date();
      if (!rider.firebaseUid) rider.firebaseUid = decoded.uid;
      await rider.save();
    }

    const token = generateToken(rider._id);
    return res.json({ success: true, token, rider: rider.toSafeObject() });
  } catch (err) {
    console.error("rider firebaseLogin error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// POST /api/v1/rider/profile/setup  (Image 12)
exports.setupProfile = async (req, res) => {
  try {
    const { fullLegalName, dateOfBirth, email, address, emergencyContact, lat, lng } = req.body;

    const rider = await Rider.findById(req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    const name = (fullLegalName || "").trim();
    if (!name) {
      return res.status(400).json({ success: false, message: "Full legal name is required" });
    }

    const trimmedEmail = (email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    const existing = await Rider.findOne({ email: trimmedEmail, _id: { $ne: rider._id } });
    if (existing) {
      return res.status(409).json({ success: false, message: "This email is already in use" });
    }

    const parts = name.split(" ");
    rider.fullLegalName = name;
    rider.firstName = parts[0];
    rider.lastName = parts.slice(1).join(" ");
    rider.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : rider.dateOfBirth;
    rider.email = trimmedEmail;
    rider.address = (address || "").trim();
    rider.emergencyContact = (emergencyContact || "").trim();
    if (lat && lng) rider.location = { lat, lng };

    rider.onboardingStep = "profile_setup";
    if (req.file) rider.avatar = req.file.path;

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Profile saved",
      rider: rider.toSafeObject(),
    });
  } catch (err) {
    console.error("rider setupProfile error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
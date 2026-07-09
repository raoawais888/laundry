const Rider = require("../models/Rider");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/OTPGenrator");

const OTP_TYPE = "rider_login";

const generateToken = (id) =>
  jwt.sign({ id, role: "rider" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "phone is required" });
    }

    await OTP.deleteMany({ phone, type: OTP_TYPE });

    const otp = generateOTP();

    await OTP.create({
      phone,
      otp,
      type: OTP_TYPE,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      ipAddress: req.ip,
    });

    await sendEmail({
      to: phone,
      subject: "Your Lume Laundry Rider Login OTP",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Lume Laundry — Rider</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="letter-spacing:8px;color:#2563eb">${otp}</h1>
          <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("rider sendOtp error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ phone, type: OTP_TYPE, isUsed: false });
    if (!otpRecord) return res.status(400).json({ success: false, message: "OTP not found" });
    if (otpRecord.isExpired()) return res.status(400).json({ success: false, message: "OTP expired" });
    if (otpRecord.isMaxAttemptsReached()) return res.status(400).json({ success: false, message: "Maximum attempts reached" });

    if (otpRecord.otp !== otp) {
      otpRecord.attempts++;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    let rider = await Rider.findOne({ phone });
    if (!rider) {
      rider = await Rider.create({ phone, isPhoneVerified: true, onboardingStep: "otp_verified" });
    } else {
      rider.isPhoneVerified = true;
      rider.lastLoginAt = new Date();
      await rider.save();
    }

    const token = generateToken(rider._id);
    return res.json({ success: true, token, rider: rider.toSafeObject() });
  } catch (err) {
    console.error("rider verifyOtp error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
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
    if (req.file) rider.avatar = `/uploads/profile/${req.file.filename}`;

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
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const admin = require("../config/firebaseAdmin");
const sendEmail = require("../utils/sendEmail");        // ← add back
const generateOTP = require("../utils/OTPGenrator");    // ← add back


const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });


  // ============================
// POST /api/v1/auth/verify-email
// Body: { code }  — user must be logged in (protect middleware)
// ============================
exports.verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Verification code is required" });
    }

    const user = await User.findById(req.user.id).select(
      "+emailVerifyCode +emailVerifyCodeExpires +emailVerifyAttempts"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.json({ success: true, message: "Email already verified." });
    }

    if (!user.emailVerifyCode) {
      return res.status(400).json({ success: false, message: "No verification in progress. Please request a new code." });
    }

    if (user.emailVerifyCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Code expired. Please request a new one." });
    }

    if (user.emailVerifyAttempts >= 5) {
      return res.status(400).json({ success: false, message: "Too many attempts. Please request a new code." });
    }

    if (user.emailVerifyCode !== code) {
      user.emailVerifyAttempts += 1;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    // Success
    user.isEmailVerified = true;
    user.emailVerifyCode = undefined;
    user.emailVerifyCodeExpires = undefined;
    user.emailVerifyAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully.",
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};



// ============================
// POST /api/v1/auth/resend-email-code
// ============================
exports.resendEmailCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isEmailVerified) {
      return res.json({ success: true, message: "Email already verified." });
    }
    if (!user.email) {
      return res.status(400).json({ success: false, message: "No email on file. Complete your profile first." });
    }

    const code = generateOTP();
    user.emailVerifyCode = code;
    user.emailVerifyCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerifyAttempts = 0;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your new verification code — Lume Laundry",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Lume Laundry</h2>
          <p>Your new verification code is:</p>
          <h1 style="letter-spacing:8px;color:#2563eb">${code}</h1>
          <p>This code expires in <strong>10 minutes</strong>.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "A new code has been sent to your email." });
  } catch (err) {
    console.error("resendEmailCode error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
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

    const decoded = await admin.auth().verifyIdToken(idToken);
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
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const trimmedFirstName = (firstName || "").trim();
    const trimmedLastName = (lastName || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();

    if (!trimmedFirstName || !trimmedLastName) {
      return res.status(400).json({ success: false, message: "First name and last name are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    const existingUser = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: user._id },
    });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "This email is already in use" });
    }

    user.firstName = trimmedFirstName;
    user.lastName = trimmedLastName;
    user.name = `${trimmedFirstName} ${trimmedLastName}`;

    // If the email changed, it must be re-verified
    if (user.email !== trimmedEmail) {
      user.isEmailVerified = false;
    }
    user.email = trimmedEmail;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      user.avatar = `/uploads/profile/${req.file.filename}`;
    }

    user.isProfileComplete = true;

    // ── Generate + send email verification code ──
    const code = generateOTP();
    user.emailVerifyCode = code;
    user.emailVerifyCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.emailVerifyAttempts = 0;

    await user.save();

    await sendEmail({
      to: trimmedEmail,
      subject: "Verify your email — Lume Laundry",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Lume Laundry</h2>
          <p>Please verify your email. Your verification code is:</p>
          <h1 style="letter-spacing:8px;color:#2563eb">${code}</h1>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Profile saved. A verification code has been sent to your email.",
      user: user.toSafeObject(),
      emailVerificationRequired: true,
    });
  } catch (err) {
    console.error("setupProfile error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    }
  );

// ============================
// POST /api/v1/auth/send-otp
// ============================

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "phone is required",
      });
    }

    await OTP.deleteMany({
      phone: phone, // You can rename this field to "identifier" or "email" later
      type: "login",
    });

    const otp = generateOTP();

    await OTP.create({
      phone: phone,
      otp,
      type: "login",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      ipAddress: req.ip,
    });

    await sendEmail({
      to: phone,
      subject: "Your Lume Laundry Login OTP",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Lume Laundry</h2>

          <p>Your One-Time Password (OTP) is:</p>

          <h1 style="letter-spacing:8px;color:#2563eb">
            ${otp}
          </h1>

          <p>This OTP will expire in <strong>5 minutes</strong>.</p>

          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ============================
// POST /api/v1/auth/verify-otp
// ============================
exports.verifyOtp = async (req, res) => {

  try {

    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    const otpRecord = await OTP.findOne({
      phone,
      type: "login",
      isUsed: false,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (otpRecord.isExpired()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (otpRecord.isMaxAttemptsReached()) {
      return res.status(400).json({
        success: false,
        message: "Maximum attempts reached",
      });
    }

    if (otpRecord.otp !== otp) {

      otpRecord.attempts++;

      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

    }

    otpRecord.isUsed = true;

    await otpRecord.save();

    let user = await User.findOne({ phone });

    if (!user) {

      user = await User.create({
        phone,
        isPhoneVerified: true,
      });

    } else {

      user.isPhoneVerified = true;
      user.lastLoginAt = new Date();

      await user.save();

    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

// ============================
// POST /api/v1/auth/setup-profile
// ============================
exports.setupProfile = async (req, res) => {

  try {

    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name;
    user.email = email;
    user.isProfileComplete = true;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toSafeObject(),
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};
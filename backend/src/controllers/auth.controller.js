const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const generateOTP =require("../utils/OTPGenrator");


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

    console.log("Request Body:", req.body);

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

    console.log("OTP Record:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    console.log("Stored OTP:", otpRecord.otp);
    console.log("Entered OTP:", otp);

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

    console.log("OTP Verified");

    let user = await User.findOne({ phone });

    console.log("User:", user);

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
        const { firstName, lastName, email, password } = req.body;
        console.log(req.body);
        console.log(req.user.id);
        // FIX: removed console.log(req.body) — it was logging the plaintext password to server logs

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const trimmedFirstName = (firstName || "").trim();
        const trimmedLastName = (lastName || "").trim();
        const trimmedEmail = (email || "").trim().toLowerCase();

        // FIX: basic required-field validation (previously trusted the client entirely)
        if (!trimmedFirstName || !trimmedLastName) {
            return res.status(400).json({
                success: false,
                message: "First name and last name are required"
            });
        }

        // FIX: validate email format on the backend
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // FIX: prevent saving an email that's already used by a different account
        const existingUser = await User.findOne({
            email: trimmedEmail,
            _id: { $ne: user._id }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This email is already in use"
            });
        }

        user.firstName = trimmedFirstName;
        user.lastName = trimmedLastName;
        user.name = `${trimmedFirstName} ${trimmedLastName}`;
        user.email = trimmedEmail;

        if (password) {
            // FIX: minimum password length check
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters"
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


   await OTP.deleteMany({
      phone: trimmedEmail, // You can rename this field to "identifier" or "email" later
      type: "login",
    });

    const otp = generateOTP();

    await OTP.create({
      phone: trimmedEmail,
      otp,
      type: "login",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      ipAddress: req.ip,
    });

    await sendEmail({
      to: trimmedEmail,
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
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: user.toSafeObject()
        });

    } catch (err) {
        // FIX: log the full error server-side only — never send err.message to the client,
        // since it can leak internal details (DB errors, file paths, stack info)
        console.error("setupProfile error:", err);

        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};
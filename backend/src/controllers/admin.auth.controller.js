const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/OTPGenrator");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

// POST /api/v1/admin/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Blocked/deactivated admins can't log in
    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: "This account has been deactivated." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken(admin._id, admin.role);

    return res.json({
      success: true,
      token,
      admin: admin.toSafeObject(),
    });
  } catch (err) {
    console.error("admin login error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/admin/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

    // Don't reveal whether the email exists
    if (!admin || !admin.isActive) {
      return res.json({ success: true, message: "If that email exists, a reset code has been sent." });
    }

    const code = generateOTP();
    admin.resetCode = code;
    admin.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    admin.resetCodeAttempts = 0;
    await admin.save();

    await sendEmail({
      to: admin.email,
      subject: "Your Lume Admin Password Reset Code",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Lume Laundry — Admin</h2>
          <p>Your password reset code is:</p>
          <h1 style="letter-spacing:8px;color:#2563eb">${code}</h1>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "If that email exists, a reset code has been sent." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/admin/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, code, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() })
      .select("+resetCode +resetCodeExpires +resetCodeAttempts");

    if (!admin || !admin.resetCode) {
      return res.status(400).json({ success: false, message: "No reset request found. Please start again." });
    }
    if (admin.resetCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Reset code has expired. Please request a new one." });
    }
    if (admin.resetCodeAttempts >= 5) {
      return res.status(400).json({ success: false, message: "Too many incorrect attempts. Please request a new code." });
    }
    if (admin.resetCode !== code) {
      admin.resetCodeAttempts += 1;
      await admin.save();
      return res.status(400).json({ success: false, message: "Invalid reset code" });
    }

    admin.password = newPassword; // pre-save hook hashes it
    admin.resetCode = undefined;
    admin.resetCodeExpires = undefined;
    admin.resetCodeAttempts = 0;
    // Optional: invalidate all sessions on password reset
    admin.refreshTokens = [];
    await admin.save();

    return res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/v1/admin/auth/me
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    return res.json({ success: true, admin: admin.toSafeObject() });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// PATCH /api/v1/admin/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ success: false, message: "Name cannot be empty" });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (name !== undefined) admin.name = name.trim();
    if (phone !== undefined) admin.phone = phone.trim();
    await admin.save();

    return res.json({ success: true, message: "Profile updated.", admin: admin.toSafeObject() });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// PATCH /api/v1/admin/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.admin.id).select("+password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    admin.password = newPassword; // pre-save hook hashes it
    // Invalidate other sessions on password change, same as the forgot-password flow
    admin.refreshTokens = [];
    await admin.save();

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const transporter = require("../config/mail");

class AuthController {

  static async sendOtp(req, res) {
    try {
        console.log(req.body);
      const { email } = req.body;

      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const hashedOtp = await bcrypt.hash(otp, 10);

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({ email });
      }

      user.otp = hashedOtp;
      user.otpExpiry = Date.now() + 5 * 60 * 1000;

    //   await user.save();

    //   await transporter.sendMail({
    //     from: process.env.EMAIL_USER,
    //     to: email,
    //     subject: "Your OTP Code",
    //     html: `
    //       <h2>Verify Your Account</h2>
    //       <p>Your OTP is:</p>
    //       <h1>${otp}</h1>
    //       <p>Expires in 5 minutes.</p>
    //     `
    //   });

      return res.json({
        success: true,
        message: otp
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
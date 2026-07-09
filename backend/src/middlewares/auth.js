const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Rider = require("../models/Rider");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load from the correct collection based on the token's role
    let account;
    if (decoded.role === "rider") {
      account = await Rider.findById(decoded.id).select("-password");
    } else {
      account = await User.findById(decoded.id).select("-password");
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Account not found.",
      });
    }

    req.user = account;
    req.role = decoded.role || "user";

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

module.exports = protect;
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Base guard — verifies token + active admin
const adminAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Not authorized as admin" });
    }
    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: "Account deactivated" });
    }

    req.admin = admin; // full document — gives access to hasPermission()
    next();
  } catch (err) {
    console.error("adminAuth error:", err);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

// Optional permission gate — use on specific routes
// e.g. router.get("/users", adminAuth, requirePermission("manage_users"), handler)
const requirePermission = (perm) => (req, res, next) => {
  if (!req.admin.hasPermission(perm)) {
    return res.status(403).json({ success: false, message: "Insufficient permissions" });
  }
  next();
};

module.exports = { adminAuth, requirePermission };
const express = require("express");
const router = express.Router();
const AdminAuth = require("../controllers/admin.auth.controller.js");
const { adminAuth } = require("../middlewares/adminAuth.js");

router.post("/login", AdminAuth.login);
router.post("/forgot-password", AdminAuth.forgotPassword);
router.post("/reset-password", AdminAuth.resetPassword);
router.get("/me", adminAuth, AdminAuth.getMe);

module.exports = router;
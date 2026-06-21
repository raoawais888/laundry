const express = require('express');
const router = express.Router();

const AuthController = require("../controllers/auth.controller.js");

router.post('/send-otp', AuthController.sendOtp);

module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require("../middlewares/upload.js");
const auth = require("../middlewares/auth.js");
const AuthController = require("../controllers/auth.controller.js");

 router.post('/send-otp', AuthController.sendOtp);
 router.post('/verify-otp', AuthController.verifyOtp);
router.post("/setup-profile" ,auth,upload.single("avatar"),AuthController.setupProfile);



module.exports = router;
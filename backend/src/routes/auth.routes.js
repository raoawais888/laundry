const express = require('express');
const router = express.Router();
const upload = require("../middlewares/upload.js");
const auth = require("../middlewares/auth.js");
const AuthController = require("../controllers/auth.controller.js");

router.post("/firebase-login", AuthController.firebaseLogin);
router.post("/setup-profile", auth, upload.single("avatar"), AuthController.setupProfile);
router.post("/verify-email", auth, AuthController.verifyEmail);
router.post("/resend-email-code", auth, AuthController.resendEmailCode);
router.patch("/fcm-token", auth, AuthController.updateFcmToken);

module.exports = router;
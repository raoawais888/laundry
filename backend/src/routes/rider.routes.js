const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.js");
const upload = require("../middlewares/upload.js");

const AuthCtrl = require("../controllers/riderAuth.controller.js");
const VerifyCtrl = require("../controllers/riderVerification.controller.js");
const DashCtrl = require("../controllers/riderDashboard.controller.js");
const ProfileCtrl = require("../controllers/riderProfile.controller.js");
// updateFcmToken is role-agnostic (the `auth` middleware already resolves
// req.user to a Rider doc for rider tokens), so it's reused as-is here rather
// than duplicated — this alias exists purely so the rider app can call a
// /rider/* path consistent with the rest of this router.
const { updateFcmToken } = require("../controllers/auth.controller.js");

// ── Auth & Profile setup ──
router.post("/auth/firebase-login", AuthCtrl.firebaseLogin);
router.post("/profile/setup", auth, upload.single("avatar"), AuthCtrl.setupProfile);
router.patch("/fcm-token", auth, updateFcmToken);

console.log("DashCtrl methods:", Object.keys(DashCtrl));
// ── Verification (onboarding docs) ──
router.post(
  "/verification/id",
  auth,
  upload.fields([
    { name: "licenseFront", maxCount: 1 },
    { name: "licenseBack", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
    { name: "medicare", maxCount: 1 },
  ]),
  VerifyCtrl.uploadIdVerification
);

router.post(
  "/verification/work-rights",
  auth,
  upload.fields([
    { name: "visaFront", maxCount: 1 },
    { name: "visaBack", maxCount: 1 },
    { name: "vevo", maxCount: 1 },
  ]),
  VerifyCtrl.uploadWorkRights
);

router.post(
  "/verification/police-check",
  auth,
  upload.fields([
    { name: "policeFront", maxCount: 1 },
    { name: "policeBack", maxCount: 1 },
  ]),
  VerifyCtrl.uploadPoliceCheck
);

router.post(
  "/verification/vehicle",
  auth,
  upload.fields([
    { name: "insuranceFront", maxCount: 1 },
    { name: "insuranceBack", maxCount: 1 },
    { name: "vehiclePhotos", maxCount: 8 },
  ]),
  VerifyCtrl.uploadVehicle
);

router.get("/verification/status", auth, VerifyCtrl.getVerificationStatus);

// ── Dashboard & Orders ──
router.get("/dashboard", auth, DashCtrl.getDashboard);
router.patch("/status", auth, DashCtrl.toggleOnline);
router.post("/orders/:id/accept", auth, DashCtrl.acceptOrder);
router.post("/orders/:id/skip", auth, DashCtrl.skipOrder);

router.post(
  "/orders/:id/confirm-pickup",
  auth,
  upload.fields([{ name: "photos", maxCount: 8 }]),
  DashCtrl.confirmPickup
);
router.post(
  "/orders/:id/confirm-dropoff",
  auth,
  upload.fields([{ name: "photo", maxCount: 1 }]),
  DashCtrl.confirmDropoff
);
router.post(
  "/orders/:id/confirm-delivery",
  auth,
  upload.fields([{ name: "photo", maxCount: 1 }]),
  DashCtrl.confirmDelivery
);

// ── Earnings ──
router.get("/earnings", auth, DashCtrl.getEarnings);
router.post("/earnings/withdraw", auth, DashCtrl.withdrawEarnings);

// ── Profile ──
router.get("/profile", auth, ProfileCtrl.getProfile);

module.exports = router;
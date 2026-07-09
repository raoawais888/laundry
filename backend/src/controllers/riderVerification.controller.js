const Rider = require("../models/Rider");
const RiderDocument = require("../models/RiderDocument");
const Vehicle = require("../models/Vehicle");

// Helper: pull uploaded file paths by field name from multer .fields()
const filePath = (req, field) =>
  req.files?.[field]?.[0] ? `/uploads/rider/${req.files[field][0].filename}` : undefined;

// POST /api/v1/rider/verification/id  (Image 11 — license, passport, selfie, medicare)
exports.uploadIdVerification = async (req, res) => {
  try {
    const rider = await Rider.findById(req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    const docs = [
      { docType: "driver_license", frontImage: filePath(req, "licenseFront"), backImage: filePath(req, "licenseBack") },
      { docType: "passport", frontImage: filePath(req, "passport") },
      { docType: "selfie", frontImage: filePath(req, "selfie") },
      { docType: "medicare", frontImage: filePath(req, "medicare") },
    ];

    for (const d of docs) {
      if (!d.frontImage && !d.backImage) continue;
      await RiderDocument.findOneAndUpdate(
        { rider: rider._id, docType: d.docType },
        { ...d, rider: rider._id, status: "in_review" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    rider.verification.idCheck.status = "in_review";
    rider.onboardingStep = "id_verification";
    await rider.save();

    return res.json({ success: true, message: "ID documents submitted for review" });
  } catch (err) {
    console.error("uploadIdVerification error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/rider/verification/work-rights  (Image 10 — visa + VEVO)
exports.uploadWorkRights = async (req, res) => {
  try {
    const { visaType, visaExpiryDate } = req.body;
    const rider = await Rider.findById(req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    await RiderDocument.findOneAndUpdate(
      { rider: rider._id, docType: "visa" },
      {
        rider: rider._id,
        docType: "visa",
        visaType: (visaType || "").trim(),
        expiryDate: visaExpiryDate ? new Date(visaExpiryDate) : undefined,
        frontImage: filePath(req, "visaFront"),
        backImage: filePath(req, "visaBack"),
        status: "in_review",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (filePath(req, "vevo")) {
      await RiderDocument.findOneAndUpdate(
        { rider: rider._id, docType: "vevo" },
        { rider: rider._id, docType: "vevo", frontImage: filePath(req, "vevo"), status: "in_review" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    rider.verification.workRights.status = "in_review";
    rider.onboardingStep = "work_rights";
    await rider.save();

    return res.json({ success: true, message: "Work rights documents submitted for review" });
  } catch (err) {
    console.error("uploadWorkRights error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/rider/verification/police-check  (Image 9)
exports.uploadPoliceCheck = async (req, res) => {
  try {
    const { policeCheckNumber, expiryDate } = req.body;
    const rider = await Rider.findById(req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    await RiderDocument.findOneAndUpdate(
      { rider: rider._id, docType: "police_check" },
      {
        rider: rider._id,
        docType: "police_check",
        documentNumber: (policeCheckNumber || "").trim(),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        frontImage: filePath(req, "policeFront"),
        backImage: filePath(req, "policeBack"),
        status: "in_review",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    rider.verification.policeCheck.status = "in_review";
    rider.onboardingStep = "police_check";
    await rider.save();

    return res.json({ success: true, message: "Police check submitted for review" });
  } catch (err) {
    console.error("uploadPoliceCheck error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/rider/verification/vehicle  (Image 8)
exports.uploadVehicle = async (req, res) => {
  try {
    const { vehicleType, registrationNumber } = req.body;
    const rider = await Rider.findById(req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    if (!vehicleType || !registrationNumber) {
      return res.status(400).json({ success: false, message: "Vehicle type and registration number are required" });
    }

    const vehiclePhotos = (req.files?.vehiclePhotos || []).map((f) => `/uploads/rider/${f.filename}`);

    await Vehicle.findOneAndUpdate(
      { rider: rider._id },
      {
        rider: rider._id,
        vehicleType,
        registrationNumber: registrationNumber.trim(),
        insuranceFront: filePath(req, "insuranceFront"),
        insuranceBack: filePath(req, "insuranceBack"),
        ...(vehiclePhotos.length ? { vehiclePhotos } : {}),
        status: "in_review",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    rider.verification.vehicleCheck.status = "in_review";
    rider.onboardingStep = "vehicle_details";
    rider.isProfileComplete = true;
    await rider.save();

    return res.json({ success: true, message: "Vehicle details submitted for review" });
  } catch (err) {
    console.error("uploadVehicle error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/v1/rider/verification/status  (Image 7 — Approval Pending)
exports.getVerificationStatus = async (req, res) => {
  try {
    const rider = await Rider.findById(req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    return res.json({
      success: true,
      accountStatus: rider.accountStatus,
      onboardingStep: rider.onboardingStep,
      verification: rider.verification,
    });
  } catch (err) {
    console.error("getVerificationStatus error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
const Rider = require("../models/Rider");
const RiderDocument = require("../models/RiderDocument");
const Vehicle = require("../models/Vehicle");

// GET /api/v1/rider/profile  (Image 1)
exports.getProfile = async (req, res) => {
  try {
    const rider = await Rider.findById(req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    const [vehicle, documents] = await Promise.all([
      Vehicle.findOne({ rider: rider._id }),
      RiderDocument.find({ rider: rider._id }),
    ]);

    return res.json({
      success: true,
      rider: rider.toSafeObject(),
      vehicle,
      documents,
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
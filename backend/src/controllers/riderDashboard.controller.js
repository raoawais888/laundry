const Rider = require("../models/Rider");
const Order = require("../models/Order");
const Earning = require("../models/Earning");

const filePath = (req, field) =>
  req.files?.[field]?.[0] ? `/uploads/profile/${req.files[field][0].filename}` : undefined;

// PATCH /api/v1/rider/status  (Image 6 — Online/Offline toggle)
// PATCH /api/v1/rider/status
exports.toggleOnline = async (req, res) => {
  try {
    const { isOnline, lat, lng } = req.body;
    const rider = await Rider.findById(req.user.id);
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    if (rider.accountStatus !== "approved") {
      return res.status(403).json({ success: false, message: "Your account is not approved yet" });
    }

    rider.isOnline = !!isOnline;
    if (lat && lng) rider.currentLocation = { lat, lng, updatedAt: new Date() };
    await rider.save();

    return res.json({ success: true, isOnline: rider.isOnline });
  } catch (err) {
    console.error("toggleOnline error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/v1/rider/dashboard  (Image 6 — earnings summary + deliveries count)
exports.getDashboard = async (req, res) => {
  try {
    const riderId = req.user.id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayEarnings, todayDeliveries, availablePickups] = await Promise.all([
      Earning.aggregate([
        { $match: { rider: req.user._id, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Order.countDocuments({ rider: riderId, status: "delivered", "delivery.confirmedAt": { $gte: startOfToday } }),
      Order.find({ status: "available" })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("customer", "name firstName lastName"),
    ]);

    return res.json({
      success: true,
      todayEarning: todayEarnings[0]?.total || 0,
      deliveries: todayDeliveries,
      availablePickups,
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/rider/orders/:id/accept  (Image 6 — Accept button)
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: "available" },
      { status: "accepted", rider: req.user.id, riderAssignedAt: new Date() },
      { new: true }
    );
    if (!order) return res.status(409).json({ success: false, message: "Order no longer available" });

    return res.json({ success: true, order });
  } catch (err) {
    console.error("acceptOrder error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/rider/orders/:id/skip
exports.skipOrder = async (req, res) => {
  // In a real system you'd track skips per-rider so it doesn't reappear for them.
  return res.json({ success: true, message: "Order skipped" });
};

// POST /api/v1/rider/orders/:id/confirm-pickup  (Image 5)
exports.confirmPickup = async (req, res) => {
  try {
    const { otp, bags, isFragile, instructions, estimatedWeightKg } = req.body;

    const order = await Order.findOne({ _id: req.params.id, rider: req.user.id, status: "accepted" });
    if (!order) return res.status(404).json({ success: false, message: "Order not found or not in a pickup-ready state" });

    // Verify the pickup OTP the customer shows the rider
    if (!otp || order.pickupOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid pickup OTP" });
    }

    const photos = (req.files?.photos || []).map((f) => `/uploads/profile/${f.filename}`);

    order.status = "picked_up";
    order.pickup = {
      photos,
      bags: bags ? Number(bags) : undefined,
      isFragile: isFragile === "true" || isFragile === true,
      instructions: (instructions || "").trim(),
      confirmedAt: new Date(),
    };
    if (estimatedWeightKg) order.estimatedWeightKg = Number(estimatedWeightKg);

    await order.save();

    return res.json({ success: true, message: "Pickup confirmed", order });
  } catch (err) {
    console.error("confirmPickup error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/rider/orders/:id/confirm-dropoff  (Image 4)
exports.confirmDropoff = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, rider: req.user.id, status: "picked_up" });
    if (!order) return res.status(404).json({ success: false, message: "Order not found or not picked up yet" });

    order.status = "dropped_off";
    order.dropoff = {
      ...order.dropoff,
      photo: filePath(req, "photo"),
      confirmedAt: new Date(),
    };
    await order.save();

    return res.json({ success: true, message: "Drop-off confirmed", order });
  } catch (err) {
    console.error("confirmDropoff error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/rider/orders/:id/confirm-delivery  (Image 3)
exports.confirmDelivery = async (req, res) => {
  try {
    const { signature } = req.body;
    const order = await Order.findOne({ _id: req.params.id, rider: req.user.id, status: "dropped_off" });
    if (!order) return res.status(404).json({ success: false, message: "Order not found or not ready for delivery" });

    order.status = "delivered";
    order.delivery = {
      signature: signature || undefined, // base64 signature from the canvas
      photo: filePath(req, "photo"),
      confirmedAt: new Date(),
    };
    await order.save();

    // Create the earning record (pending payout)
    await Earning.create({
      rider: req.user.id,
      order: order._id,
      orderNumber: order.orderNumber,
      amount: order.payout,
      type: "delivery",
      status: "pending",
    });

    return res.json({ success: true, message: "Delivery confirmed", order });
  } catch (err) {
    console.error("confirmDelivery error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/v1/rider/earnings  (Image 2)
exports.getEarnings = async (req, res) => {
  try {
    const riderId = req.user.id;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [available, today, weekly, incentive, pending, history] = await Promise.all([
      Earning.aggregate([
        { $match: { rider: req.user._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Earning.aggregate([
        { $match: { rider: req.user._id, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Earning.aggregate([
        { $match: { rider: req.user._id, createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Earning.aggregate([
        { $match: { rider: req.user._id, type: "incentive" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Earning.find({ rider: riderId, status: "pending" }).sort({ createdAt: -1 }),
      Earning.find({ rider: riderId, status: "completed" }).sort({ createdAt: -1 }).limit(50),
    ]);

    return res.json({
      success: true,
      totalAvailable: available[0]?.total || 0,
      today: today[0]?.total || 0,
      weekly: weekly[0]?.total || 0,
      incentive: incentive[0]?.total || 0,
      pendingPayouts: pending,
      transactionHistory: history,
    });
  } catch (err) {
    console.error("getEarnings error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/v1/rider/earnings/withdraw  (Image 2 — Withdraw Earnings button)
exports.withdrawEarnings = async (req, res) => {
  try {
    const result = await Earning.updateMany(
      { rider: req.user.id, status: "pending" },
      { status: "completed", payoutRequestedAt: new Date(), paidAt: new Date() }
    );
    return res.json({ success: true, message: "Withdrawal requested", updated: result.modifiedCount });
  } catch (err) {
    console.error("withdrawEarnings error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};
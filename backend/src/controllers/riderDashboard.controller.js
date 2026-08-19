const Rider = require("../models/Rider");
const Order = require("../models/Order");
const Earning = require("../models/Earning");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendPushToTokens } = require("../services/firebase.service");

const filePath = (req, field) =>
  req.files?.[field]?.[0] ? req.files[field][0].path : undefined;

const RIDER_POPULATE = {
  path: "rider",
  select: "name firstName lastName phone rating",
  populate: { path: "vehicle", select: "vehicleType registrationNumber" },
};

// Pushes a live order-status update to anyone tracking this order (customer
// app joins `order:${orderId}` via the order:subscribe socket event).
function broadcastOrderUpdate(io, order) {
  if (!io) return;
  io.to(`order:${order._id}`).emit("order:update", {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    rider: order.rider,
    pickup: order.pickup,
    dropoff: order.dropoff,
    delivery: order.delivery,
  });
}

// Creates an in-app Notification for the customer and best-effort pushes it
// to their device via FCM. Push delivery failures are swallowed — the
// in-app record is the source of truth, push is a nice-to-have.
async function notifyCustomer(order, type, title, body) {
  try {
    await Notification.create({
      recipient: order.customer,
      recipientModel: "User",
      title,
      body,
      type,
      data: { screen: "OrderDetail", orderId: order._id.toString() },
      channels: ["push", "in_app"],
    });

    const customer = await User.findById(order.customer).select("fcmToken");
    if (customer?.fcmToken) {
      await sendPushToTokens([customer.fcmToken], {
        title,
        body,
        data: { screen: "OrderDetail", orderId: order._id.toString() },
      });
    }
  } catch (err) {
    console.error("notifyCustomer error:", err);
  }
}

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

// PATCH /api/v1/rider/location — live GPS ping while a rider has an active order,
// broadcast to whoever is tracking that order in the customer app.
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const rider = await Rider.findByIdAndUpdate(
      req.user.id,
      { currentLocation: { lat, lng, updatedAt: new Date() } },
      { new: true }
    );
    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    const activeOrder = await Order.findOne({
      rider: req.user.id,
      status: { $in: ["accepted", "picked_up", "dropped_off"] },
    }).select("_id");

    const io = req.app.get("io");
    if (activeOrder && io) {
      io.to(`order:${activeOrder._id}`).emit("rider:location", { orderId: activeOrder._id, lat, lng });
    }

    return res.json({ success: true, currentLocation: rider.currentLocation });
  } catch (err) {
    console.error("updateLocation error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/v1/rider/dashboard  (Image 6 — earnings summary + deliveries count)
exports.getDashboard = async (req, res) => {
  try {
    const riderId = req.user.id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayEarnings, todayDeliveries, availablePickups, activeOrder] = await Promise.all([
      Earning.aggregate([
        { $match: { rider: req.user._id, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Order.countDocuments({ rider: riderId, status: "delivered", "delivery.confirmedAt": { $gte: startOfToday } }),
      Order.find({ status: "available" })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("customer", "name firstName lastName"),
      Order.findOne({ rider: riderId, status: { $in: ["accepted", "picked_up", "dropped_off"] } })
        .sort({ riderAssignedAt: -1 })
        .populate("customer", "name firstName lastName phone"),
    ]);

    return res.json({
      success: true,
      todayEarning: todayEarnings[0]?.total || 0,
      deliveries: todayDeliveries,
      availablePickups,
      activeOrder,
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
    ).populate(RIDER_POPULATE);
    if (!order) return res.status(409).json({ success: false, message: "Order no longer available" });

    broadcastOrderUpdate(req.app.get("io"), order);
    notifyCustomer(order, "rider_assigned", "Rider on the way", "A rider has accepted your order and is heading your way.");

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

    const photos = (req.files?.photos || []).map((f) => f.path);

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

    broadcastOrderUpdate(req.app.get("io"), order);
    notifyCustomer(order, "order_picked_up", "Order picked up", "Your rider has picked up your laundry.");

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

    broadcastOrderUpdate(req.app.get("io"), order);
    notifyCustomer(order, "order_processing", "Laundry received", "Your laundry has arrived at our facility and is being processed.");

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

    broadcastOrderUpdate(req.app.get("io"), order);
    notifyCustomer(order, "order_delivered", "Order delivered", "Your laundry has been delivered. Enjoy!");

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
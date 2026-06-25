const Order = require("../models/Order");
const Rider = require("../models/Rider");

// POST /api/orders
// Create Order screen
exports.createOrder = async (req, res) => {
  try {
    const {
      serviceType,
      pickup,
      delivery,
      clothes,
      paymentMethod,
    } = req.body;

    // Simple pricing logic (customise as needed)
    const RATES = {
      wash_and_fold: 4,   // per kg
      dry_clean: 8,
      ironing: 3,
      express: 6,
      blanket: 15,
    };
    const DELIVERY_CHARGE = 8;

    const weightKg = clothes?.weightKg || 0;
    const serviceCharge = (RATES[serviceType] || 0) * (weightKg || 1);
    const total = serviceCharge + DELIVERY_CHARGE;

    const order = new Order({
      user: req.user.id,
      serviceType,
      pickup,
      delivery: {
        ...delivery,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days estimate
      },
      clothes,
      paymentMethod,
      pricing: { serviceCharge, deliveryCharge: DELIVERY_CHARGE, total },
      status: "order_confirmed",
      statusLog: [{ status: "order_confirmed" }],
    });

    await order.save();
    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders
// All orders for logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("rider", "firstName lastName profileImage vehiclePlate vehicleType averageRating")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id }).populate(
      "rider",
      "firstName lastName profileImage vehiclePlate vehicleType averageRating currentLocation"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/track/:orderNumber
// Live Tracking screen — lookup by #LM-20482 style number
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
      user: req.user.id,
    }).populate("rider", "firstName lastName profileImage vehiclePlate vehicleType averageRating currentLocation");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const cancellableStatuses = ["order_confirmed", "rider_assigned"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }

    order.status = "cancelled";
    order.statusLog.push({ status: "cancelled" });
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/status  (admin/rider use)
// Body: { status, note }
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.statusLog.push({ status, note });

    // Auto-assign rider on confirmation if not set
    if (status === "rider_assigned" && req.body.riderId) {
      order.rider = req.body.riderId;
    }

    await order.save();
    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders/:id/rate
// Rating & Review screen
exports.rateOrder = async (req, res) => {
  try {
    const { riderRating, qualityRating, feedback } = req.body;

    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "delivered") return res.status(400).json({ message: "Order not yet delivered" });
    if (order.rating?.submittedAt) return res.status(400).json({ message: "Already rated" });

    order.rating = { riderRating, qualityRating, feedback, submittedAt: new Date() };
    await order.save();

    // Update rider average rating
    if (order.rider) {
      const rider = await Rider.findById(order.rider);
      if (rider) {
        const newTotal = rider.totalRatings + 1;
        rider.averageRating =
          (rider.averageRating * rider.totalRatings + riderRating) / newTotal;
        rider.totalRatings = newTotal;
        await rider.save();
      }
    }

    res.json({ message: "Rating submitted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

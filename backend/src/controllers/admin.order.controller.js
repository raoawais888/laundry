const mongoose = require("mongoose");
const Order = require("../models/Order");
const Rider = require("../models/Rider");
const Payment = require("../models/Payment");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const ORDER_STATUSES = [
  "pending",
  "available",
  "accepted",
  "picked_up",
  "dropped_off",
  "delivered",
  "cancelled",
];

const orderAmount = (order) => order?.pricing?.total || order?.pricing?.estimatedTotal || 0;

// GET /api/v1/admin/orders
exports.getOrders = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
  const { status, rider, dateFrom, dateTo, search } = req.query;

  const match = { isDeleted: false };
  if (status && ORDER_STATUSES.includes(status)) match.status = status;
  if (rider && mongoose.Types.ObjectId.isValid(rider)) match.rider = new mongoose.Types.ObjectId(rider);
  if (dateFrom || dateTo) {
    match.createdAt = {};
    if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
    if (dateTo) match.createdAt.$lte = new Date(dateTo);
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $lookup: {
        from: "riders",
        localField: "rider",
        foreignField: "_id",
        as: "rider",
      },
    },
    { $unwind: { path: "$rider", preserveNullAndEmptyArrays: true } },
  ];

  if (search && search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({
      $match: {
        $or: [
          { orderNumber: regex },
          { "customer.name": regex },
          { "customer.phone": regex },
        ],
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "payments",
        let: { orderId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$order", "$$orderId"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { status: 1, _id: 0 } },
        ],
        as: "paymentInfo",
      },
    },
    { $addFields: { paymentStatus: { $arrayElemAt: ["$paymentInfo.status", 0] } } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              orderNumber: 1,
              status: 1,
              paymentStatus: 1,
              pricing: 1,
              pickupAddress: 1,
              createdAt: 1,
              customer: { _id: 1, name: 1, phone: 1 },
              rider: { _id: 1, fullLegalName: 1, firstName: 1, lastName: 1 },
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    }
  );

  const [result] = await Order.aggregate(pipeline);
  const total = result.totalCount[0]?.count || 0;

  const orders = result.data.map((o) => ({
    id: o._id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus || null,
    amount: orderAmount(o),
    pickupAddress: o.pickupAddress?.fullAddress || null,
    createdAt: o.createdAt,
    customer: { id: o.customer._id, name: o.customer.name, phone: o.customer.phone },
    rider: o.rider
      ? {
          id: o.rider._id,
          name: o.rider.fullLegalName || [o.rider.firstName, o.rider.lastName].filter(Boolean).join(" ") || null,
        }
      : null,
  }));

  res.json({
    success: true,
    orders,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/v1/admin/orders/assignable-riders
exports.getAssignableRiders = catchAsync(async (req, res) => {
  const riders = await Rider.find({ accountStatus: "approved" })
    .select("fullLegalName firstName lastName phone isOnline")
    .sort({ isOnline: -1, fullLegalName: 1 });

  res.json({
    success: true,
    riders: riders.map((r) => ({
      id: r._id,
      name: r.fullLegalName || [r.firstName, r.lastName].filter(Boolean).join(" ") || r.phone,
      phone: r.phone,
      isOnline: r.isOnline,
    })),
  });
});

// GET /api/v1/admin/orders/:id
exports.getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid order id.", 400));

  const order = await Order.findOne({ _id: id, isDeleted: false })
    .populate("customer", "name phone email")
    .populate("rider", "fullLegalName firstName lastName phone email");

  if (!order) return next(new AppError("Order not found.", 404));

  const payments = await Payment.find({ order: order._id }).sort({ createdAt: -1 });

  const timeline = [{ label: "Order Created", at: order.createdAt }];
  if (order.rider && order.riderAssignedAt) timeline.push({ label: "Rider Assigned", at: order.riderAssignedAt });
  if (order.pickup?.confirmedAt) timeline.push({ label: "Picked Up", at: order.pickup.confirmedAt });
  if (order.dropoff?.confirmedAt) timeline.push({ label: "Laundry Received", at: order.dropoff.confirmedAt });
  if (order.delivery?.confirmedAt) timeline.push({ label: "Delivered", at: order.delivery.confirmedAt });
  if (order.cancelledAt) timeline.push({ label: "Cancelled", at: order.cancelledAt });
  timeline.sort((a, b) => new Date(a.at) - new Date(b.at));

  res.json({
    success: true,
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      customer: order.customer,
      rider: order.rider,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      pickupSlot: order.pickupSlot,
      deliverySlot: order.deliverySlot,
      items: order.items,
      pricing: order.pricing,
      photos: order.photos,
      pickup: order.pickup,
      dropoff: order.dropoff,
      delivery: order.delivery,
      isFragile: order.isFragile,
      isExpress: order.isExpress,
      numberOfBags: order.numberOfBags,
      estimatedWeight: order.estimatedWeight,
      specialInstructions: order.specialInstructions,
      cancellationReason: order.cancellationReason,
      cancelledBy: order.cancelledBy,
      cancelledAt: order.cancelledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      payments,
      timeline,
    },
  });
});

// PATCH /api/v1/admin/orders/:id/status
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid order id.", 400));
  if (!ORDER_STATUSES.includes(status)) return next(new AppError("Invalid order status.", 400));

  const order = await Order.findOne({ _id: id, isDeleted: false });
  if (!order) return next(new AppError("Order not found.", 404));

  if (order.status === "delivered" || order.status === "cancelled") {
    return next(new AppError(`Order status can no longer be changed once it is "${order.status}".`, 409));
  }

  order.status = status;
  await order.save();

  res.json({ success: true, message: "Order status updated.", order });
});

// PATCH /api/v1/admin/orders/:id/assign-rider
exports.assignRider = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { riderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid order id.", 400));
  if (!riderId || !mongoose.Types.ObjectId.isValid(riderId)) return next(new AppError("A valid riderId is required.", 400));

  const [order, rider] = await Promise.all([
    Order.findOne({ _id: id, isDeleted: false }),
    Rider.findById(riderId),
  ]);

  if (!order) return next(new AppError("Order not found.", 404));
  if (!rider) return next(new AppError("Rider not found.", 404));
  if (rider.accountStatus !== "approved") return next(new AppError("Rider is not approved.", 409));
  if (order.status === "delivered" || order.status === "cancelled") {
    return next(new AppError(`Cannot assign a rider once the order is "${order.status}".`, 409));
  }

  order.rider = rider._id;
  order.riderAssignedAt = new Date();
  if (order.status === "pending" || order.status === "available") {
    order.status = "accepted";
  }
  await order.save();

  res.json({ success: true, message: "Rider assigned.", order });
});

// PATCH /api/v1/admin/orders/:id/cancel
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid order id.", 400));

  const order = await Order.findOne({ _id: id, isDeleted: false });
  if (!order) return next(new AppError("Order not found.", 404));

  if (order.status === "delivered" || order.status === "cancelled") {
    return next(new AppError(`Order cannot be cancelled once it is "${order.status}".`, 409));
  }

  order.status = "cancelled";
  order.cancellationReason = reason || "Cancelled by admin";
  order.cancelledBy = "admin";
  order.cancelledAt = new Date();
  await order.save();

  res.json({ success: true, message: "Order cancelled.", order });
});

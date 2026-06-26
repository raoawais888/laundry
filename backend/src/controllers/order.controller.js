const mongoose = require("mongoose");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { calculateEstimatedPricing } = require("../services/pricing.service.js");

// Statuses past this point can no longer be cancelled by the customer.
const NON_CANCELLABLE_STATUSES = [
  "picked_up",
  "laundry_processing",
  "washing",
  "drying",
  "ironing",
  "quality_check",
  "packed",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
];

/**
 * POST /api/v1/orders/order-create
 * Creates a new order for the logged-in customer.
 *
 * Accepts either application/json (no photos) or multipart/form-data (with
 * photo files under the "photos" field, handled by uploadOrderPhotos +
 * parseMultipartOrderFields middleware before this runs). Either way, by
 * the time this controller runs, req.body fields are real objects/numbers,
 * and req.files (if present) holds the Cloudinary upload results.
 */
exports.createOrder = catchAsync(async (req, res, next) => {
    console.log(req.body);
  const {
    pickupAddress,
    deliveryAddress,
    pickupSlot,
    deliverySlot,
    items,
    estimatedWeight,
    numberOfBags,
    isFragile,
    specialInstructions,
    isExpress,
    paymentMethod,
    couponDiscount,
    walletDeduction,
  } = req.body;

  const pricing = calculateEstimatedPricing(items, {
    isExpress: !!isExpress,
    walletDeduction,
    couponDiscount,
  });

  // req.files is populated by multer-storage-cloudinary when the request
  // was multipart/form-data with files attached. Each file object carries
  // the Cloudinary upload result: `path` is the secure URL, `filename` is
  // the Cloudinary public_id. If the request was plain JSON (no photos),
  // req.files is undefined and photos is just an empty array.
  const photos = (req.files || []).map((file) => ({
    url: file.path,
    publicId: file.filename,
    uploadedBy: "customer",
  }));

  const order = await Order.create({
    customer: req.user._id,
    pickupAddress,
    deliveryAddress,
    pickupSlot,
    deliverySlot,
    items,
    estimatedWeight,
    numberOfBags,
    isFragile,
    specialInstructions,
    photos,
    isExpress: !!isExpress,
    paymentMethod,
    pricing,
    status: "pending",
    // give the customer a window to cancel for free / let a cron auto-cancel
    // unconfirmed orders — adjust to match your actual acceptance flow
    autoCancelAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
  });

  res.status(201).json({
    success: true,
    data: { order },
  });
});

/**
 * GET /api/v1/orders/order-create
 * Lists the logged-in customer's orders, newest first.
 * Supports ?status=pending&page=1&limit=10
 */
exports.getMyOrders = catchAsync(async (req, res, next) => {

  const { status } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const filter = { customer: req.user._id, isDeleted: false };
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("rider", "name phone vehicle")
      .lean({ virtuals: true }),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * GET /api/v1/orders/:id
 */
exports.getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid order id.", 400));
  }

  const order = await Order.findOne({
    _id: id,
    customer: req.user._id,
    isDeleted: false,
  }).populate("rider", "name phone vehicle");

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

/**
 * PATCH /api/v1/orders/:id/cancel
 */
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid order id.", 400));
  }

  const order = await Order.findOne({ _id: id, customer: req.user._id, isDeleted: false });

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (NON_CANCELLABLE_STATUSES.includes(order.status)) {
    return next(
      new AppError(`Order cannot be cancelled once it is "${order.status}".`, 409)
    );
  }

  order.status = "cancelled";
  order.cancellationReason = reason || "Cancelled by customer";
  order.cancelledBy = "customer";
  order.cancelledAt = new Date();

  await order.save();

  res.status(200).json({
    success: true,
    data: { order },
  });
});

/**
 * PATCH /api/v1/orders/:id/review
 */
exports.submitReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid order id.", 400));
  }

  const order = await Order.findOne({ _id: id, customer: req.user._id, isDeleted: false });

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (order.status !== "completed") {
    return next(new AppError("Only completed orders can be reviewed.", 409));
  }

  if (order.isReviewed) {
    return next(new AppError("This order has already been reviewed.", 409));
  }

  order.isReviewed = true;
  await order.save();

  res.status(200).json({
    success: true,
    message: "Thanks for the feedback!",
    data: { order, rating, comment },
  });
});

/**
 * DELETE /api/v1/orders/:id
 */
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid order id.", 400));
  }

  const order = await Order.findOne({ _id: id, customer: req.user._id, isDeleted: false });

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  const terminal = ["completed", "cancelled", "refunded"];
  if (!terminal.includes(order.status)) {
    return next(new AppError("Only completed, cancelled, or refunded orders can be removed.", 409));
  }

  order.isDeleted = true;
  await order.save();

  res.status(204).json({ success: true, data: null });
});
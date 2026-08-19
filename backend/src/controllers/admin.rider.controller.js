const mongoose = require("mongoose");
const Rider = require("../models/Rider");
const Order = require("../models/Order");
const Vehicle = require("../models/Vehicle");
const RiderDocument = require("../models/RiderDocument");
const Earning = require("../models/Earning");
const Review = require("../models/Review");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const ACCOUNT_STATUSES = ["pending", "approved", "suspended", "rejected"];

const riderName = (r) => r.fullLegalName || [r.firstName, r.lastName].filter(Boolean).join(" ") || r.phone;

// GET /api/v1/admin/riders
exports.getRiders = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
  const { status, search } = req.query;

  const filter = {};
  if (status && ACCOUNT_STATUSES.includes(status)) filter.accountStatus = status;
  if (search && search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ fullLegalName: regex }, { firstName: regex }, { lastName: regex }, { phone: regex }, { email: regex }];
  }

  const [riders, total] = await Promise.all([
    Rider.find(filter)
      .select("fullLegalName firstName lastName phone email accountStatus isOnline rating ratingCount createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Rider.countDocuments(filter),
  ]);

  const riderIds = riders.map((r) => r._id);
  const [vehicles, deliveredCounts, availableEarnings] = await Promise.all([
    Vehicle.find({ rider: { $in: riderIds } }).select("rider vehicleType"),
    Order.aggregate([
      { $match: { rider: { $in: riderIds }, status: "delivered" } },
      { $group: { _id: "$rider", count: { $sum: 1 } } },
    ]),
    Earning.aggregate([
      { $match: { rider: { $in: riderIds }, status: "completed" } },
      { $group: { _id: "$rider", total: { $sum: "$amount" } } },
    ]),
  ]);

  const vehicleByRider = new Map(vehicles.map((v) => [v.rider.toString(), v.vehicleType]));
  const deliveredByRider = new Map(deliveredCounts.map((d) => [d._id.toString(), d.count]));
  const earningsByRider = new Map(availableEarnings.map((e) => [e._id.toString(), e.total]));

  res.json({
    success: true,
    riders: riders.map((r) => ({
      id: r._id,
      name: riderName(r),
      phone: r.phone,
      email: r.email,
      vehicleType: vehicleByRider.get(r._id.toString()) || null,
      accountStatus: r.accountStatus,
      isOnline: r.isOnline,
      completedOrders: deliveredByRider.get(r._id.toString()) || 0,
      rating: r.rating || null,
      earnings: earningsByRider.get(r._id.toString()) || 0,
      createdAt: r.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/v1/admin/riders/:id
exports.getRiderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid rider id.", 400));

  const rider = await Rider.findById(id);
  if (!rider) return next(new AppError("Rider not found.", 404));

  const [vehicle, documents, orders, earningsAgg, reviews] = await Promise.all([
    Vehicle.findOne({ rider: id }),
    RiderDocument.find({ rider: id }),
    Order.find({ rider: id, isDeleted: false })
      .select("orderNumber status pricing createdAt")
      .sort({ createdAt: -1 })
      .limit(20),
    Earning.aggregate([
      { $match: { rider: rider._id } },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Review.find({ rider: id }).sort({ createdAt: -1 }).limit(20),
  ]);

  const earnings = { pending: 0, completed: 0 };
  for (const row of earningsAgg) {
    if (row._id === "pending") earnings.pending = row.total;
    if (row._id === "completed") earnings.completed = row.total;
  }

  res.json({
    success: true,
    rider: rider.toSafeObject(),
    vehicle,
    documents,
    orders,
    earnings,
    reviews,
  });
});

// PATCH /api/v1/admin/riders/:id/status
exports.updateRiderStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { accountStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid rider id.", 400));
  if (!ACCOUNT_STATUSES.includes(accountStatus)) return next(new AppError("Invalid account status.", 400));

  const rider = await Rider.findById(id);
  if (!rider) return next(new AppError("Rider not found.", 404));

  rider.accountStatus = accountStatus;

  // Approving/rejecting the rider overall is a bulk decision — cascade it down
  // to every individual document, the vehicle, and each verification check so
  // they don't show a stale "in_review" state after the rider's already been
  // approved or rejected.
  if (accountStatus === "approved" || accountStatus === "rejected") {
    const docStatus = accountStatus === "approved" ? "passed" : "rejected";

    for (const check of ["idCheck", "policeCheck", "workRights", "vehicleCheck"]) {
      rider.verification[check].status = docStatus;
    }
    if (accountStatus === "approved") rider.onboardingStep = "approved";

    await Promise.all([
      RiderDocument.updateMany({ rider: rider._id }, { status: docStatus }),
      Vehicle.updateMany({ rider: rider._id }, { status: docStatus }),
    ]);
  }

  await rider.save();

  res.json({ success: true, message: "Rider status updated.", rider: rider.toSafeObject() });
});

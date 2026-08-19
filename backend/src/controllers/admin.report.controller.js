const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Rider = require("../models/Rider");
const catchAsync = require("../utils/catchAsync");

const ORDER_STATUSES = [
  "pending",
  "available",
  "accepted",
  "picked_up",
  "dropped_off",
  "delivered",
  "cancelled",
];

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const parseRange = (query) => {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  // Inclusive of the whole "to" day.
  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);
  return { from: startOfDay(from), to: toEnd };
};

// GET /api/v1/admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD
// Default range: last 30 days.
exports.getReports = catchAsync(async (req, res) => {
  const { from, to } = parseRange(req.query);
  const dateFilter = { createdAt: { $gte: from, $lte: to } };

  const [
    salesTotalAgg,
    salesByDay,
    ordersTotal,
    ordersByStatusAgg,
    newCustomers,
    activeCustomers,
    repeatCustomers,
    riderPerformance,
  ] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "succeeded", createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "succeeded", createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.countDocuments({ isDeleted: false, ...dateFilter }),
    Order.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    User.countDocuments({ isDeleted: false, ...dateFilter }),
    User.countDocuments({ isDeleted: false, status: "active" }),
    User.countDocuments({ isDeleted: false, orderCount: { $gt: 1 } }),
    Order.aggregate([
      { $match: { isDeleted: false, status: "delivered", rider: { $ne: null }, ...dateFilter } },
      { $group: { _id: "$rider", completedOrders: { $sum: 1 }, payout: { $sum: "$payout" } } },
      { $sort: { completedOrders: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "riders",
          localField: "_id",
          foreignField: "_id",
          as: "rider",
        },
      },
      { $unwind: "$rider" },
      {
        $project: {
          completedOrders: 1,
          payout: 1,
          "rider.fullLegalName": 1,
          "rider.firstName": 1,
          "rider.lastName": 1,
          "rider.rating": 1,
          "rider.ratingCount": 1,
        },
      },
    ]),
  ]);

  const ordersByStatus = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {});
  for (const row of ordersByStatusAgg) {
    if (row._id in ordersByStatus) ordersByStatus[row._id] = row.count;
  }

  res.json({
    success: true,
    range: { from: from.toISOString(), to: to.toISOString() },
    sales: {
      total: salesTotalAgg[0]?.total || 0,
      byDay: salesByDay.map((r) => ({ date: r._id, amount: r.amount })),
    },
    orders: {
      total: ordersTotal,
      completed: ordersByStatus.delivered,
      cancelled: ordersByStatus.cancelled,
      pending: ordersByStatus.pending + ordersByStatus.available + ordersByStatus.accepted,
      byStatus: ordersByStatus,
    },
    customers: {
      newInRange: newCustomers,
      activeTotal: activeCustomers,
      repeatCustomers,
    },
    riders: riderPerformance.map((r) => ({
      id: r._id,
      name: r.rider.fullLegalName || [r.rider.firstName, r.rider.lastName].filter(Boolean).join(" "),
      completedOrders: r.completedOrders,
      earnings: r.payout || 0,
      rating: r.rider.rating || null,
      ratingCount: r.rider.ratingCount || 0,
    })),
  });
});

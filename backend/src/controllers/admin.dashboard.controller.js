const User = require("../models/User");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
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

const daysAgo = (n) => {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
};

const sumSucceededPayments = async (from) => {
  const match = { status: "succeeded" };
  if (from) match.createdAt = { $gte: from };
  const [row] = await Payment.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return row?.total || 0;
};

// GET /api/v1/admin/dashboard
exports.getDashboard = catchAsync(async (req, res) => {
  const today = startOfDay();
  const startOfWeek = daysAgo(7);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const sevenDaysAgo = daysAgo(6); // inclusive of today = 7 days total

  const [
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    totalOrders,
    ordersToday,
    ordersByStatusRaw,
    revenueTotal,
    revenueToday,
    revenueWeek,
    revenueMonth,
    revenueSeriesRaw,
    totalRiders,
    onlineRiders,
    approvedRiders,
    pendingRiders,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    User.countDocuments({ isDeleted: false, status: "active" }),
    User.countDocuments({ isDeleted: false, createdAt: { $gte: startOfMonth } }),

    Order.countDocuments({ isDeleted: false }),
    Order.countDocuments({ isDeleted: false, createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    sumSucceededPayments(),
    sumSucceededPayments(today),
    sumSucceededPayments(startOfWeek),
    sumSucceededPayments(startOfMonth),

    Payment.aggregate([
      { $match: { status: "succeeded", createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
    ]),

    Rider.countDocuments({}),
    Rider.countDocuments({ isOnline: true }),
    Rider.countDocuments({ accountStatus: "approved" }),
    Rider.countDocuments({ accountStatus: "pending" }),

    Order.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("customer", "name phone")
      .populate("rider", "fullLegalName firstName lastName")
      .select("orderNumber status pricing createdAt customer rider"),
  ]);

  const ordersByStatus = ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});
  for (const row of ordersByStatusRaw) {
    if (row._id in ordersByStatus) ordersByStatus[row._id] = row.count;
  }

  const revenueByDay = new Map(revenueSeriesRaw.map((r) => [r._id, r.total]));
  const revenueSeries = [];
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    revenueSeries.push({ date: key, amount: revenueByDay.get(key) || 0 });
  }

  return res.json({
    success: true,
    users: {
      total: totalUsers,
      active: activeUsers,
      newThisMonth: newUsersThisMonth,
    },
    orders: {
      total: totalOrders,
      today: ordersToday,
      byStatus: ordersByStatus,
    },
    revenue: {
      total: revenueTotal,
      today: revenueToday,
      week: revenueWeek,
      month: revenueMonth,
    },
    riders: {
      total: totalRiders,
      online: onlineRiders,
      approved: approvedRiders,
      pendingApproval: pendingRiders,
    },
    revenueSeries,
    recentOrders: recentOrders.map((o) => ({
      id: o._id,
      orderNumber: o.orderNumber,
      status: o.status,
      amount: o.pricing?.total ?? o.pricing?.estimatedTotal ?? 0,
      createdAt: o.createdAt,
      customer: o.customer
        ? { id: o.customer._id, name: o.customer.name, phone: o.customer.phone }
        : null,
      rider: o.rider
        ? {
            id: o.rider._id,
            name:
              o.rider.fullLegalName ||
              [o.rider.firstName, o.rider.lastName].filter(Boolean).join(" ") ||
              null,
          }
        : null,
    })),
  });
});

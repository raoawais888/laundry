const Payment = require("../models/Payment");
const catchAsync = require("../utils/catchAsync");

const PAYMENT_STATUSES = [
  "initiated",
  "pending",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
];

// GET /api/v1/admin/payments
exports.getPayments = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
  const { status, gateway, search } = req.query;

  const match = {};
  if (status && PAYMENT_STATUSES.includes(status)) match.status = status;
  if (gateway) match.gateway = gateway;

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  ];

  if (search && search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({
      $match: {
        $or: [
          { "order.orderNumber": regex },
          { "customer.name": regex },
          { "customer.phone": regex },
          { gatewayPaymentId: regex },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              gatewayPaymentId: 1,
              gateway: 1,
              amount: 1,
              currency: 1,
              status: 1,
              refundAmount: 1,
              refundedAt: 1,
              createdAt: 1,
              "order._id": 1,
              "order.orderNumber": 1,
              "customer._id": 1,
              "customer.name": 1,
              "customer.phone": 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    }
  );

  const [result] = await Payment.aggregate(pipeline);
  const total = result.totalCount[0]?.count || 0;

  res.json({
    success: true,
    payments: result.data.map((p) => ({
      id: p._id,
      transactionId: p.gatewayPaymentId || null,
      gateway: p.gateway,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      refundAmount: p.refundAmount || 0,
      refundedAt: p.refundedAt || null,
      createdAt: p.createdAt,
      order: p.order ? { id: p.order._id, orderNumber: p.order.orderNumber } : null,
      customer: p.customer ? { id: p.customer._id, name: p.customer.name, phone: p.customer.phone } : null,
    })),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/v1/admin/payments/stats
exports.getPaymentStats = catchAsync(async (req, res) => {
  const [totalsByStatus, refundTotal] = await Promise.all([
    Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
    Payment.aggregate([
      { $match: { status: { $in: ["refunded", "partially_refunded"] } } },
      { $group: { _id: null, total: { $sum: "$refundAmount" } } },
    ]),
  ]);

  const byStatus = PAYMENT_STATUSES.reduce((acc, s) => {
    acc[s] = { count: 0, amount: 0 };
    return acc;
  }, {});
  for (const row of totalsByStatus) {
    if (row._id in byStatus) byStatus[row._id] = { count: row.count, amount: row.amount };
  }

  res.json({
    success: true,
    totalRevenue: byStatus.succeeded.amount,
    successfulCount: byStatus.succeeded.count,
    pendingCount: byStatus.pending.count + byStatus.processing.count + byStatus.initiated.count,
    failedCount: byStatus.failed.count + byStatus.cancelled.count,
    refundedAmount: refundTotal[0]?.total || 0,
    refundedCount: byStatus.refunded.count + byStatus.partially_refunded.count,
  });
});

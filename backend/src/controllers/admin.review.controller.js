const mongoose = require("mongoose");
const Review = require("../models/Review");
const Rider = require("../models/Rider");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// GET /api/v1/admin/reviews
exports.getReviews = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
  const { rating, visibility, search } = req.query;

  const filter = {};
  if (rating && [1, 2, 3, 4, 5].includes(Number(rating))) filter.overallRating = Number(rating);
  if (visibility === "hidden") filter.isVisible = false;
  if (visibility === "visible") filter.isVisible = true;
  if (visibility === "flagged") filter.isFlagged = true;

  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "riders",
        localField: "rider",
        foreignField: "_id",
        as: "rider",
      },
    },
    { $unwind: { path: "$rider", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
  ];

  if (search && search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({
      $match: {
        $or: [
          { "customer.name": regex },
          { "customer.phone": regex },
          { "order.orderNumber": regex },
          { overallFeedback: regex },
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
              overallRating: 1,
              overallFeedback: 1,
              riderRating: 1,
              riderFeedback: 1,
              laundryRating: 1,
              laundryFeedback: 1,
              adminReply: 1,
              adminRepliedAt: 1,
              isVisible: 1,
              isFlagged: 1,
              flagReason: 1,
              createdAt: 1,
              "customer._id": 1,
              "customer.name": 1,
              "customer.phone": 1,
              "rider._id": 1,
              "rider.fullLegalName": 1,
              "rider.firstName": 1,
              "rider.lastName": 1,
              "order._id": 1,
              "order.orderNumber": 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    }
  );

  const [result] = await Review.aggregate(pipeline);
  const total = result.totalCount[0]?.count || 0;

  res.json({
    success: true,
    reviews: result.data.map((r) => ({
      id: r._id,
      overallRating: r.overallRating,
      overallFeedback: r.overallFeedback,
      riderRating: r.riderRating,
      riderFeedback: r.riderFeedback,
      laundryRating: r.laundryRating,
      laundryFeedback: r.laundryFeedback,
      adminReply: r.adminReply || null,
      adminRepliedAt: r.adminRepliedAt || null,
      isVisible: r.isVisible,
      isFlagged: r.isFlagged,
      flagReason: r.flagReason || null,
      createdAt: r.createdAt,
      customer: r.customer ? { id: r.customer._id, name: r.customer.name, phone: r.customer.phone } : null,
      rider: r.rider
        ? { id: r.rider._id, name: r.rider.fullLegalName || [r.rider.firstName, r.rider.lastName].filter(Boolean).join(" ") }
        : null,
      order: r.order ? { id: r.order._id, orderNumber: r.order.orderNumber } : null,
    })),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/v1/admin/reviews/stats
exports.getReviewStats = catchAsync(async (req, res) => {
  const [overall, byStar] = await Promise.all([
    Review.aggregate([
      { $match: { overallRating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: "$overallRating" }, count: { $sum: 1 } } },
    ]),
    Review.aggregate([
      { $match: { overallRating: { $exists: true } } },
      { $group: { _id: { $round: "$overallRating" }, count: { $sum: 1 } } },
    ]),
  ]);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const row of byStar) {
    if (row._id in breakdown) breakdown[row._id] = row.count;
  }

  res.json({
    success: true,
    averageRating: overall[0]?.avg ? Math.round(overall[0].avg * 10) / 10 : 0,
    totalReviews: overall[0]?.count || 0,
    breakdown,
  });
});

// PATCH /api/v1/admin/reviews/:id/visibility
exports.updateVisibility = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isVisible } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid review id.", 400));
  if (typeof isVisible !== "boolean") return next(new AppError("isVisible must be true or false.", 400));

  const review = await Review.findByIdAndUpdate(id, { isVisible }, { new: true });
  if (!review) return next(new AppError("Review not found.", 404));

  res.json({ success: true, message: isVisible ? "Review shown." : "Review hidden.", review });
});

// PATCH /api/v1/admin/reviews/:id/reply
exports.replyToReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { adminReply } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid review id.", 400));
  if (!adminReply || !adminReply.trim()) return next(new AppError("Reply text is required.", 400));

  const review = await Review.findByIdAndUpdate(
    id,
    { adminReply: adminReply.trim(), adminRepliedAt: new Date() },
    { new: true }
  );
  if (!review) return next(new AppError("Review not found.", 404));

  res.json({ success: true, message: "Reply posted.", review });
});

// DELETE /api/v1/admin/reviews/:id
exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid review id.", 400));

  const review = await Review.findByIdAndDelete(id);
  if (!review) return next(new AppError("Review not found.", 404));

  // Review.js's post-save hook keeps Rider.rating/ratingCount in sync on
  // create, but findByIdAndDelete doesn't fire it — recompute here so a
  // deleted review doesn't leave the rider's average stale.
  if (review.rider) {
    const stats = await Review.aggregate([
      { $match: { rider: review.rider, riderRating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: "$riderRating" }, count: { $sum: 1 } } },
    ]);
    await Rider.findByIdAndUpdate(review.rider, {
      rating: stats.length ? Math.round(stats[0].avg * 10) / 10 : null,
      ratingCount: stats.length ? stats[0].count : 0,
    });
  }

  res.json({ success: true, message: "Review deleted." });
});

const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
const Address = require("../models/Address");
const Review = require("../models/Review");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const USER_STATUSES = ["active", "blocked", "suspended"];

// GET /api/v1/admin/users
exports.getUsers = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
  const { status, search } = req.query;

  const filter = { isDeleted: false };
  if (status && USER_STATUSES.includes(status)) filter.status = status;
  if (search && search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email phone avatar status orderCount totalSpending createdAt lastLoginAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/v1/admin/users/:id
exports.getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid user id.", 400));

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) return next(new AppError("User not found.", 404));

  const [addresses, orders, reviews] = await Promise.all([
    Address.find({ user: id, isDeleted: false }).sort({ isDefault: -1, createdAt: -1 }),
    Order.find({ customer: id, isDeleted: false })
      .select("orderNumber status pricing createdAt")
      .sort({ createdAt: -1 })
      .limit(20),
    Review.find({ customer: id }).sort({ createdAt: -1 }).limit(20),
  ]);

  res.json({
    success: true,
    user: user.toSafeObject(),
    addresses,
    orders,
    reviews,
  });
});

// PATCH /api/v1/admin/users/:id/status
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid user id.", 400));
  if (!USER_STATUSES.includes(status)) return next(new AppError("Invalid user status.", 400));

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) return next(new AppError("User not found.", 404));

  user.status = status;
  await user.save();

  res.json({ success: true, message: "User status updated.", user: user.toSafeObject() });
});

// DELETE /api/v1/admin/users/:id
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid user id.", 400));

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) return next(new AppError("User not found.", 404));

  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  res.json({ success: true, message: "User deleted." });
});

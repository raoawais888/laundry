const Service = require("../models/Service");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// GET /api/v1/services
exports.getServices = catchAsync(async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json({ success: true, data: { services } });
});

// GET /api/v1/services/:id
exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findOne({ _id: req.params.id, isActive: true });
  if (!service) {
    return next(new AppError("Service not found.", 404));
  }
  res.status(200).json({ success: true, data: { service } });
});

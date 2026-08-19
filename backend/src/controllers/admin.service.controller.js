const mongoose = require("mongoose");
const slugify = require("slugify");
const Service = require("../models/Service");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const uniqueSlug = async (name, ignoreId) => {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await Service.findOne({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) });
    if (!clash) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
};

// GET /api/v1/admin/services
exports.getServices = catchAsync(async (req, res) => {
  const { status, search } = req.query;

  const filter = {};
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;
  if (search && search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }

  const services = await Service.find(filter).sort({ name: 1 });
  res.json({ success: true, services });
});

// GET /api/v1/admin/services/:id
exports.getServiceById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid service id.", 400));

  const service = await Service.findById(id);
  if (!service) return next(new AppError("Service not found.", 404));

  res.json({ success: true, service });
});

// POST /api/v1/admin/services
exports.createService = catchAsync(async (req, res, next) => {
  const { name, description, unit, unitPrice, isActive } = req.body;

  if (!name || !name.trim()) return next(new AppError("Service name is required.", 400));
  if (unitPrice === undefined || unitPrice === null || isNaN(unitPrice) || Number(unitPrice) < 0) {
    return next(new AppError("A valid unit price is required.", 400));
  }

  const slug = await uniqueSlug(name.trim());

  const service = await Service.create({
    name: name.trim(),
    slug,
    description: description?.trim() || undefined,
    unit: unit?.trim() || "per_kg",
    unitPrice: Number(unitPrice),
    isActive: isActive !== undefined ? !!isActive : true,
  });

  res.status(201).json({ success: true, message: "Service created.", service });
});

// PATCH /api/v1/admin/services/:id
exports.updateService = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid service id.", 400));

  const service = await Service.findById(id);
  if (!service) return next(new AppError("Service not found.", 404));

  const { name, description, unit, unitPrice, isActive } = req.body;

  if (name !== undefined) {
    if (!name.trim()) return next(new AppError("Service name is required.", 400));
    if (name.trim() !== service.name) {
      service.slug = await uniqueSlug(name.trim(), service._id);
    }
    service.name = name.trim();
  }
  if (description !== undefined) service.description = description.trim();
  if (unit !== undefined) service.unit = unit.trim() || "per_kg";
  if (unitPrice !== undefined) {
    if (isNaN(unitPrice) || Number(unitPrice) < 0) return next(new AppError("A valid unit price is required.", 400));
    service.unitPrice = Number(unitPrice);
  }
  if (isActive !== undefined) service.isActive = !!isActive;

  await service.save();

  res.json({ success: true, message: "Service updated.", service });
});

// DELETE /api/v1/admin/services/:id
exports.deleteService = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid service id.", 400));

  const service = await Service.findByIdAndDelete(id);
  if (!service) return next(new AppError("Service not found.", 404));

  res.json({ success: true, message: "Service deleted." });
});

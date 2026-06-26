const AppError = require("../utils/AppError");

const VALID_PAYMENT_METHODS = ["cash", "wallet", "card", "paypal", "apple_pay", "google_pay", "mixed"];

function isNonEmptyString(val) {
  return typeof val === "string" && val.trim().length > 0;
}

function validateAddress(addr, label) {
  if (!addr || typeof addr !== "object") {
    return `${label} is required.`;
  }
  if (!isNonEmptyString(addr.fullAddress)) {
    return `${label}.fullAddress is required.`;
  }
  return null;
}

function validateSlot(slot, label) {
  if (!slot || typeof slot !== "object") {
    return `${label} is required.`;
  }
  if (!slot.date || isNaN(new Date(slot.date).getTime())) {
    return `${label}.date must be a valid date.`;
  }
  if (!isNonEmptyString(slot.slotStart) || !isNonEmptyString(slot.slotEnd)) {
    return `${label}.slotStart and ${label}.slotEnd are required.`;
  }
  return null;
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "At least one item/service is required.";
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.service) {
      return `items[${i}].service is required.`;
    }
    if (item.estimatedQty == null || item.estimatedQty <= 0) {
      return `items[${i}].estimatedQty must be greater than 0.`;
    }
  }
  return null;
}

/**
 * Validates the body for POST /orders. Throws AppError(400) on the first
 * problem found rather than collecting every issue, to keep responses simple.
 */
exports.validateCreateOrder = (req, res, next) => {
  const { pickupAddress, deliveryAddress, pickupSlot, deliverySlot, items, paymentMethod } = req.body;

  const checks = [
    validateAddress(pickupAddress, "pickupAddress"),
    validateAddress(deliveryAddress, "deliveryAddress"),
    validateSlot(pickupSlot, "pickupSlot"),
    validateSlot(deliverySlot, "deliverySlot"),
    validateItems(items),
  ];

  const firstError = checks.find(Boolean);
  if (firstError) {
    return next(new AppError(firstError, 400));
  }

  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return next(
      new AppError(`paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(", ")}`, 400)
    );
  }

  next();
};

exports.validateCancelOrder = (req, res, next) => {
  if (req.body.reason && typeof req.body.reason !== "string") {
    return next(new AppError("reason must be a string.", 400));
  }
  next();
};

exports.validateSubmitReview = (req, res, next) => {
  const { rating } = req.body;
  if (rating == null || rating < 1 || rating > 5) {
    return next(new AppError("rating must be a number between 1 and 5.", 400));
  }
  next();
};
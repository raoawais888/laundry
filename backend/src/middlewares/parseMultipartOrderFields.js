const AppError = require("../utils/AppError.js");

// Fields on the order-create body that are objects/arrays in the JSON-only
// version of this endpoint, but arrive as JSON-encoded *strings* when sent
// as multipart/form-data (multipart has no native concept of nested objects
// — every field is a string or a file). This middleware parses just those
// fields back into real objects/arrays so validateCreateOrder and the
// controller can work with req.body exactly as they did before, regardless
// of whether the request was JSON or multipart.
const JSON_FIELDS = ["pickupAddress", "deliveryAddress", "pickupSlot", "deliverySlot", "items"];

module.exports = function parseMultipartOrderFields(req, res, next) {
  // If this wasn't a multipart request (no files, e.g. content-type was
  // application/json), req.body fields are already real objects — skip.
  if (!req.is("multipart/form-data")) {
    return next();
  }

  for (const field of JSON_FIELDS) {
    const raw = req.body[field];
    if (typeof raw !== "string") continue; // already absent or already parsed

    try {
      req.body[field] = JSON.parse(raw);
    } catch (err) {
      return next(
        new AppError(`${field} must be valid JSON when sent as part of a multipart request.`, 400)
      );
    }
  }

  // Numeric/boolean fields also arrive as strings over multipart and need
  // coercing back, since the schema/validator expect real types.
  if (req.body.estimatedWeight != null) req.body.estimatedWeight = Number(req.body.estimatedWeight);
  if (req.body.numberOfBags != null) req.body.numberOfBags = Number(req.body.numberOfBags);
  if (req.body.isFragile != null) req.body.isFragile = req.body.isFragile === "true" || req.body.isFragile === true;
  if (req.body.isExpress != null) req.body.isExpress = req.body.isExpress === "true" || req.body.isExpress === true;
  if (req.body.couponDiscount != null) req.body.couponDiscount = Number(req.body.couponDiscount);
  if (req.body.walletDeduction != null) req.body.walletDeduction = Number(req.body.walletDeduction);

  next();
};
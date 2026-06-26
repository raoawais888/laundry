/**
 * Operational error with an HTTP status code attached.
 * Throw this (or call next(new AppError(...))) anywhere you need to bail
 * out with a known, client-facing message. Anything that isn't an AppError
 * is treated as a bug and gets a generic 500 in production.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
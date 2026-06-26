require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./src/config/db.js");



const app = express();
const server = http.createServer(app);

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests, please slow down." },
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts." },
});

// ── Middlewares ───────────────────────────────────────────────────────────────

app.use("/uploads", express.static("uploads"));
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(compression());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(globalLimiter);

// ── Routes (uncomment as you build each one) ──────────────────────────────────
app.use("/api/v1/auth", authLimiter);
 app.use("/api/v1/auth",            require("./src/routes/auth.routes.js"));
// app.use("/api/v1/users",           require("./routes/user.routes"));
    app.use("/api/v1",       require("./src/routes/address.routes"));
// app.use("/api/v1/services",        require("./routes/service.routes"));
// app.use("/api/v1/orders",          require("./routes/order.routes"));
// app.use("/api/v1/payments",        require("./routes/payment.routes"));
// app.use("/api/v1/wallet",          require("./routes/wallet.routes"));
// app.use("/api/v1/coupons",         require("./routes/coupon.routes"));
// app.use("/api/v1/reviews",         require("./routes/review.routes"));
// app.use("/api/v1/notifications",   require("./routes/notification.routes"));
// app.use("/api/v1/riders",          require("./routes/rider.routes"));
// app.use("/api/v1/admin",           require("./routes/admin.routes"));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV, timestamp: new Date() })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

// ── Central Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Lume Laundry API running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, server };
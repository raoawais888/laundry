import axios from "axios";

const API_ORIGIN =
  // process.env.REACT_APP_API_URL || "https://doorlaundry-d928b43be380.herokuapp.com"
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
});

// Uploaded files (rider documents, order photos, avatars, ...) are served
// from the backend's /uploads static route directly, not under /api/v1 —
// the DB only stores the relative path (e.g. "/uploads/profile/xyz.jpg").
export const fileUrl = (path) => (path ? `${API_ORIGIN}${path}` : null);

// Attach JWT token to every request automatically. Admin routes carry a
// separate session (localStorage "adminToken") from the customer/rider
// session ("token"), so route the header by which namespace the request
// is actually hitting instead of always sending the customer token.
api.interceptors.request.use(
  (config) => {
    const isAdminRequest = config.url?.startsWith("/admin");
    const token = isAdminRequest
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
// ─────────────────────────────────────────────────────────────
// ADMIN AUTH
// ─────────────────────────────────────────────────────────────

export const adminLogin = (email, password) =>
  api.post("/admin/auth/login", { email, password });

export const adminForgotPassword = (email) =>
  api.post("/admin/auth/forgot-password", { email });

export const adminResetPassword = (email, code, newPassword) =>
  api.post("/admin/auth/reset-password", { email, code, newPassword });

export const adminGetMe = () =>
  api.get("/admin/auth/me");

export const adminUpdateProfile = (data) =>
  api.patch("/admin/auth/profile", data);

export const adminChangePassword = (currentPassword, newPassword) =>
  api.patch("/admin/auth/change-password", { currentPassword, newPassword });
// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export const sendOtp = (phone) =>
  api.post("/auth/send-otp", { phone });

export const verifyOtp = (phone, otp) =>
  api.post("/auth/verify-otp", { phone, otp });

export const firebaseLogin = (idToken) =>
  api.post("/auth/firebase-login", { idToken });

export const setupProfile = (data) =>
  api.post("/auth/setup-profile", data);


export const verifyEmail = (code) =>
  api.post("/auth/verify-email", { code });

export const resendEmailCode = () =>
  api.post("/auth/resend-email-code");
// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────

export const getProfile = () =>
  api.get("/users/profile");

export const updateProfile = (data) =>
  api.put("/users/profile", data);

// ─────────────────────────────────────────────────────────────
// ADDRESSES
// ─────────────────────────────────────────────────────────────

export const addAddress = (data) =>
  api.post("/addresses", data);

export const getAddresses = () =>
  api.get("/addresses");

export const getAddressById = (id) =>
  api.get(`/addresses/${id}`);

export const updateAddress = (id, data) =>
  api.put(`/addresses/${id}`, data);

export const setDefaultAddress = (id) =>
  api.patch(`/addresses/${id}/default`);

export const deleteAddress = (id) =>
  api.delete(`/addresses/${id}`);

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────

export const getServices = () =>
  api.get("/services");

export const getServiceById = (id) =>
  api.get(`/services/${id}`);

// ─────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────

// Order fields that are objects/arrays need to be JSON-stringified when sent
// as multipart/form-data (forms can't carry nested objects directly — every
// field is either a string or a file). The backend's parseMultipartOrderFields
// middleware JSON.parses these back into real objects before validation runs.
const JSON_FIELDS = ["pickupAddress", "deliveryAddress", "pickupSlot", "deliverySlot", "items"];

/**
 * Creates an order. If `photos` (an array of File objects) is non-empty,
 * sends a single multipart/form-data request with both the order fields and
 * the photo files together — matching the backend's order-create route,
 * which accepts photos directly via upload.array("photos", 8). If there are
 * no photos, sends plain JSON instead (also supported by the same route).
 *
 * @param {Object} data - order fields (pickupAddress, items, etc.)
 * @param {File[]} [photos] - image files to attach, max 8
 */
export const createOrder = (data, photos = []) => {
  if (!photos || photos.length === 0) {
    return api.post("/orders/order-create", data);
  }

  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    const serialized = JSON_FIELDS.includes(key) ? JSON.stringify(value) : String(value);
    formData.append(key, serialized);
  }

  for (const file of photos) {
    formData.append("photos", file);
  }

  return api.post("/orders/order-create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getMyOrders = () =>
  api.get("/orders/order-create"); // GET on the same path, per the backend route

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

export const trackOrder = (orderNumber) =>
  api.get(`/orders/track/${orderNumber}`);

export const cancelOrder = (id, reason) =>
  api.patch(`/orders/${id}/cancel`, { reason });

export const rateOrder = (id, data) =>
  api.patch(`/orders/${id}/review`, data);

// ─────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────

export const createPayment = (data) =>
  api.post("/payments", data);

export const verifyPayment = (data) =>
  api.post("/payments/verify", data);

// ─────────────────────────────────────────────────────────────
// WALLET
// ─────────────────────────────────────────────────────────────

export const getPaymentMethods = () =>
  api.get("/wallet");

export const addPaymentMethod = (data) =>
  api.post("/wallet", data);

export const deletePaymentMethod = (id) =>
  api.delete(`/wallet/${id}`);

// ─────────────────────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────────────────────

export const applyCoupon = (code) =>
  api.post("/coupons/apply", { code });

// ─────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────

export const addReview = (data) =>
  api.post("/reviews", data);

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

export const getNotifications = () =>
  api.get("/notifications");

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`);

// ─────────────────────────────────────────────────────────────
// RIDERS
// ─────────────────────────────────────────────────────────────

export const trackRider = (orderId) =>
  api.get(`/riders/track/${orderId}`);

// ─────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────

export const getDashboard = () =>
  api.get("/admin/dashboard");

// ── Admin Orders ────────────────────────────────────────────────────────────

export const adminGetOrders = (params) =>
  api.get("/admin/orders", { params });

export const adminGetOrderById = (id) =>
  api.get(`/admin/orders/${id}`);

export const adminGetAssignableRiders = () =>
  api.get("/admin/orders/assignable-riders");

export const adminUpdateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status });

export const adminAssignRider = (id, riderId) =>
  api.patch(`/admin/orders/${id}/assign-rider`, { riderId });

export const adminCancelOrder = (id, reason) =>
  api.patch(`/admin/orders/${id}/cancel`, { reason });

// ── Admin Users ─────────────────────────────────────────────────────────────

export const adminGetUsers = (params) =>
  api.get("/admin/users", { params });

export const adminGetUserById = (id) =>
  api.get(`/admin/users/${id}`);

export const adminUpdateUserStatus = (id, status) =>
  api.patch(`/admin/users/${id}/status`, { status });

export const adminDeleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

// ── Admin Riders ────────────────────────────────────────────────────────────

export const adminGetRiders = (params) =>
  api.get("/admin/riders", { params });

export const adminGetRiderById = (id) =>
  api.get(`/admin/riders/${id}`);

export const adminUpdateRiderStatus = (id, accountStatus) =>
  api.patch(`/admin/riders/${id}/status`, { accountStatus });

// ── Admin Payments ──────────────────────────────────────────────────────────

export const adminGetPayments = (params) =>
  api.get("/admin/payments", { params });

export const adminGetPaymentStats = () =>
  api.get("/admin/payments/stats");

// ── Admin Reviews ───────────────────────────────────────────────────────────

export const adminGetReviews = (params) =>
  api.get("/admin/reviews", { params });

export const adminGetReviewStats = () =>
  api.get("/admin/reviews/stats");

export const adminUpdateReviewVisibility = (id, isVisible) =>
  api.patch(`/admin/reviews/${id}/visibility`, { isVisible });

export const adminReplyToReview = (id, adminReply) =>
  api.patch(`/admin/reviews/${id}/reply`, { adminReply });

export const adminDeleteReview = (id) =>
  api.delete(`/admin/reviews/${id}`);

// ── Admin Services ──────────────────────────────────────────────────────────

export const adminGetServices = (params) =>
  api.get("/admin/services", { params });

export const adminCreateService = (data) =>
  api.post("/admin/services", data);

export const adminUpdateService = (id, data) =>
  api.patch(`/admin/services/${id}`, data);

export const adminDeleteService = (id) =>
  api.delete(`/admin/services/${id}`);

// ── Admin Notifications ─────────────────────────────────────────────────────

export const adminGetNotifications = (params) =>
  api.get("/admin/notifications", { params });

export const adminGetNotificationStats = () =>
  api.get("/admin/notifications/stats");

export const adminSendBroadcast = (data) =>
  api.post("/admin/notifications/broadcast", data);

// ── Admin Reports ───────────────────────────────────────────────────────────

export const adminGetReports = (params) =>
  api.get("/admin/reports", { params });

// ─────────────────────────────────────────────────────────────
// RIDER AUTH
// ─────────────────────────────────────────────────────────────

export const riderSendOtp = (phone) =>
  api.post("/rider/auth/send-otp", { phone });

export const riderVerifyOtp = (phone, otp) =>
  api.post("/rider/auth/verify-otp", { phone, otp });

export const riderSetupProfile = (data) =>
  api.post("/rider/profile/setup", data);

// ─────────────────────────────────────────────────────────────
// RIDER VERIFICATION (onboarding)
// ─────────────────────────────────────────────────────────────

export const riderUploadId = (formData) =>
  api.post("/rider/verification/id", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const riderUploadWorkRights = (formData) =>
  api.post("/rider/verification/work-rights", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const riderUploadPoliceCheck = (formData) =>
  api.post("/rider/verification/police-check", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const riderUploadVehicle = (formData) =>
  api.post("/rider/verification/vehicle", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const riderGetVerificationStatus = () =>
  api.get("/rider/verification/status");

// ─────────────────────────────────────────────────────────────
// RIDER DASHBOARD & ORDERS
// ─────────────────────────────────────────────────────────────

export const riderGetDashboard = () =>
  api.get("/rider/dashboard");

export const riderToggleOnline = (data) =>
  api.patch("/rider/status", data);

export const riderAcceptOrder = (id) =>
  api.post(`/rider/orders/${id}/accept`);

export const riderSkipOrder = (id) =>
  api.post(`/rider/orders/${id}/skip`);

export const riderConfirmPickup = (id, formData) =>
  api.post(`/rider/orders/${id}/confirm-pickup`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const riderConfirmDropoff = (id, formData) =>
  api.post(`/rider/orders/${id}/confirm-dropoff`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const riderConfirmDelivery = (id, formData) =>
  api.post(`/rider/orders/${id}/confirm-delivery`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ─────────────────────────────────────────────────────────────
// RIDER EARNINGS & PROFILE
// ─────────────────────────────────────────────────────────────

export const riderGetEarnings = () =>
  api.get("/rider/earnings");

export const riderWithdrawEarnings = () =>
  api.post("/rider/earnings/withdraw");

export const riderGetProfile = () =>
  api.get("/rider/profile");

export default api;
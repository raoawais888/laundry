import axios from "axios";

const api = axios.create({
  baseURL: `${
    process.env.REACT_APP_API_URL || "http://localhost:5000"
  }/api/v1`,
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export const sendOtp = (phone) =>
  api.post("/auth/send-otp", { phone });

export const verifyOtp = (phone, otp) =>
  api.post("/auth/verify-otp", { phone, otp });

export const setupProfile = (data) =>
  api.post("/auth/setup-profile", data);

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

export const createOrder = (data) =>
  api.post("/orders", data);

export const getMyOrders = () =>
  api.get("/orders");

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

export const trackOrder = (orderNumber) =>
  api.get(`/orders/track/${orderNumber}`);

export const cancelOrder = (id) =>
  api.patch(`/orders/${id}/cancel`);

export const rateOrder = (id, data) =>
  api.post(`/orders/${id}/rate`, data);

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

export default api;
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

export default api;
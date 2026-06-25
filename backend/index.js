// ── Order Status ──────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  RIDER_ASSIGNED: "rider_assigned",
  RIDER_ARRIVING: "rider_arriving",
  PICKED_UP: "picked_up",
  LAUNDRY_PROCESSING: "laundry_processing",
  WASHING: "washing",
  DRYING: "drying",
  IRONING: "ironing",
  QUALITY_CHECK: "quality_check",
  PACKED: "packed",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

// Valid transitions: what status can follow what
const ORDER_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.RIDER_ASSIGNED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.RIDER_ASSIGNED]: [ORDER_STATUS.RIDER_ARRIVING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.RIDER_ARRIVING]: [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.LAUNDRY_PROCESSING],
  [ORDER_STATUS.LAUNDRY_PROCESSING]: [ORDER_STATUS.WASHING],
  [ORDER_STATUS.WASHING]: [ORDER_STATUS.DRYING],
  [ORDER_STATUS.DRYING]: [ORDER_STATUS.IRONING],
  [ORDER_STATUS.IRONING]: [ORDER_STATUS.QUALITY_CHECK],
  [ORDER_STATUS.QUALITY_CHECK]: [ORDER_STATUS.PACKED],
  [ORDER_STATUS.PACKED]: [ORDER_STATUS.OUT_FOR_DELIVERY],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.REFUNDED],
};

// ── Payment ───────────────────────────────────────────────────────────────────
const PAYMENT_GATEWAY = {
  STRIPE: "stripe",
  PAYPAL: "paypal",
  APPLE_PAY: "apple_pay",
  GOOGLE_PAY: "google_pay",
  PAYSTACK: "paystack",
  CASH: "cash",
  WALLET: "wallet",
};

// ── Business Rules ─────────────────────────────────────────────────────────────
const BUSINESS_RULES = {
  AUTO_CANCEL_PENDING_MINUTES: 15,    // auto-cancel unaccepted order after 15min
  MAX_ORDER_PHOTOS: 5,
  REWARD_POINTS_PER_CURRENCY: 10,     // 10 points per PKR spent
  REWARD_POINTS_REDEEM_RATE: 0.1,     // 1 point = PKR 0.10
  ADMIN_COMMISSION_PERCENT: 10,
  RIDER_EARNING_PERCENT: 90,
  EXPRESS_MULTIPLIER: 1.5,
  REFERRAL_REWARD: 100,               // PKR credited to both on referral
  NEAREST_RIDER_RADIUS_KM: 10,
  MAX_RIDER_ASSIGN_ATTEMPTS: 3,
};

// ── Socket Events ─────────────────────────────────────────────────────────────
const SOCKET_EVENTS = {
  // Auth
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",

  // Rider
  RIDER_ONLINE: "rider-online",
  RIDER_OFFLINE: "rider-offline",
  RIDER_LOCATION_UPDATE: "rider-location-update",

  // Order
  ORDER_TRACKING: "order-tracking",
  ORDER_STATUS_CHANGE: "order-status-change",
  NEW_ORDER: "new-order",            // sent to available riders
  ORDER_ACCEPTED: "order-accepted",  // sent to customer
  ORDER_CANCELLED: "order-cancelled",

  // Customer
  CUSTOMER_LOCATION: "customer-location",
};

module.exports = {
  ORDER_STATUS,
  ORDER_TRANSITIONS,
  PAYMENT_GATEWAY,
  BUSINESS_RULES,
  SOCKET_EVENTS,
};
/* ────────────────────────────────────────────────────────────
   Shared data / constants
──────────────────────────────────────────────────────────── */

export const NAV_ITEMS = [
  { key: "home", label: "Home" },
  { key: "orders", label: "Orders" },
  { key: "wallet", label: "Wallet" },
  { key: "support", label: "Support" },
  { key: "profile", label: "Profile" },
];

// NOTE on backendId: these are placeholder MongoDB ObjectId-shaped strings
// (24 hex chars), generated deterministically per service so they're stable
// across reloads and pass ObjectId validation on the backend. They are NOT
// real Service documents in your database — once you seed a real `Service`
// collection, replace each backendId below with the actual _id from that
// collection (or better: fetch services from GET /services at runtime via
// getServices() in api.js, and drop this hardcoded list entirely).
export const SERVICES = [
  {
    id: "wash-fold",
    backendId: "793b790adaa4d4760a067b0b",
    label: "Wash & Fold",
    bg: "#EEF0FB",
    pricePerKg: 4,
    iconKey: "wash-fold",
  },
  {
    id: "ironing",
    backendId: "ead27cc4bd880ee2b57efa97",
    label: "Ironing",
    bg: "#E6F9F4",
    pricePerKg: 3,
    iconKey: "ironing",
  },
  {
    id: "dry-clean",
    backendId: "002d8f79cb8f85f09aeb5049",
    label: "Dry Cleaning",
    bg: "#FFF8E6",
    pricePerKg: 6,
    iconKey: "dry-clean",
  },
  {
    id: "express",
    backendId: "4ca65a8bdbeae8b6ee400801",
    label: "Express",
    bg: "#E6F9F4",
    pricePerKg: 7,
    iconKey: "express",
  },
  {
    id: "blanket",
    backendId: "b24f10fa4660ea38325b120a",
    label: "Blanket",
    bg: "#FFF8E6",
    pricePerKg: 5,
    iconKey: "blanket",
  },
];

// Maps the form's internal payment-method keys to the enum values the
// backend's Order schema actually accepts.
export const PAYMENT_METHOD_MAP = {
  cod: "cash",
  card: "card",
  apple: "apple_pay",
  google: "google_pay",
  paypal: "paypal",
};

export const TIMELINE_STEPS = [
  { key: "confirmed", label: "Order Confirmed" },
  { key: "assigned", label: "Rider Assigner" },
  { key: "arriving", label: "Rider Arriving" },
  { key: "picked", label: "Clothes Picked Up" },
  { key: "processing", label: "Laundry Processing" },
  { key: "delivery", label: "Order Delivery" },
];

export const RIDER = {
  name: "Frank Anderson",
  rating: 4,
  vehicle: "Suzuki Pickup (ALC - 1232 -24)",
  photo:
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=faces",
};

export function uid() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
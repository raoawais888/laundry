export const ORDER_STATUS_META = {
  pending: { label: "Pending", className: "admin-badge--amber" },
  available: { label: "Available", className: "admin-badge--blue" },
  accepted: { label: "Accepted", className: "admin-badge--indigo" },
  picked_up: { label: "Picked Up", className: "admin-badge--teal" },
  dropped_off: { label: "Dropped Off", className: "admin-badge--cyan" },
  delivered: { label: "Delivered", className: "admin-badge--green" },
  cancelled: { label: "Cancelled", className: "admin-badge--red" },
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_META);

export const PAYMENT_STATUS_META = {
  initiated: { label: "Initiated", className: "admin-badge--gray" },
  pending: { label: "Pending", className: "admin-badge--amber" },
  processing: { label: "Processing", className: "admin-badge--amber" },
  succeeded: { label: "Paid", className: "admin-badge--green" },
  failed: { label: "Failed", className: "admin-badge--red" },
  cancelled: { label: "Cancelled", className: "admin-badge--red" },
  refunded: { label: "Refunded", className: "admin-badge--indigo" },
  partially_refunded: { label: "Partial Refund", className: "admin-badge--indigo" },
};

export const formatNumber = (n) => new Intl.NumberFormat("en-US").format(n || 0);
export const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";
export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const StatusBadge = ({ status }) => {
  const meta = ORDER_STATUS_META[status] || { label: status || "—", className: "admin-badge--gray" };
  return <span className={`admin-badge ${meta.className}`}>{meta.label}</span>;
};

export const PaymentBadge = ({ status }) => {
  if (!status) return <span className="admin-badge admin-badge--gray">No Payment</span>;
  const meta = PAYMENT_STATUS_META[status] || { label: status, className: "admin-badge--gray" };
  return <span className={`admin-badge ${meta.className}`}>{meta.label}</span>;
};

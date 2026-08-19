export const USER_STATUS_META = {
  active: { label: "Active", className: "admin-badge--green" },
  blocked: { label: "Blocked", className: "admin-badge--red" },
  suspended: { label: "Suspended", className: "admin-badge--amber" },
};
export const USER_STATUSES = Object.keys(USER_STATUS_META);

export const RIDER_STATUS_META = {
  pending: { label: "Pending", className: "admin-badge--amber" },
  approved: { label: "Approved", className: "admin-badge--green" },
  suspended: { label: "Suspended", className: "admin-badge--red" },
  rejected: { label: "Rejected", className: "admin-badge--red" },
};
export const RIDER_STATUSES = Object.keys(RIDER_STATUS_META);

export const DOCUMENT_STATUS_META = {
  in_review: { label: "In Review", className: "admin-badge--amber" },
  passed: { label: "Passed", className: "admin-badge--green" },
  rejected: { label: "Rejected", className: "admin-badge--red" },
  not_submitted: { label: "Not Submitted", className: "admin-badge--gray" },
};

export const UserStatusBadge = ({ status }) => {
  const meta = USER_STATUS_META[status] || { label: status || "—", className: "admin-badge--gray" };
  return <span className={`admin-badge ${meta.className}`}>{meta.label}</span>;
};

export const RiderStatusBadge = ({ status }) => {
  const meta = RIDER_STATUS_META[status] || { label: status || "—", className: "admin-badge--gray" };
  return <span className={`admin-badge ${meta.className}`}>{meta.label}</span>;
};

export const DocumentStatusBadge = ({ status }) => {
  const meta = DOCUMENT_STATUS_META[status] || { label: status || "—", className: "admin-badge--gray" };
  return <span className={`admin-badge ${meta.className}`}>{meta.label}</span>;
};

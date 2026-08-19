import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { adminGetUserById, adminUpdateUserStatus } from "../../api";
import { UserStatusBadge } from "./peopleStatus";
import { StatusBadge, formatMoney, formatDateTime } from "./orderStatus";
import Tabs from "../../components/admin/Tabs";
import ConfirmModal from "../../components/admin/ConfirmModal";

const InfoRow = ({ label, value }) => (
  <div className="admin-info-row">
    <span className="admin-info-label">{label}</span>
    <span className="admin-info-value">{value ?? "—"}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="admin-detail-card">
    <div className="admin-detail-card-header">
      <div className="admin-detail-card-title">{title}</div>
    </div>
    {children}
  </div>
);

const AdminUserDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null); // "block" | "unblock" | "suspend"
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: res } = await adminGetUserById(id);
      setData(res);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load this user.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const applyStatus = async (status) => {
    try {
      setActionLoading(true);
      await adminUpdateUserStatus(id, status);
      toast.success("User status updated.");
      setConfirmAction(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update user status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) return <div className="admin-skeleton" style={{ height: 400 }} />;

  if (error && !data) {
    return (
      <div className="admin-error-state">
        <p>{error}</p>
        <button className="admin-btn admin-btn--primary" onClick={load}>Retry</button>
      </div>
    );
  }

  const { user, addresses, orders, reviews } = data;

  const overviewTab = (
    <>
      <Section title="Profile">
        <InfoRow label="Name" value={user.name} />
        <InfoRow label="Phone" value={user.phone} />
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Registered" value={formatDateTime(user.createdAt)} />
        <InfoRow label="Last Active" value={formatDateTime(user.lastLoginAt)} />
      </Section>
      <Section title="Stats">
        <InfoRow label="Total Orders" value={user.orderCount ?? 0} />
        <InfoRow label="Total Spending" value={formatMoney(user.totalSpending)} />
        <InfoRow label="Wallet Balance" value={formatMoney(user.walletBalance)} />
        <InfoRow label="Reward Points" value={user.rewardPoints ?? 0} />
        <InfoRow label="Membership" value={user.membership?.plan || "free"} />
      </Section>
    </>
  );

  const ordersTab = orders.length ? (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead><tr><th>Order #</th><th>Status</th><th>Amount</th><th>Created</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td className="admin-table-strong">
                <Link to={`/admin/orders/${o._id}`}>{o.orderNumber}</Link>
              </td>
              <td><StatusBadge status={o.status} /></td>
              <td>{formatMoney(o.pricing?.total || o.pricing?.estimatedTotal)}</td>
              <td>{formatDateTime(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : <p className="admin-muted">No orders yet.</p>;

  const addressesTab = addresses.length ? (
    addresses.map((a) => (
      <div key={a._id} className="admin-info-row">
        <span className="admin-info-label">{a.isDefault ? "Default" : "Address"}</span>
        <span className="admin-info-value">
          {[a.unitNumber, a.streetAddress, a.suburb, a.state, a.postcode].filter(Boolean).join(", ")}
        </span>
      </div>
    ))
  ) : <p className="admin-muted">No saved addresses.</p>;

  const reviewsTab = reviews.length ? (
    reviews.map((r) => (
      <div key={r._id} className="admin-info-row">
        <span className="admin-info-label">{formatDateTime(r.createdAt)}</span>
        <span className="admin-info-value">{r.overallRating ? `${r.overallRating}★ — ` : ""}{r.overallFeedback || r.laundryFeedback || r.riderFeedback || "No comment"}</span>
      </div>
    ))
  ) : <p className="admin-muted">No reviews written yet.</p>;

  return (
    <div className="admin-dashboard">
      <div className="admin-detail-header">
        <div>
          <Link to="/admin/users" className="admin-back-link">← Back to Users</Link>
          <h2 className="admin-detail-order-number">{user.name || user.phone}</h2>
          <div className="admin-detail-header-meta">
            <UserStatusBadge status={user.status} />
            <span className="admin-muted">Joined {formatDateTime(user.createdAt)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {user.status !== "active" && (
            <button className="admin-btn admin-btn--primary" onClick={() => setConfirmAction("active")}>Activate</button>
          )}
          {user.status !== "blocked" && (
            <button className="admin-btn admin-btn--danger" onClick={() => setConfirmAction("blocked")}>Block</button>
          )}
          {user.status !== "suspended" && (
            <button className="admin-btn" onClick={() => setConfirmAction("suspended")}>Suspend</button>
          )}
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "overview", label: "Overview", content: overviewTab },
          { key: "orders", label: `Orders (${orders.length})`, content: ordersTab },
          { key: "addresses", label: `Addresses (${addresses.length})`, content: <Section title="Saved Addresses">{addressesTab}</Section> },
          { key: "reviews", label: `Reviews (${reviews.length})`, content: <Section title="Reviews">{reviewsTab}</Section> },
        ]}
      />

      <ConfirmModal
        open={!!confirmAction}
        title={`${confirmAction === "active" ? "Activate" : confirmAction === "blocked" ? "Block" : "Suspend"} this user?`}
        message={`This will change ${user.name || user.phone}'s account status to "${confirmAction}".`}
        confirmLabel="Confirm"
        danger={confirmAction === "blocked"}
        loading={actionLoading}
        onConfirm={() => applyStatus(confirmAction)}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default AdminUserDetail;

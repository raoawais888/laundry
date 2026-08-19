import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminGetNotifications, adminGetNotificationStats, adminSendBroadcast } from "../../api";
import { formatNumber, formatDateTime } from "./orderStatus";

const PAGE_LIMIT = 15;
const BROADCAST_TYPES = [
  { value: "promotion", label: "Promotion" },
  { value: "system", label: "System / Announcement" },
  { value: "review_reminder", label: "Review Reminder" },
];
const TYPE_LABELS = {
  order_placed: "Order Placed", order_accepted: "Order Accepted", rider_assigned: "Rider Assigned",
  rider_arriving: "Rider Arriving", order_picked_up: "Order Picked Up", order_processing: "Order Processing",
  order_out_for_delivery: "Out for Delivery", order_delivered: "Order Delivered", order_cancelled: "Order Cancelled",
  payment_success: "Payment Success", payment_failed: "Payment Failed", refund_processed: "Refund Processed",
  wallet_credited: "Wallet Credited", wallet_debited: "Wallet Debited", otp: "OTP", promotion: "Promotion",
  referral_reward: "Referral Reward", review_reminder: "Review Reminder", system: "System",
};

const StatCard = ({ label, value, sublabel }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-label">{label}</div>
    <div className="admin-stat-value">{value}</div>
    {sublabel && <div className="admin-stat-sub">{sublabel}</div>}
  </div>
);

const emptyForm = { title: "", body: "", type: "promotion", target: "all_users" };

const BroadcastModal = ({ onClose, onSent }) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await adminSendBroadcast(form);
      toast.success(data.message);
      onSent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send broadcast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-title">Send Broadcast Notification</div>
        <p className="admin-modal-message" style={{ marginBottom: 14 }}>
          Delivers as an in-app notification to every account matching the target audience below. There is no push/SMS delivery yet — this only creates in-app records.
        </p>

        <label className="admin-side-label">Target Audience</label>
        <select className="admin-select admin-select--full" value={form.target} onChange={(e) => setField("target", e.target.value)} disabled={loading}>
          <option value="all_users">All Active Customers</option>
          <option value="all_riders">All Approved Riders</option>
        </select>

        <label className="admin-side-label" style={{ marginTop: 12 }}>Type</label>
        <select className="admin-select admin-select--full" value={form.type} onChange={(e) => setField("type", e.target.value)} disabled={loading}>
          {BROADCAST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <label className="admin-side-label" style={{ marginTop: 12 }}>Title</label>
        <input
          className="admin-select admin-select--full"
          type="text"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g. Weekend Special Offer"
          disabled={loading}
        />

        <label className="admin-side-label" style={{ marginTop: 12 }}>Message</label>
        <textarea
          className="admin-textarea"
          rows={3}
          value={form.body}
          onChange={(e) => setField("body", e.target.value)}
          placeholder="Write the notification message…"
          disabled={loading}
        />

        <div className="admin-modal-actions">
          <button className="admin-btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="admin-btn admin-btn--primary" onClick={submit} disabled={loading}>
            {loading ? "Sending..." : "Send Broadcast"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [recipientModel, setRecipientModel] = useState("");
  const [read, setRead] = useState("");
  const [page, setPage] = useState(1);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await adminGetNotificationStats();
      setStats(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load notification stats.");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminGetNotifications({
        page,
        limit: PAGE_LIMIT,
        recipientModel: recipientModel || undefined,
        read: read || undefined,
        search: search || undefined,
      });
      setNotifications(data.notifications);
      setPagination(data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load notifications.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, recipientModel, read, search]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRecipientModel("");
    setRead("");
    setPage(1);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {statsLoading || !stats ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="admin-stat-card admin-skeleton" style={{ height: 92 }} />)
        ) : (
          <>
            <StatCard label="Total Notifications" value={formatNumber(stats.total)} />
            <StatCard label="Unread" value={formatNumber(stats.unread)} />
            <StatCard label="Sent Today" value={formatNumber(stats.sentToday)} />
          </>
        )}
      </div>

      <div className="admin-filter-bar">
        <input
          className="admin-search-input admin-search-input--wide"
          type="text"
          placeholder="Search by title or message"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select className="admin-select" value={recipientModel} onChange={(e) => { setRecipientModel(e.target.value); setPage(1); }}>
          <option value="">All audiences</option>
          <option value="User">Customers</option>
          <option value="Rider">Riders</option>
          <option value="Admin">Admins</option>
        </select>

        <select className="admin-select" value={read} onChange={(e) => { setRead(e.target.value); setPage(1); }}>
          <option value="">Read & Unread</option>
          <option value="unread">Unread only</option>
          <option value="read">Read only</option>
        </select>

        {(search || recipientModel || read) && (
          <button type="button" className="admin-btn" onClick={clearFilters}>Clear filters</button>
        )}

        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setComposeOpen(true)} style={{ marginLeft: "auto" }}>
          + Send Broadcast
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card-title">
          Notifications {pagination.total ? <span className="admin-muted">({formatNumber(pagination.total)})</span> : null}
        </div>

        {error && !loading ? (
          <div className="admin-error-state">
            <p>{error}</p>
            <button className="admin-btn admin-btn--primary" onClick={loadNotifications}>Retry</button>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Audience</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={7}><div className="admin-skeleton" style={{ height: 20 }} /></td></tr>
                    ))
                  ) : notifications.length === 0 ? (
                    <tr><td colSpan={7} className="admin-table-empty">No notifications match these filters.</td></tr>
                  ) : (
                    notifications.map((n) => (
                      <tr key={n.id}>
                        <td className="admin-table-strong">{n.recipientName}</td>
                        <td>{n.recipientModel}</td>
                        <td>{n.title}</td>
                        <td className="admin-table-ellipsis" title={n.body}>{n.body}</td>
                        <td>{TYPE_LABELS[n.type] || n.type}</td>
                        <td>
                          <span className={`admin-badge ${n.isRead ? "admin-badge--gray" : "admin-badge--blue"}`}>
                            {n.isRead ? "Read" : "Unread"}
                          </span>
                        </td>
                        <td>{formatDateTime(n.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && pagination.totalPages > 1 && (
              <div className="admin-pagination">
                <button type="button" className="admin-btn" disabled={pagination.page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                  Previous
                </button>
                <span className="admin-pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
                <button type="button" className="admin-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {composeOpen && (
        <BroadcastModal
          onClose={() => setComposeOpen(false)}
          onSent={() => {
            setComposeOpen(false);
            loadNotifications();
            loadStats();
          }}
        />
      )}
    </div>
  );
};

export default AdminNotifications;

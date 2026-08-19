import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { adminGetPayments, adminGetPaymentStats } from "../../api";
import { PAYMENT_STATUS_META, PaymentBadge, formatMoney, formatNumber, formatDateTime } from "./orderStatus";

const PAGE_LIMIT = 15;
const GATEWAYS = ["stripe", "paypal", "apple_pay", "google_pay", "paystack", "cash", "wallet"];

const StatCard = ({ label, value, sublabel }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-label">{label}</div>
    <div className="admin-stat-value">{value}</div>
    {sublabel && <div className="admin-stat-sub">{sublabel}</div>}
  </div>
);

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [gateway, setGateway] = useState("");
  const [page, setPage] = useState(1);

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
      const { data } = await adminGetPaymentStats();
      setStats(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load payment stats.");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminGetPayments({
        page,
        limit: PAGE_LIMIT,
        status: status || undefined,
        gateway: gateway || undefined,
        search: search || undefined,
      });
      setPayments(data.payments);
      setPagination(data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load payments.";
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
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, gateway, search]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setGateway("");
    setPage(1);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-stat-grid">
        {statsLoading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="admin-stat-card admin-skeleton" style={{ height: 92 }} />)
        ) : (
          <>
            <StatCard label="Total Revenue" value={formatMoney(stats.totalRevenue)} sublabel={`${formatNumber(stats.successfulCount)} successful payments`} />
            <StatCard label="Pending" value={formatNumber(stats.pendingCount)} sublabel="Initiated, pending or processing" />
            <StatCard label="Failed / Cancelled" value={formatNumber(stats.failedCount)} />
            <StatCard label="Refunded" value={formatMoney(stats.refundedAmount)} sublabel={`${formatNumber(stats.refundedCount)} refund(s)`} />
          </>
        )}
      </div>

      <div className="admin-filter-bar">
        <input
          className="admin-search-input admin-search-input--wide"
          type="text"
          placeholder="Search by order #, customer or transaction ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select className="admin-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {Object.keys(PAYMENT_STATUS_META).map((s) => (
            <option key={s} value={s}>{PAYMENT_STATUS_META[s].label}</option>
          ))}
        </select>

        <select className="admin-select" value={gateway} onChange={(e) => { setGateway(e.target.value); setPage(1); }}>
          <option value="">All gateways</option>
          {GATEWAYS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {(search || status || gateway) && (
          <button type="button" className="admin-btn" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card-title">
          Payments {pagination.total ? <span className="admin-muted">({formatNumber(pagination.total)})</span> : null}
        </div>

        {error && !loading ? (
          <div className="admin-error-state">
            <p>{error}</p>
            <button className="admin-btn admin-btn--primary" onClick={loadPayments}>Retry</button>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Gateway</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Refund</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8}><div className="admin-skeleton" style={{ height: 20 }} /></td>
                      </tr>
                    ))
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="admin-table-empty">No payments match these filters.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id}>
                        <td className="admin-table-ellipsis" title={p.transactionId || ""}>{p.transactionId || "—"}</td>
                        <td className="admin-table-strong">
                          {p.order ? <Link to={`/admin/orders/${p.order.id}`}>{p.order.orderNumber}</Link> : "—"}
                        </td>
                        <td>{p.customer?.name || p.customer?.phone || "—"}</td>
                        <td>{p.gateway}</td>
                        <td>{formatMoney(p.amount)}</td>
                        <td><PaymentBadge status={p.status} /></td>
                        <td>{p.refundAmount > 0 ? formatMoney(p.refundAmount) : "—"}</td>
                        <td>{formatDateTime(p.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && pagination.totalPages > 1 && (
              <div className="admin-pagination">
                <button
                  type="button"
                  className="admin-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </button>
                <span className="admin-pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;

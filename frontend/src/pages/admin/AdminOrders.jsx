import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminGetOrders } from "../../api";
import { ORDER_STATUSES, ORDER_STATUS_META, StatusBadge, PaymentBadge, formatMoney, formatDateTime } from "./orderStatus";

const PAGE_LIMIT = 15;

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminGetOrders({
        page,
        limit: PAGE_LIMIT,
        status: status || undefined,
        search: search || undefined,
      });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load orders.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-filter-bar">
        <input
          className="admin-search-input admin-search-input--wide"
          type="text"
          placeholder="Search by order #, customer name or phone"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select className="admin-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_META[s].label}</option>
          ))}
        </select>

        {(search || status) && (
          <button type="button" className="admin-btn" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card-title">
          Orders {pagination.total ? <span className="admin-muted">({formatCount(pagination.total)})</span> : null}
        </div>

        {error && !loading ? (
          <div className="admin-error-state">
            <p>{error}</p>
            <button className="admin-btn admin-btn--primary" onClick={load}>Retry</button>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Pickup Address</th>
                    <th>Rider</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8}><div className="admin-skeleton" style={{ height: 20 }} /></td>
                      </tr>
                    ))
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="admin-table-empty">No orders match these filters.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="admin-table-row--link"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        <td className="admin-table-strong">{order.orderNumber}</td>
                        <td>{order.customer?.name || order.customer?.phone || "—"}</td>
                        <td className="admin-table-ellipsis" title={order.pickupAddress || ""}>{order.pickupAddress || "—"}</td>
                        <td>{order.rider?.name || "Unassigned"}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td><PaymentBadge status={order.paymentStatus} /></td>
                        <td>{formatMoney(order.amount)}</td>
                        <td>{formatDateTime(order.createdAt)}</td>
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

const formatCount = (n) => new Intl.NumberFormat("en-US").format(n);

export default AdminOrders;

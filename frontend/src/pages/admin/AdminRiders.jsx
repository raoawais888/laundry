import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminGetRiders } from "../../api";
import { RIDER_STATUSES, RIDER_STATUS_META, RiderStatusBadge } from "./peopleStatus";
import { formatMoney } from "./orderStatus";

const PAGE_LIMIT = 15;

const AdminRiders = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

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
      const { data } = await adminGetRiders({
        page,
        limit: PAGE_LIMIT,
        status: status || undefined,
        search: search || undefined,
      });
      setRiders(data.riders);
      setPagination(data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load riders.";
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
          placeholder="Search by name, phone or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select className="admin-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {RIDER_STATUSES.map((s) => (
            <option key={s} value={s}>{RIDER_STATUS_META[s].label}</option>
          ))}
        </select>

        {(search || status) && (
          <button type="button" className="admin-btn" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card-title">
          Riders {pagination.total ? <span className="admin-muted">({pagination.total})</span> : null}
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
                    <th>Rider</th>
                    <th>Phone</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th>Online</th>
                    <th>Completed</th>
                    <th>Rating</th>
                    <th>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8}><div className="admin-skeleton" style={{ height: 20 }} /></td>
                      </tr>
                    ))
                  ) : riders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="admin-table-empty">No riders match these filters.</td>
                    </tr>
                  ) : (
                    riders.map((rider) => (
                      <tr
                        key={rider.id}
                        className="admin-table-row--link"
                        onClick={() => navigate(`/admin/riders/${rider.id}`)}
                      >
                        <td className="admin-table-strong">{rider.name}</td>
                        <td>{rider.phone}</td>
                        <td>{rider.vehicleType || "—"}</td>
                        <td><RiderStatusBadge status={rider.accountStatus} /></td>
                        <td>
                          <span className={`admin-badge ${rider.isOnline ? "admin-badge--green" : "admin-badge--gray"}`}>
                            {rider.isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td>{rider.completedOrders}</td>
                        <td>{rider.rating ? `${rider.rating}★` : "—"}</td>
                        <td>{formatMoney(rider.earnings)}</td>
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

export default AdminRiders;

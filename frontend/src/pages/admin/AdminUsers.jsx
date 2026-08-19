import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { adminGetUsers } from "../../api";
import { USER_STATUSES, USER_STATUS_META, UserStatusBadge } from "./peopleStatus";
import { formatMoney, formatDateTime } from "./orderStatus";

const PAGE_LIMIT = 15;

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
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
      const { data } = await adminGetUsers({
        page,
        limit: PAGE_LIMIT,
        status: status || undefined,
        search: search || undefined,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load users.";
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
          {USER_STATUSES.map((s) => (
            <option key={s} value={s}>{USER_STATUS_META[s].label}</option>
          ))}
        </select>

        {(search || status) && (
          <button type="button" className="admin-btn" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card-title">
          Users {pagination.total ? <span className="admin-muted">({pagination.total})</span> : null}
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
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7}><div className="admin-skeleton" style={{ height: 20 }} /></td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table-empty">No users match these filters.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="admin-table-row--link"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                      >
                        <td className="admin-table-strong">{user.name || "—"}</td>
                        <td>{user.phone}</td>
                        <td>{user.email || "—"}</td>
                        <td>{formatDateTime(user.createdAt)}</td>
                        <td>{user.orderCount ?? 0}</td>
                        <td>{formatMoney(user.totalSpending)}</td>
                        <td><UserStatusBadge status={user.status} /></td>
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

export default AdminUsers;

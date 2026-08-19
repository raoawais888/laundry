import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  adminGetReviews,
  adminGetReviewStats,
  adminUpdateReviewVisibility,
  adminReplyToReview,
  adminDeleteReview,
} from "../../api";
import { formatNumber, formatDateTime } from "./orderStatus";
import ConfirmModal from "../../components/admin/ConfirmModal";

const PAGE_LIMIT = 15;

const StatCard = ({ label, value, sublabel }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-label">{label}</div>
    <div className="admin-stat-value">{value}</div>
    {sublabel && <div className="admin-stat-sub">{sublabel}</div>}
  </div>
);

const Stars = ({ value }) => (
  <span className="admin-stars">{value ? `${value}★` : "—"}</span>
);

const truncate = (text, len = 80) =>
  !text ? "" : text.length > len ? `${text.slice(0, len)}…` : text;

const ReviewModal = ({ review, onClose, onReplySent }) => {
  const [reply, setReply] = useState(review.adminReply || "");
  const [loading, setLoading] = useState(false);

  const submitReply = async () => {
    if (!reply.trim()) {
      toast.error("Write a reply first.");
      return;
    }
    try {
      setLoading(true);
      await adminReplyToReview(review.id, reply.trim());
      toast.success("Reply posted.");
      onReplySent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-title">Review from {review.customer?.name || review.customer?.phone || "a customer"}</div>

        <div className="admin-info-row">
          <span className="admin-info-label">Order</span>
          <span className="admin-info-value">{review.order?.orderNumber || "—"}</span>
        </div>
        <div className="admin-info-row">
          <span className="admin-info-label">Rider</span>
          <span className="admin-info-value">{review.rider?.name || "—"}</span>
        </div>
        <div className="admin-info-row">
          <span className="admin-info-label">Date</span>
          <span className="admin-info-value">{formatDateTime(review.createdAt)}</span>
        </div>

        <div className="admin-review-block">
          <div className="admin-review-block-title">Overall — <Stars value={review.overallRating} /></div>
          <p>{review.overallFeedback || "No comment."}</p>
        </div>
        <div className="admin-review-block">
          <div className="admin-review-block-title">Rider — <Stars value={review.riderRating} /></div>
          <p>{review.riderFeedback || "No comment."}</p>
        </div>
        <div className="admin-review-block">
          <div className="admin-review-block-title">Laundry — <Stars value={review.laundryRating} /></div>
          <p>{review.laundryFeedback || "No comment."}</p>
        </div>

        {review.isFlagged && (
          <div className="admin-doc-card-meta--danger" style={{ marginBottom: 10 }}>
            Flagged{review.flagReason ? `: ${review.flagReason}` : ""}
          </div>
        )}

        <label className="admin-side-label">Admin Reply</label>
        <textarea
          className="admin-textarea"
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply visible to the customer…"
          disabled={loading}
        />
        {review.adminRepliedAt && (
          <div className="admin-muted" style={{ fontSize: "0.75rem", marginTop: 4 }}>
            Last replied {formatDateTime(review.adminRepliedAt)}
          </div>
        )}

        <div className="admin-modal-actions">
          <button className="admin-btn" onClick={onClose} disabled={loading}>Close</button>
          <button className="admin-btn admin-btn--primary" onClick={submitReply} disabled={loading}>
            {loading ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [visibility, setVisibility] = useState("");
  const [page, setPage] = useState(1);

  const [activeReview, setActiveReview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

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
      const { data } = await adminGetReviewStats();
      setStats(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load review stats.");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminGetReviews({
        page,
        limit: PAGE_LIMIT,
        rating: rating || undefined,
        visibility: visibility || undefined,
        search: search || undefined,
      });
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load reviews.";
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
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rating, visibility, search]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRating("");
    setVisibility("");
    setPage(1);
  };

  const toggleVisibility = async (review) => {
    try {
      setTogglingId(review.id);
      await adminUpdateReviewVisibility(review.id, !review.isVisible);
      toast.success(review.isVisible ? "Review hidden." : "Review shown.");
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update review.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await adminDeleteReview(deleteTarget.id);
      toast.success("Review deleted.");
      setDeleteTarget(null);
      loadReviews();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete review.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-stat-grid">
        {statsLoading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="admin-stat-card admin-skeleton" style={{ height: 92 }} />)
        ) : (
          <>
            <StatCard label="Average Rating" value={stats.averageRating ? `${stats.averageRating}★` : "—"} sublabel={`${formatNumber(stats.totalReviews)} total reviews`} />
            <StatCard label="5★ Reviews" value={formatNumber(stats.breakdown[5])} />
            <StatCard label="4★ Reviews" value={formatNumber(stats.breakdown[4])} />
            <StatCard label="3★ & Below" value={formatNumber(stats.breakdown[3] + stats.breakdown[2] + stats.breakdown[1])} />
          </>
        )}
      </div>

      <div className="admin-filter-bar">
        <input
          className="admin-search-input admin-search-input--wide"
          type="text"
          placeholder="Search by customer, order # or review text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select className="admin-select" value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}>
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((s) => (
            <option key={s} value={s}>{s}★</option>
          ))}
        </select>

        <select className="admin-select" value={visibility} onChange={(e) => { setVisibility(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
          <option value="flagged">Flagged</option>
        </select>

        {(search || rating || visibility) && (
          <button type="button" className="admin-btn" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card-title">
          Reviews {pagination.total ? <span className="admin-muted">({formatNumber(pagination.total)})</span> : null}
        </div>

        {error && !loading ? (
          <div className="admin-error-state">
            <p>{error}</p>
            <button className="admin-btn admin-btn--primary" onClick={loadReviews}>Retry</button>
          </div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Order #</th>
                    <th>Rider</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8}><div className="admin-skeleton" style={{ height: 20 }} /></td>
                      </tr>
                    ))
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="admin-table-empty">No reviews match these filters.</td>
                    </tr>
                  ) : (
                    reviews.map((r) => (
                      <tr key={r.id}>
                        <td>{r.customer?.name || r.customer?.phone || "—"}</td>
                        <td className="admin-table-strong">
                          {r.order ? <Link to={`/admin/orders/${r.order.id}`}>{r.order.orderNumber}</Link> : "—"}
                        </td>
                        <td>{r.rider?.name || "—"}</td>
                        <td><Stars value={r.overallRating} /></td>
                        <td className="admin-table-ellipsis" title={r.overallFeedback || ""}>{truncate(r.overallFeedback) || "—"}</td>
                        <td>{formatDateTime(r.createdAt)}</td>
                        <td>
                          <span className={`admin-badge ${r.isVisible ? "admin-badge--green" : "admin-badge--gray"}`}>
                            {r.isVisible ? "Visible" : "Hidden"}
                          </span>
                          {r.isFlagged && <span className="admin-badge admin-badge--red" style={{ marginLeft: 6 }}>Flagged</span>}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button className="admin-btn admin-btn--sm" onClick={() => setActiveReview(r)}>View</button>
                            <button className="admin-btn admin-btn--sm" onClick={() => toggleVisibility(r)} disabled={togglingId === r.id}>
                              {r.isVisible ? "Hide" : "Show"}
                            </button>
                            <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => setDeleteTarget(r)}>Delete</button>
                          </div>
                        </td>
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

      {activeReview && (
        <ReviewModal
          review={activeReview}
          onClose={() => setActiveReview(null)}
          onReplySent={() => {
            setActiveReview(null);
            loadReviews();
          }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this review?"
        message="This permanently removes the review and recalculates the rider's rating. This cannot be undone."
        confirmLabel="Delete Review"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminReviews;

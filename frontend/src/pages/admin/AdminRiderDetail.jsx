import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { adminGetRiderById, adminUpdateRiderStatus, fileUrl } from "../../api";
import { RiderStatusBadge, DocumentStatusBadge } from "./peopleStatus";
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

const riderName = (r) => r.fullLegalName || [r.firstName, r.lastName].filter(Boolean).join(" ") || r.phone;

const DocThumb = ({ path, label }) => {
  if (!path) return null;
  return (
    <a className="admin-doc-thumb" href={fileUrl(path)} target="_blank" rel="noopener noreferrer">
      <img src={fileUrl(path)} alt={label} loading="lazy" />
      <span className="admin-doc-thumb-label">{label}</span>
    </a>
  );
};

const AdminRiderDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null); // "approved" | "rejected" | "suspended"
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: res } = await adminGetRiderById(id);
      setData(res);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load this rider.";
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
      await adminUpdateRiderStatus(id, status);
      toast.success("Rider status updated.");
      setConfirmAction(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update rider status.");
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

  const { rider, vehicle, documents, orders, earnings, reviews } = data;

  const overviewTab = (
    <>
      <Section title="Profile">
        {rider.avatar && (
          <div className="admin-doc-thumbs" style={{ marginBottom: 12 }}>
            <DocThumb path={rider.avatar} label="Profile Photo" />
          </div>
        )}
        <InfoRow label="Name" value={riderName(rider)} />
        <InfoRow label="Phone" value={rider.phone} />
        <InfoRow label="Email" value={rider.email} />
        <InfoRow label="Address" value={rider.address} />
        <InfoRow label="Online" value={rider.isOnline ? "Online" : "Offline"} />
        <InfoRow label="Rating" value={rider.rating ? `${rider.rating}★ (${rider.ratingCount || 0} reviews)` : "No ratings yet"} />
      </Section>

      <Section title="Verification">
        <InfoRow label="ID Check" value={<DocumentStatusBadge status={rider.verification?.idCheck?.status} />} />
        <InfoRow label="Police Check" value={<DocumentStatusBadge status={rider.verification?.policeCheck?.status} />} />
        <InfoRow label="Work Rights" value={<DocumentStatusBadge status={rider.verification?.workRights?.status} />} />
        <InfoRow label="Vehicle Check" value={<DocumentStatusBadge status={rider.verification?.vehicleCheck?.status} />} />
      </Section>

      <Section title="Vehicle">
        {vehicle ? (
          <>
            <InfoRow label="Type" value={vehicle.vehicleType} />
            <InfoRow label="Registration #" value={vehicle.registrationNumber} />
            <InfoRow label="Status" value={<DocumentStatusBadge status={vehicle.status} />} />
            {(vehicle.insuranceFront || vehicle.insuranceBack || vehicle.vehiclePhotos?.length > 0) && (
              <div className="admin-doc-thumbs">
                <DocThumb path={vehicle.insuranceFront} label="Insurance (Front)" />
                <DocThumb path={vehicle.insuranceBack} label="Insurance (Back)" />
                {vehicle.vehiclePhotos?.map((p, i) => (
                  <DocThumb key={i} path={p} label={`Vehicle Photo ${i + 1}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="admin-muted">No vehicle on file.</p>
        )}
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

  const earningsTab = (
    <>
      <InfoRow label="Available (Completed)" value={formatMoney(earnings.completed)} />
      <InfoRow label="Pending Payout" value={formatMoney(earnings.pending)} />
    </>
  );

  const documentsTab = documents.length ? (
    <div className="admin-doc-grid">
      {documents.map((d) => (
        <div key={d._id} className="admin-doc-card">
          <div className="admin-doc-card-header">
            <span className="admin-doc-card-title">{d.docType.replace(/_/g, " ")}</span>
            <DocumentStatusBadge status={d.status} />
          </div>
          {d.documentNumber && <div className="admin-doc-card-meta">No. {d.documentNumber}</div>}
          {d.expiryDate && <div className="admin-doc-card-meta">Expires {formatDateTime(d.expiryDate)}</div>}
          {d.status === "rejected" && d.rejectionReason && (
            <div className="admin-doc-card-meta admin-doc-card-meta--danger">Rejected: {d.rejectionReason}</div>
          )}
          <div className="admin-doc-thumbs">
            <DocThumb path={d.frontImage} label="Front" />
            <DocThumb path={d.backImage} label="Back" />
            {!d.frontImage && !d.backImage && <span className="admin-muted">No image uploaded.</span>}
          </div>
        </div>
      ))}
    </div>
  ) : <p className="admin-muted">No documents uploaded yet.</p>;

  const reviewsTab = reviews.length ? (
    reviews.map((r) => (
      <div key={r._id} className="admin-info-row">
        <span className="admin-info-label">{formatDateTime(r.createdAt)}</span>
        <span className="admin-info-value">{r.riderRating ? `${r.riderRating}★ — ` : ""}{r.riderFeedback || "No comment"}</span>
      </div>
    ))
  ) : <p className="admin-muted">No reviews yet.</p>;

  return (
    <div className="admin-dashboard">
      <div className="admin-detail-header">
        <div>
          <Link to="/admin/riders" className="admin-back-link">← Back to Riders</Link>
          <h2 className="admin-detail-order-number">{riderName(rider)}</h2>
          <div className="admin-detail-header-meta">
            <RiderStatusBadge status={rider.accountStatus} />
            <span className="admin-muted">Joined {formatDateTime(rider.createdAt)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {rider.accountStatus !== "approved" && (
            <button className="admin-btn admin-btn--primary" onClick={() => setConfirmAction("approved")}>Approve</button>
          )}
          {rider.accountStatus === "pending" && (
            <button className="admin-btn admin-btn--danger" onClick={() => setConfirmAction("rejected")}>Reject</button>
          )}
          {rider.accountStatus !== "suspended" && rider.accountStatus !== "pending" && (
            <button className="admin-btn" onClick={() => setConfirmAction("suspended")}>Suspend</button>
          )}
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "overview", label: "Overview", content: overviewTab },
          { key: "orders", label: `Orders (${orders.length})`, content: ordersTab },
          { key: "earnings", label: "Earnings", content: <Section title="Earnings">{earningsTab}</Section> },
          { key: "documents", label: `Documents (${documents.length})`, content: <Section title="Documents">{documentsTab}</Section> },
          { key: "reviews", label: `Reviews (${reviews.length})`, content: <Section title="Reviews">{reviewsTab}</Section> },
        ]}
      />

      <ConfirmModal
        open={!!confirmAction}
        title={`${confirmAction === "approved" ? "Approve" : confirmAction === "rejected" ? "Reject" : "Suspend"} this rider?`}
        message={`This will change ${riderName(rider)}'s account status to "${confirmAction}".`}
        confirmLabel="Confirm"
        danger={confirmAction === "rejected" || confirmAction === "suspended"}
        loading={actionLoading}
        onConfirm={() => applyStatus(confirmAction)}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};

export default AdminRiderDetail;

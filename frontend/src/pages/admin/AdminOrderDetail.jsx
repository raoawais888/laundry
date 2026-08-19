import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  adminGetOrderById,
  adminGetAssignableRiders,
  adminUpdateOrderStatus,
  adminAssignRider,
  adminCancelOrder,
} from "../../api";
import {
  ORDER_STATUSES,
  ORDER_STATUS_META,
  StatusBadge,
  PaymentBadge,
  formatMoney,
  formatDateTime,
} from "./orderStatus";
import ConfirmModal from "../../components/admin/ConfirmModal";

const CANCELLABLE = (status) => status !== "delivered" && status !== "cancelled";

const InfoRow = ({ label, value }) => (
  <div className="admin-info-row">
    <span className="admin-info-label">{label}</span>
    <span className="admin-info-value">{value ?? "—"}</span>
  </div>
);

const Section = ({ title, children, action }) => (
  <div className="admin-detail-card">
    <div className="admin-detail-card-header">
      <div className="admin-detail-card-title">{title}</div>
      {action}
    </div>
    {children}
  </div>
);

const AdminOrderDetail = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminGetOrderById(id);
      setOrder(data.order);
      setSelectedStatus(data.order.status);
      setSelectedRider(data.order.rider?._id || "");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load this order.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    adminGetAssignableRiders()
      .then(({ data }) => setRiders(data.riders))
      .catch(() => {}); // rider list is a convenience — a failure here shouldn't block the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssignRider = async () => {
    if (!selectedRider) {
      toast.error("Choose a rider first.");
      return;
    }
    try {
      setAssigning(true);
      await adminAssignRider(id, selectedRider);
      toast.success("Rider assigned.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not assign rider.");
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) return;
    try {
      setUpdatingStatus(true);
      await adminUpdateOrderStatus(id, selectedStatus);
      toast.success("Order status updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await adminCancelOrder(id, "Cancelled by admin");
      toast.success("Order cancelled.");
      setCancelOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel order.");
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return <div className="admin-skeleton" style={{ height: 400 }} />;
  }

  if (error && !order) {
    return (
      <div className="admin-error-state">
        <p>{error}</p>
        <button className="admin-btn admin-btn--primary" onClick={load}>Retry</button>
      </div>
    );
  }

  const rider = order.rider;
  const customer = order.customer;

  return (
    <div className="admin-dashboard">
      <div className="admin-detail-header">
        <div>
          <Link to="/admin/orders" className="admin-back-link">← Back to Orders</Link>
          <h2 className="admin-detail-order-number">{order.orderNumber}</h2>
          <div className="admin-detail-header-meta">
            <StatusBadge status={order.status} />
            <span className="admin-muted">Created {formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        {CANCELLABLE(order.status) && (
          <button className="admin-btn admin-btn--danger" onClick={() => setCancelOpen(true)}>
            Cancel Order
          </button>
        )}
      </div>

      <div className="admin-detail-grid">
        <div className="admin-detail-main">
          <Section title="Customer">
            <InfoRow label="Name" value={customer?.name} />
            <InfoRow label="Phone" value={customer?.phone} />
            <InfoRow label="Email" value={customer?.email} />
          </Section>

          <Section title="Pickup & Delivery">
            <InfoRow label="Pickup Address" value={order.pickupAddress?.fullAddress} />
            <InfoRow label="Pickup Slot" value={formatSlot(order.pickupSlot)} />
            <InfoRow label="Delivery Address" value={order.deliveryAddress?.fullAddress} />
            <InfoRow label="Delivery Slot" value={formatSlot(order.deliverySlot)} />
            <InfoRow label="Special Instructions" value={order.specialInstructions} />
          </Section>

          <Section title="Items">
            {order.items?.length ? (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Est. Total</th></tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.serviceName || item.name || "Item"}</td>
                        <td>{item.estimatedQty ?? "—"}</td>
                        <td>{formatMoney(item.unitPrice)}</td>
                        <td>{formatMoney(item.estimatedPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-muted">No items recorded.</p>
            )}
          </Section>

          <Section title="Pricing">
            <InfoRow label="Subtotal" value={formatMoney(order.pricing?.subtotal)} />
            <InfoRow label="Delivery Fee" value={formatMoney(order.pricing?.deliveryFee)} />
            <InfoRow label="Express Fee" value={formatMoney(order.pricing?.expressFee)} />
            <InfoRow label="Discount" value={formatMoney(order.pricing?.couponDiscount)} />
            <InfoRow label="Tax" value={formatMoney(order.pricing?.tax)} />
            <InfoRow label="Total" value={formatMoney(order.pricing?.total || order.pricing?.estimatedTotal)} />
          </Section>

          <Section title="Payments">
            {order.payments?.length ? (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr><th>Gateway</th><th>Status</th><th>Amount</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {order.payments.map((p) => (
                      <tr key={p._id}>
                        <td>{p.gateway}</td>
                        <td><PaymentBadge status={p.status} /></td>
                        <td>{formatMoney(p.amount)}</td>
                        <td>{formatDateTime(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-muted">No payment records yet.</p>
            )}
          </Section>

          {order.status === "cancelled" && (
            <Section title="Cancellation">
              <InfoRow label="Cancelled By" value={order.cancelledBy} />
              <InfoRow label="Reason" value={order.cancellationReason} />
              <InfoRow label="Cancelled At" value={formatDateTime(order.cancelledAt)} />
            </Section>
          )}

          <Section title="Timeline">
            <ul className="admin-timeline">
              {order.timeline.map((step, i) => (
                <li key={i} className="admin-timeline-item">
                  <span className="admin-timeline-dot" />
                  <div>
                    <div className="admin-timeline-label">{step.label}</div>
                    <div className="admin-timeline-time">{formatDateTime(step.at)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="admin-detail-side">
          <Section title="Rider">
            {rider ? (
              <>
                <InfoRow label="Name" value={rider.fullLegalName || [rider.firstName, rider.lastName].filter(Boolean).join(" ")} />
                <InfoRow label="Phone" value={rider.phone} />
              </>
            ) : (
              <p className="admin-muted">No rider assigned yet.</p>
            )}

            {CANCELLABLE(order.status) && (
              <div className="admin-side-control">
                <label className="admin-side-label">Assign / Reassign Rider</label>
                <select className="admin-select admin-select--full" value={selectedRider} onChange={(e) => setSelectedRider(e.target.value)}>
                  <option value="">Choose a rider…</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}{r.isOnline ? " · online" : ""}</option>
                  ))}
                </select>
                <button className="admin-btn admin-btn--primary admin-btn--full" onClick={handleAssignRider} disabled={assigning}>
                  {assigning ? "Assigning..." : "Assign Rider"}
                </button>
              </div>
            )}
          </Section>

          <Section title="Order Status">
            {CANCELLABLE(order.status) ? (
              <div className="admin-side-control">
                <label className="admin-side-label">Change Status</label>
                <select className="admin-select admin-select--full" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  {ORDER_STATUSES.filter((s) => s !== "cancelled").map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_META[s].label}</option>
                  ))}
                </select>
                <button
                  className="admin-btn admin-btn--primary admin-btn--full"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || selectedStatus === order.status}
                >
                  {updatingStatus ? "Updating..." : "Update Status"}
                </button>
              </div>
            ) : (
              <p className="admin-muted">Status is final and can no longer be changed.</p>
            )}
          </Section>
        </div>
      </div>

      <ConfirmModal
        open={cancelOpen}
        title="Cancel this order?"
        message={`This will mark ${order.orderNumber} as cancelled. This cannot be undone.`}
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        danger
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
};

const formatSlot = (slot) => {
  if (!slot) return null;
  if (typeof slot === "string") return slot;
  const parts = [slot.date, slot.time || slot.label].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
};

export default AdminOrderDetail;

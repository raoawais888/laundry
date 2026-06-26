import { useState } from "react";
import { Screen, BackHeader, BottomNav } from "../Layout";
import { styles } from "./Styles";

// The real order from the backend stores pickupSlot/deliverySlot as
// { date, slotStart, slotEnd, slotLabel } — not a plain string. Rendering
// the object directly crashes React ("Objects are not valid as a React
// child"), so format it into display text instead. slotLabel already has
// a human-readable string in it, so prefer that when present.
function formatSlot(slot) {
  if (!slot) return "—";
  if (typeof slot === "string") return slot; // tolerate old mock-data shape too
  if (slot.slotLabel) return slot.slotLabel;
  const datePart = slot.date ? new Date(slot.date).toLocaleDateString() : "";
  const timePart = slot.slotStart && slot.slotEnd ? `${slot.slotStart}–${slot.slotEnd}` : "";
  return [datePart, timePart].filter(Boolean).join(" · ") || "—";
}

export default function BookingConfirmedScreen({ order, onNavigate }) {
  const [cancelled, setCancelled] = useState(false);

  if (!order) {
    return (
      <Screen>
        <BackHeader title="Order Confirmed" onBack={() => onNavigate("home")} />
        <div style={{ ...styles.body, alignItems: "center", paddingTop: 60 }}>
          <p style={{ color: "#777" }}>No active order yet.</p>
          <button style={styles.trackBtn} onClick={() => onNavigate("create-order")}>
            Create an Order
          </button>
        </div>
        <BottomNav active="orders" onNavigate={onNavigate} />
      </Screen>
    );
  }

  // Real order shape has no top-level `service`/`amount` — services live in
  // items[], and the total lives in pricing.estimatedTotal. Falling back to
  // the old flat fields too, so this still works if an older mock order
  // shape ever gets passed in.
  const serviceLabel =
    order.service || order.items?.map((i) => i.serviceName).filter(Boolean).join(", ") || "—";
  const amount = order.amount ?? order.pricing?.estimatedTotal ?? 0;
  const displayId = order.orderNumber || order.id || order._id || "—";

  return (
    <Screen>
      <div style={styles.headerGradient}>
        <h2 style={styles.headerTitle}>Order Confirmed</h2>
        <svg style={styles.headerTuck} width="36" height="36" viewBox="0 0 36 36">
          <path d="M36 0 V36 H0 C20 36 36 20 36 0 Z" fill="#f4f5f9" />
        </svg>
      </div>

      <div style={{ ...styles.body, alignItems: "center" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={styles.checkCircle}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h1 style={styles.title}>{cancelled ? "Order Cancelled" : "Booking Confirmed !"}</h1>
        <p style={styles.orderId}>Order #{displayId}</p>

        {!cancelled && (
          <div style={styles.riderBanner}>
            <span style={styles.riderText}>Rider arriving in 10 ~ 15 mins</span>
          </div>
        )}

        <div style={{ ...styles.card, width: "100%" }}>
          <div style={styles.cardRow}>
            <span style={styles.cardLabel}>Service</span>
            <span style={styles.cardValue}>{serviceLabel}</span>
          </div>
          <div style={styles.cardRow}>
            <span style={styles.cardLabel}>Pickup</span>
            <span style={styles.cardValue}>{formatSlot(order.pickupSlot)}</span>
          </div>
          <div style={styles.cardRow}>
            <span style={styles.cardLabel}>Estimated Delivery</span>
            <span style={styles.cardValue}>{formatSlot(order.deliverySlot)}</span>
          </div>
          <div style={{ ...styles.cardRow, borderBottom: "none" }}>
            <span style={styles.cardLabel}>Amount</span>
            <span style={styles.cardAmount}>{amount}$</span>
          </div>
        </div>

        {!cancelled && (
          <>
            <button style={styles.trackBtn} onClick={() => onNavigate("tracking")}>
              Track Order
            </button>
            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
              <button style={styles.cancelBtn} onClick={() => setCancelled(true)}>
                Cancel Order
              </button>
            </div>
          </>
        )}
        {cancelled && (
          <button style={styles.trackBtn} onClick={() => onNavigate("create-order")}>
            Book Again
          </button>
        )}
      </div>

      <BottomNav active="orders" onNavigate={onNavigate} />
    </Screen>
  );
}
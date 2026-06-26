import { IconAvatar } from "../../components/Icons";
import { Screen, BottomNav } from "../Layout.jsx";
import { styles } from "./Styles.js";

/* ────────────────────────────────────────────────────────────
   Shared placeholder shell used by Orders / Support / Profile
──────────────────────────────────────────────────────────── */

export function PlaceholderScreen({ title, navKey, onNavigate, children }) {
  return (
    <Screen>
      <div style={styles.headerGradient}>
        <h2 style={styles.headerTitle}>{title}</h2>
        <svg style={styles.headerTuck} width="36" height="36" viewBox="0 0 36 36">
          <path d="M36 0 V36 H0 C20 36 36 20 36 0 Z" fill="#f4f5f9" />
        </svg>
      </div>
      <div style={{ ...styles.body, alignItems: "center", paddingTop: 60 }}>{children}</div>
      <BottomNav active={navKey} onNavigate={onNavigate} />
    </Screen>
  );
}

export function OrdersScreen({ order, onNavigate }) {
  return (
    <PlaceholderScreen title="Orders" navKey="orders" onNavigate={onNavigate}>
      {order ? (
        <div style={{ width: "100%" }}>
          <div style={styles.card}>
            <div style={styles.cardRow}>
              <span style={styles.cardLabel}>Order</span>
              <span style={styles.cardValue}>#{order.id}</span>
            </div>
            <div style={styles.cardRow}>
              <span style={styles.cardLabel}>Service</span>
              <span style={styles.cardValue}>{order.service}</span>
            </div>
            <div style={{ ...styles.cardRow, borderBottom: "none" }}>
              <span style={styles.cardLabel}>Amount</span>
              <span style={styles.cardAmount}>{order.amount}$</span>
            </div>
          </div>
          <button style={styles.trackBtn} onClick={() => onNavigate("tracking")}>
            Track this Order
          </button>
          <button style={{ ...styles.bookServiceBtn, marginTop: 12 }} onClick={() => onNavigate("create-order")}>
            Create New Order
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: "#777", marginBottom: 20 }}>You have no orders yet.</p>
          <button style={styles.bookServiceBtn} onClick={() => onNavigate("create-order")}>
            Book Service
          </button>
        </>
      )}
    </PlaceholderScreen>
  );
}

export function SupportScreen({ onNavigate }) {
  return (
    <PlaceholderScreen title="Support" navKey="support" onNavigate={onNavigate}>
      <p style={{ color: "#777", textAlign: "center" }}>
        Need help with an order, payment, or your account?
        <br />
        Our team usually replies within an hour.
      </p>
      <button style={{ ...styles.bookServiceBtn, marginTop: 20 }}>Start a Chat</button>
    </PlaceholderScreen>
  );
}

export function ProfileScreen({ user, onNavigate, onLogout }) {
  return (
    <PlaceholderScreen title="Profile" navKey="profile" onNavigate={onNavigate}>
      <div style={{ ...styles.checkCircle, background: "#3B4FBF" }}>
        <IconAvatar />
      </div>
      <h1 style={{ ...styles.title, marginTop: 16 }}>{user.name}</h1>
      <p style={styles.orderId}>{user.email}</p>
      <button style={{ ...styles.cancelBtn, marginTop: 24, textDecoration: "underline" }} onClick={onLogout}>
        Log out
      </button>
    </PlaceholderScreen>
  );
}
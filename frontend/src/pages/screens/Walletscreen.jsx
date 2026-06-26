import { useState } from "react";
import { uid } from "../Constants.js";
import { IconLogout, IconBell, IconAvatar, IconTrash } from "../../components/Icons";
import { Screen, BottomNav } from "../Layout.jsx";
import { styles } from "./Styles.js";

export default function WalletScreen({ user, onLogout, onNavigate, paymentMethods, setPaymentMethods }) {
  const [showAdd, setShowAdd] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  function removeMethod(id) {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  }

  function addMethod() {
    const last4 = cardNumber.replace(/\D/g, "").slice(-4) || "0000";
    setPaymentMethods((prev) => [
      ...prev,
      {
        id: uid(),
        type: "card",
        brand: "Visa Electron",
        detail: `.... .... .... ${last4}`,
        sub: "Expiry Date 12/05/2026",
      },
    ]);
    setCardNumber("");
    setShowAdd(false);
  }

  return (
    <Screen>
      <div style={{ ...styles.headerGradient, padding: "52px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={styles.greeting}>Good Morning ☀️</p>
            <h2 style={styles.userName}>{user.name}</h2>
          </div>
          <div style={styles.headerIcons}>
            <button style={styles.iconBtn} onClick={onLogout} aria-label="Logout">
              <IconLogout />
            </button>
            <button style={styles.iconBtn} aria-label="Notifications">
              <IconBell />
            </button>
            <button style={{ ...styles.iconBtn, background: "rgba(255,255,255,0.25)" }} aria-label="Profile">
              <IconAvatar />
            </button>
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>

      <div style={styles.body}>
        <h3 style={{ ...styles.sectionTitle, marginTop: 0 }}>Saved Payment Methods</h3>

        {paymentMethods.map((m) => (
          <div key={m.id} style={styles.walletCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {m.type === "paypal" ? (
                <span style={styles.paypalLogo}>PayPal</span>
              ) : (
                <div>
                  <p style={styles.visaLogo}>VISA</p>
                  <p style={styles.visaSub}>{m.brand}</p>
                </div>
              )}
              <button style={styles.trashBtn} onClick={() => removeMethod(m.id)} aria-label="Remove payment method">
                <IconTrash />
              </button>
            </div>
            <p style={styles.walletDetail}>{m.detail}</p>
            <p style={styles.walletSub}>{m.sub}</p>
          </div>
        ))}

        {paymentMethods.length === 0 && (
          <p style={{ color: "#999", fontSize: 13, textAlign: "center", marginTop: 40 }}>
            No saved payment methods yet.
          </p>
        )}

        {showAdd && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Add Card</h3>
            <input
              style={{ ...styles.inputField, ...styles.standaloneInput }}
              placeholder="Card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <button style={styles.confirmOrderBtn} onClick={addMethod}>
              Save Card
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px 96px" }}>
        <button style={styles.bookServiceBtn} onClick={() => setShowAdd((s) => !s)}>
          {showAdd ? "Cancel" : "Add Payment Method"}
        </button>
      </div>

      <BottomNav active="wallet" onNavigate={onNavigate} />
    </Screen>
  );
}
import { useState } from "react";

const SERVICE_TYPES = ["Wash & Fold", "Dry Clean", "Ironing", "Express", "Blanket"];

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: "cash" },
  { id: "card", label: "Card Payment", icon: "card" },
];

const PAYMENT_LOGOS = [
  { id: "apple", label: "Apple", icon: "apple" },
  { id: "google", label: "Google", icon: "google" },
  { id: "paypal", label: "PayPal", icon: "paypal" },
];

const NAV_ITEMS = ["Home", "Orders", "Wallet", "Support", "Profile"];

const PHOTOS = [
  "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=200&q=60",
  "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=200&q=60",
  "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200&q=60",
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&q=60",
];

function PaymentIcon({ type }) {
  switch (type) {
    case "cash":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case "card":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    case "apple":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.654-6.55 5.265-6.55 1.32 0 2.42.89 3.255.89.79 0 2.043-.95 3.557-.95.575 0 2.642.05 4.014 2.02-.105.07-2.394 1.435-2.394 4.166 0 3.19 2.625 4.31 2.704 4.34z" />
        </svg>
      );
    case "google":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21.8 12.23c0-.68-.06-1.34-.17-1.97H12v3.73h5.5a4.7 4.7 0 0 1-2.04 3.08v2.55h3.3c1.93-1.78 3.04-4.4 3.04-7.39z" fill="#4285F4"/>
          <path d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.3-2.55c-.9.61-2.06.97-3.32.97-2.56 0-4.72-1.73-5.5-4.05H3.1v2.6A9.99 9.99 0 0 0 12 22z" fill="#34A853"/>
          <path d="M6.5 13.94A6.1 6.1 0 0 1 6.18 12c0-.67.12-1.32.32-1.94V7.46H3.1A9.99 9.99 0 0 0 2 12c0 1.6.38 3.12 1.1 4.54l3.4-2.6z" fill="#FBBC05"/>
          <path d="M12 6.02c1.47 0 2.79.5 3.83 1.49l2.92-2.92C16.96 2.99 14.7 2 12 2 8.13 2 4.78 4.18 3.1 7.46l3.4 2.6c.78-2.32 2.94-4.04 5.5-4.04z" fill="#EA4335"/>
        </svg>
      );
    case "paypal":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.5 21h-3a.6.6 0 0 1-.6-.7L6.2 4.7A.9.9 0 0 1 7.1 4h6.8c2.7 0 4.6 1.6 4.2 4.3-.4 3-2.6 4.5-5.4 4.5h-2L9.5 18l-2 3z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function CreateOrder() {
  const [activeNav, setActiveNav] = useState("Orders");
  const [serviceType, setServiceType] = useState("Wash & Fold");
  const [pickupAddress, setPickupAddress] = useState("42 Park St, Wyndham Vale");
  const [pickupDate, setPickupDate] = useState("Mon 23 Jun · 9:00–11:00 AM");
  const [pickupNotes, setPickupNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("42 Park St, Wyndham Vale");
  const [deliveryDate, setDeliveryDate] = useState("Mon 23 Jun · 9:00–11:00 AM");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [weightEstimate] = useState("~ 8 Kg Estimated");
  const [bagsCount, setBagsCount] = useState("");
  const [fragile, setFragile] = useState(true);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const lineItemLabel = "Wash & Fold - 8kg";
  const lineItemPrice = 32;
  const deliveryCharge = 8;
  const estimatedTotal = lineItemPrice + deliveryCharge;

  return (
    <div style={styles.root}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <button style={styles.backBtn} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2 style={styles.headerTitle}>Create Order</h2>
      </div>

      {/* ── Body ── */}
      <div style={styles.body}>

        {/* Service Type */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Service Type</h3>
          <div style={styles.chipRow}>
            {SERVICE_TYPES.map((type) => {
              const selected = serviceType === type;
              return (
                <button
                  key={type}
                  style={{
                    ...styles.chip,
                    ...(selected ? styles.chipSelected : {}),
                  }}
                  onClick={() => setServiceType(type)}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </section>

        {/* Pickup Details */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Pickup Details</h3>

          <div style={styles.fieldRow}>
            <span style={styles.fieldIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7AD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <input
              style={styles.fieldInput}
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Pickup address"
            />
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7AD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <input
              style={styles.fieldInput}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              placeholder="Pickup date & time"
            />
          </div>

          <textarea
            style={styles.textarea}
            value={pickupNotes}
            onChange={(e) => setPickupNotes(e.target.value)}
            placeholder="Pick notes any instrucion"
          />
        </section>

        {/* Delivery Details */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Delivery Details</h3>

          <div style={styles.fieldRow}>
            <span style={styles.fieldIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7AD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <input
              style={styles.fieldInput}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Delivery address"
            />
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7AD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <input
              style={styles.fieldInput}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              placeholder="Delivery date & time"
            />
          </div>

          <textarea
            style={styles.textarea}
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Delivery notes any instructions"
          />
        </section>

        {/* Clothes */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Clothes</h3>

          <button style={styles.dropdownRow}>
            <span>{weightEstimate}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <input
            style={styles.plainInput}
            value={bagsCount}
            onChange={(e) => setBagsCount(e.target.value)}
            placeholder="Enter no of bags i.e 2 bags 4kg"
          />

          <div style={styles.fragileRow}>
            <button
              role="switch"
              aria-checked={fragile}
              onClick={() => setFragile((f) => !f)}
              style={{
                ...styles.toggleTrack,
                background: fragile ? "#2B35AF" : "#d8dae6",
              }}
            >
              <div
                style={{
                  ...styles.toggleThumb,
                  transform: fragile ? "translateX(16px)" : "translateX(0px)",
                }}
              />
            </button>
            <span style={styles.fragileLabel}>Fragile</span>
          </div>

          <textarea
            style={styles.textarea}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Write down any special Instructions if any"
          />
        </section>

        {/* Upload Photos */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Upload Photos</h3>

          <button style={styles.selectImagesBtn}>Select Images</button>

          <div style={styles.photoGrid}>
            {PHOTOS.map((src, i) => (
              <div key={i} style={styles.photoThumb}>
                <img src={src} alt={`Upload ${i + 1}`} style={styles.photoImg} />
              </div>
            ))}
          </div>
        </section>

        {/* Estimated Total */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Estimated Total</h3>

          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>{lineItemLabel}</span>
            <span style={styles.totalValue}>{lineItemPrice}$</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Delivery Charges</span>
            <span style={styles.totalValue}>{deliveryCharge}$</span>
          </div>
          <div style={{ ...styles.totalRow, marginTop: 4 }}>
            <span style={styles.totalLabelBold}>Estimated Total</span>
            <span style={styles.totalValueBold}>{estimatedTotal}$</span>
          </div>
        </section>

        {/* Payment Method */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Payment Method</h3>

          <div style={styles.chipRow}>
            {PAYMENT_METHODS.map((pm) => {
              const selected = paymentMethod === pm.id;
              return (
                <button
                  key={pm.id}
                  style={{
                    ...styles.chip,
                    ...styles.paymentChip,
                    ...(selected ? styles.chipSelected : {}),
                  }}
                  onClick={() => setPaymentMethod(pm.id)}
                >
                  <span style={{ display: "flex", color: selected ? "#3B4FBF" : "#666" }}>
                    <PaymentIcon type={pm.icon} />
                  </span>
                  {pm.label}
                </button>
              );
            })}
          </div>

          <div style={styles.chipRow}>
            {PAYMENT_LOGOS.map((pm) => (
              <button key={pm.id} style={{ ...styles.chip, ...styles.paymentChip }}>
                <span style={{ display: "flex", color: "#444" }}>
                  <PaymentIcon type={pm.icon} />
                </span>
                {pm.label}
              </button>
            ))}
          </div>

          <button style={styles.confirmBtn}>Confirm Order</button>
        </section>
      </div>

      {/* ── Bottom Nav ── */}
      <nav style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            style={styles.navItem}
            onClick={() => setActiveNav(item)}
          >
            <span style={{
              ...styles.navLabel,
              color: activeNav === item ? "#3B4FBF" : "#888",
              fontWeight: activeNav === item ? "600" : "400",
            }}>
              {item}
            </span>
            {activeNav === item && <div style={styles.navUnderline} />}
          </button>
        ))}
      </nav>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    maxWidth: 430,
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f4f5f9",
    position: "relative",
  },
  /* Header */
  header: {
    background: "linear-gradient(135deg, #2B35AF 0%, #3d52d5 100%)",
    padding: "52px 20px 28px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  },
  /* Body */
  body: {
    flex: 1,
    background: "#f4f5f9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    padding: "24px 16px 110px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  /* Card */
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "18px 16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 14px",
  },
  /* Chips */
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    background: "#f4f5f9",
    border: "1.5px solid transparent",
    borderRadius: 24,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 500,
    color: "#444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  chipSelected: {
    background: "#EEF0FB",
    border: "1.5px solid #3B4FBF",
    color: "#3B4FBF",
    fontWeight: 600,
  },
  paymentChip: {
    borderRadius: 24,
  },
  /* Fields */
  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f7f8fb",
    border: "1px solid #e7e9f2",
    borderRadius: 12,
    padding: "12px 14px",
    marginBottom: 12,
  },
  fieldIcon: {
    display: "flex",
    flexShrink: 0,
  },
  fieldInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13.5,
    color: "#333",
    flex: 1,
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    minHeight: 64,
    background: "#f7f8fb",
    border: "1px solid #e7e9f2",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 13.5,
    color: "#333",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
  },
  plainInput: {
    width: "100%",
    background: "#f7f8fb",
    border: "1px solid #e7e9f2",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 13.5,
    color: "#333",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 14,
  },
  dropdownRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f7f8fb",
    border: "1px solid #e7e9f2",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 13.5,
    color: "#333",
    fontFamily: "inherit",
    cursor: "pointer",
    marginBottom: 12,
    boxSizing: "border-box",
  },
  /* Fragile toggle */
  fragileRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  toggleTrack: {
    width: 38,
    height: 22,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    position: "relative",
    padding: 3,
    transition: "background 0.2s ease",
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#fff",
    transition: "transform 0.2s ease",
  },
  fragileLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#222",
  },
  /* Upload photos */
  selectImagesBtn: {
    width: "100%",
    background: "#f7f8fb",
    border: "1px dashed #c9cce0",
    borderRadius: 12,
    padding: "14px",
    fontSize: 13.5,
    color: "#888",
    cursor: "pointer",
    marginBottom: 14,
    fontFamily: "inherit",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  photoThumb: {
    aspectRatio: "1 / 1",
    borderRadius: 10,
    overflow: "hidden",
    background: "#eee",
  },
  photoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  /* Totals */
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
  },
  totalLabel: {
    fontSize: 14,
    color: "#444",
  },
  totalValue: {
    fontSize: 14,
    color: "#222",
    fontWeight: 600,
  },
  totalLabelBold: {
    fontSize: 15,
    color: "#111",
    fontWeight: 700,
  },
  totalValueBold: {
    fontSize: 18,
    color: "#2B35AF",
    fontWeight: 700,
  },
  /* Confirm */
  confirmBtn: {
    width: "100%",
    background: "#2B35AF",
    color: "#fff",
    border: "none",
    borderRadius: 30,
    padding: "16px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 16,
  },
  /* Bottom Nav */
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    background: "#fff",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0 20px",
    zIndex: 100,
  },
  navItem: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "4px 8px",
    position: "relative",
  },
  navLabel: {
    fontSize: 13,
  },
  navUnderline: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    transform: "translateX(-50%)",
    width: "70%",
    height: 2.5,
    background: "#2B35AF",
    borderRadius: 2,
  },
};
import { useState } from "react";

const services = [
  {
    id: 1,
    label: "Wash & Fold",
    bg: "#EEF0FB",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="16" r="7" stroke="#3B4FBF" strokeWidth="2" fill="none"/>
        <path d="M8 38c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#3B4FBF" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M14 20c1.5 2 4 3 8 3s6.5-1 8-3" stroke="#3B4FBF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: 2,
    label: "Ironing",
    bg: "#E6F9F4",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 34" fill="none">
        <path d="M3 28 L3 22 Q3 16 11 16 L36 16 Q42 16 42 22 L42 28 Z" fill="#2BB89A" opacity="0.85"/>
        <path d="M11 16 L11 10 Q11 6 17 6 L25 6 Q29 6 29 10 L29 16" fill="none" stroke="#2BB89A" strokeWidth="2.2" strokeLinejoin="round" opacity="0.85"/>
        <circle cx="19" cy="23" r="1.4" fill="white"/>
        <circle cx="26" cy="23" r="1.4" fill="white"/>
        <circle cx="33" cy="23" r="1.4" fill="white"/>
      </svg>
    ),
  },
  {
    id: 3,
    label: "Dry Cleaning",
    bg: "#FFF8E6",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <path d="M22 6 L34 16 L34 36 L10 36 L10 16 Z" fill="none" stroke="#D4A017" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M16 36 L16 24 Q16 20 22 20 Q28 20 28 24 L28 36" fill="none" stroke="#D4A017" strokeWidth="1.8"/>
        <circle cx="22" cy="10" r="3" fill="#D4A017" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 4,
    label: "Express",
    bg: "#E6F9F4",
    icon: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect x="6" y="8" width="32" height="28" rx="3" fill="none" stroke="#2BB89A" strokeWidth="2"/>
        <path d="M14 20 L22 12 L30 20" stroke="#2BB89A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M22 12 L22 32" stroke="#2BB89A" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 32 L30 32" stroke="#2BB89A" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const NAV_ITEMS = ["Home", "Orders", "Wallet", "Support", "Profile"];

export default function UserHome() {
  const [activeNav, setActiveNav] = useState("Home");

  return (
    <div style={styles.root}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>Good Morning ☀️</p>
          <h2 style={styles.userName}>Sarah Kent</h2>
        </div>
        <div style={styles.headerIcons}>
          <button style={styles.iconBtn}>
            {/* logout */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
          <button style={styles.iconBtn}>
            {/* bell */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button style={{ ...styles.iconBtn, background: "rgba(255,255,255,0.25)" }}>
            {/* avatar */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={styles.searchWrap}>
        <div style={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input style={styles.searchInput} placeholder="Search Services" />
        </div>
      </div>

      {/* ── White body ── */}
      <div style={styles.body}>

        {/* Promo banner */}
        <div style={styles.promoBanner}>
          <div>
            <p style={styles.promoTitle}>First order free !</p>
            <p style={styles.promoSub}>Pickup &amp; Delivery<br/>included</p>
          </div>
          <button style={styles.bookNowBtn}>Book Now</button>
        </div>

        {/* Services */}
        <h3 style={styles.sectionTitle}>Our Services</h3>
        <div style={styles.servicesGrid}>
          {services.map((s) => (
            <button key={s.id} style={styles.serviceCard}>
              <div style={{ ...styles.serviceIconWrap, background: s.bg }}>
                {s.icon}
              </div>
              <span style={styles.serviceLabel}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Book Service CTA */}
        <button style={styles.bookServiceBtn}>Book Service</button>
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
    padding: "52px 20px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    margin: 0,
  },
  userName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 700,
    margin: "4px 0 0",
  },
  headerIcons: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    paddingTop: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1.5px solid rgba(255,255,255,0.35)",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  /* Search */
  searchWrap: {
    background: "linear-gradient(135deg, #2B35AF 0%, #3d52d5 100%)",
    padding: "16px 20px 28px",
  },
  searchBox: {
    background: "rgba(255,255,255,0.18)",
    borderRadius: 30,
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.25)",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 14,
    flex: 1,
    "::placeholder": { color: "rgba(255,255,255,0.6)" },
  },
  /* Body */
  body: {
    flex: 1,
    background: "#f4f5f9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    padding: "24px 16px 100px",
  },
  /* Promo */
  promoBanner: {
    background: "linear-gradient(135deg, #2B35AF 0%, #4a6fa5 100%)",
    borderRadius: 16,
    padding: "20px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  promoTitle: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    margin: 0,
  },
  promoSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    margin: "4px 0 0",
    lineHeight: 1.4,
  },
  bookNowBtn: {
    background: "#2ec4a0",
    color: "#fff",
    border: "none",
    borderRadius: 24,
    padding: "12px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  /* Services */
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111",
    margin: "0 0 16px 4px",
  },
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 28,
  },
  serviceCard: {
    background: "#fff",
    border: "none",
    borderRadius: 16,
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  serviceIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#222",
  },
  /* Book Service */
  bookServiceBtn: {
    width: "100%",
    background: "#2B35AF",
    color: "#fff",
    border: "none",
    borderRadius: 30,
    padding: "16px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
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
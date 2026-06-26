import { useState } from "react";
import { SERVICES } from "../Constants.js";
import { IconLogout, IconBell, IconAvatar, ServiceIcon } from "../../components/Icons";
import { Screen, BottomNav } from "../Layout";
import { styles } from "./Styles.js";

export default function HomeScreen({ user, onLogout, onNavigate, onSelectService }) {
  const [query, setQuery] = useState("");

  const filtered = SERVICES.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

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

        <div style={{ padding: "16px 0 28px" }}>
          <div style={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              style={styles.searchInput}
              placeholder="Search Services"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.promoBanner}>
          <div>
            <p style={styles.promoTitle}>First order free !</p>
            <p style={styles.promoSub}>
              Pickup &amp; Delivery
              <br />
              included
            </p>
          </div>
          <button style={styles.bookNowBtn} onClick={() => onNavigate("create-order")}>
            Book Now
          </button>
        </div>

        <h3 style={styles.sectionTitle}>Our Services</h3>
        <div style={styles.servicesGrid}>
          {filtered.map((s) => (
            <button key={s.id} style={styles.serviceCard} onClick={() => onSelectService(s.id)}>
              <div style={{ ...styles.serviceIconWrap, background: s.bg }}>
                <ServiceIcon iconKey={s.iconKey} />
              </div>
              <span style={styles.serviceLabel}>{s.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: "#999", fontSize: 13, gridColumn: "1 / -1", textAlign: "center" }}>
              No services match "{query}"
            </p>
          )}
        </div>

        <button style={styles.bookServiceBtn} onClick={() => onNavigate("create-order")}>
          Book Service
        </button>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </Screen>
  );
}
import { NAV_ITEMS } from "./Constants.js";
import { IconBack } from "../components/Icons.jsx";
import { styles } from "./screens/Styles.js";

/* ────────────────────────────────────────────────────────────
   Shared layout chrome
──────────────────────────────────────────────────────────── */

export function BackHeader({ title, onBack }) {
  return (
    <div style={{ ...styles.header, padding: "52px 20px 36px", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button style={styles.backBtn} onClick={onBack} aria-label="Go back">
          <IconBack />
        </button>
        <h2 style={styles.headerTitle}>{title}</h2>
      </div>
    </div>
  );
}

export function BottomNav({ active, onNavigate }) {
  return (
    <nav style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => (
        <button key={item.key} style={styles.navItem} onClick={() => onNavigate(item.key)}>
          <span
            style={{
              ...styles.navLabel,
              color: active === item.key ? "#3B4FBF" : "#888",
              fontWeight: active === item.key ? "600" : "400",
            }}
          >
            {item.label}
          </span>
          {active === item.key && <div style={styles.navUnderline} />}
        </button>
      ))}
    </nav>
  );
}

export function Screen({ children }) {
  return <div style={styles.root}>{children}</div>;
}
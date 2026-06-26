import { useState } from "react";

const NAV_ITEMS = ["Home", "Orders", "Wallet", "Support", "Profile"];

export default function BottomNav({ activeNav, onNavChange }) {
  return (
    <nav style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item}
          style={styles.navItem}
          onClick={() => onNavChange(item)}
        >
          <span
            style={{
              ...styles.navLabel,
              color: activeNav === item ? "#3B4FBF" : "#888",
              fontWeight: activeNav === item ? "600" : "400",
            }}
          >
            {item}
          </span>
          {activeNav === item && <div style={styles.navUnderline} />}
        </button>
      ))}
    </nav>
  );
}

const styles = {
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
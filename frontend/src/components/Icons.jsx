/* ────────────────────────────────────────────────────────────
   Shared icon components
──────────────────────────────────────────────────────────── */

export function IconBack({ color = "white" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function IconAvatar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B4FBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B4FBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E25555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function Star({ filled, size = 28, onClick }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#F5A623" : "none"}
      stroke="#F5A623"
      strokeWidth="1.5"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* Service-card icons, keyed by SERVICES[].iconKey */
export function ServiceIcon({ iconKey }) {
  switch (iconKey) {
    case "wash-fold":
      return (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="16" r="7" stroke="#3B4FBF" strokeWidth="2" fill="none" />
          <path d="M8 38c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#3B4FBF" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M14 20c1.5 2 4 3 8 3s6.5-1 8-3" stroke="#3B4FBF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "ironing":
      return (
        <svg width="44" height="44" viewBox="0 0 44 34" fill="none">
          <path d="M3 28 L3 22 Q3 16 11 16 L36 16 Q42 16 42 22 L42 28 Z" fill="#2BB89A" opacity="0.85" />
          <path d="M11 16 L11 10 Q11 6 17 6 L25 6 Q29 6 29 10 L29 16" fill="none" stroke="#2BB89A" strokeWidth="2.2" strokeLinejoin="round" opacity="0.85" />
          <circle cx="19" cy="23" r="1.4" fill="white" />
          <circle cx="26" cy="23" r="1.4" fill="white" />
          <circle cx="33" cy="23" r="1.4" fill="white" />
        </svg>
      );
    case "dry-clean":
      return (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path d="M22 6 L34 16 L34 36 L10 36 L10 16 Z" fill="none" stroke="#D4A017" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 36 L16 24 Q16 20 22 20 Q28 20 28 24 L28 36" fill="none" stroke="#D4A017" strokeWidth="1.8" />
          <circle cx="22" cy="10" r="3" fill="#D4A017" opacity="0.6" />
        </svg>
      );
    case "express":
      return (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect x="6" y="8" width="32" height="28" rx="3" fill="none" stroke="#2BB89A" strokeWidth="2" />
          <path d="M14 20 L22 12 L30 20" stroke="#2BB89A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M22 12 L22 32" stroke="#2BB89A" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 32 L30 32" stroke="#2BB89A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "blanket":
      return (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <rect x="6" y="10" width="32" height="24" rx="4" fill="none" stroke="#D4A017" strokeWidth="2" />
          <path d="M6 18 H38" stroke="#D4A017" strokeWidth="1.5" />
          <path d="M14 18 V34 M22 18 V34 M30 18 V34" stroke="#D4A017" strokeWidth="1.2" opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
}
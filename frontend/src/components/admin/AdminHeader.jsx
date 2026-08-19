import { useState } from "react";
import { useNavigate } from "react-router-dom";

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconAvatar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const AdminHeader = ({ title, onToggleSidebar, onToggleMobile }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  let admin = null;
  try {
    admin = JSON.parse(localStorage.getItem("admin") || "null");
  } catch {
    admin = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="admin-icon-btn admin-icon-btn--desktop" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2559" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <button className="admin-icon-btn admin-icon-btn--mobile" onClick={onToggleMobile} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2559" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="admin-header-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <input className="admin-search-input" type="text" placeholder="Search... (coming soon)" disabled />

        <button className="admin-icon-btn admin-bell-btn" aria-label="Notifications" disabled>
          <IconBell />
        </button>

        <div className="admin-profile-menu">
          <button className="admin-profile-trigger" onClick={() => setMenuOpen((v) => !v)}>
            <span className="admin-avatar-circle"><IconAvatar /></span>
            <span className="admin-profile-name">{admin?.name || "Admin"}</span>
          </button>

          {menuOpen && (
            <div className="admin-profile-dropdown" onMouseLeave={() => setMenuOpen(false)}>
              <div className="admin-profile-dropdown-header">
                <div className="admin-profile-dropdown-name">{admin?.name || "Admin"}</div>
                <div className="admin-profile-dropdown-email">{admin?.email}</div>
              </div>
              <button className="admin-profile-dropdown-item admin-profile-dropdown-item--danger" onClick={handleLogout}>
                <IconLogout /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

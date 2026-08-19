import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import "./admin.css";

const AdminLayout = ({ title, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`admin-main ${collapsed ? "admin-main--collapsed" : ""}`}>
        <AdminHeader
          title={title}
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleMobile={() => setMobileOpen((v) => !v)}
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

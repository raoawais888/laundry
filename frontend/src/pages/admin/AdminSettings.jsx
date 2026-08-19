import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminGetMe, adminUpdateProfile, adminChangePassword } from "../../api";

const Section = ({ title, children }) => (
  <div className="admin-detail-card" style={{ maxWidth: 480 }}>
    <div className="admin-detail-card-header">
      <div className="admin-detail-card-title">{title}</div>
    </div>
    {children}
  </div>
);

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await adminGetMe();
      setAdmin(data.admin);
      setName(data.admin.name || "");
      setPhone(data.admin.phone || "");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    try {
      setSavingProfile(true);
      const { data } = await adminUpdateProfile({ name: name.trim(), phone: phone.trim() });
      toast.success("Profile updated.");
      setAdmin(data.admin);
      localStorage.setItem("admin", JSON.stringify(data.admin));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Fill in your current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      setSavingPassword(true);
      await adminChangePassword(currentPassword, newPassword);
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="admin-skeleton" style={{ height: 300, maxWidth: 480 }} />;

  return (
    <div className="admin-dashboard">
      <Section title="Admin Profile">
        <label className="admin-side-label">Name</label>
        <input className="admin-select admin-select--full" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={savingProfile} />

        <label className="admin-side-label" style={{ marginTop: 12 }}>Phone</label>
        <input className="admin-select admin-select--full" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={savingProfile} />

        <label className="admin-side-label" style={{ marginTop: 12 }}>Email</label>
        <input className="admin-select admin-select--full" type="text" value={admin?.email || ""} disabled title="Email cannot be changed here." />

        <label className="admin-side-label" style={{ marginTop: 12 }}>Role</label>
        <input className="admin-select admin-select--full" type="text" value={admin?.role || ""} disabled style={{ textTransform: "capitalize" }} />

        <button className="admin-btn admin-btn--primary" style={{ marginTop: 16 }} onClick={saveProfile} disabled={savingProfile}>
          {savingProfile ? "Saving..." : "Save Profile"}
        </button>
      </Section>

      <Section title="Change Password">
        <label className="admin-side-label">Current Password</label>
        <input
          className="admin-select admin-select--full"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={savingPassword}
        />

        <label className="admin-side-label" style={{ marginTop: 12 }}>New Password</label>
        <input
          className="admin-select admin-select--full"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={savingPassword}
        />

        <label className="admin-side-label" style={{ marginTop: 12 }}>Confirm New Password</label>
        <input
          className="admin-select admin-select--full"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={savingPassword}
        />

        <button className="admin-btn admin-btn--primary" style={{ marginTop: 16 }} onClick={savePassword} disabled={savingPassword}>
          {savingPassword ? "Saving..." : "Change Password"}
        </button>
      </Section>
    </div>
  );
};

export default AdminSettings;

import { useState, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { setupProfile } from "../api";
import { toast } from "react-toastify";

const Profile = ({ user, contactNumber, onSaved }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast.error("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      toast.error("Please enter your last name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    if (!password) {
      toast.error("Please enter a password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const { data } = await setupProfile(formData);

      console.log("Save Profile Response:", data);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success(data.message || "Profile saved successfully.");

      if (onSaved) onSaved(data);

      // Example:
      // navigate("/home");

    } catch (error) {
      toast.error(error?.message || "Could not save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#1a1a2e" }}>

      <div className="lume-login-card">

        {/* ── Welcome header ── */}
        <div className="lume-welcome-header">
          <div className="lume-welcome-row">
            <div>
              <p className="lume-welcome-label">Welcome</p>
              <p className="lume-welcome-name">{user?.name || "User92003"}</p>
            </div>
            <div className="lume-header-icons">
              <button className="lume-icon-btn" aria-label="Log out">
                <i className="ti ti-logout" />
              </button>
              <button className="lume-icon-btn" aria-label="Notifications">
                <i className="ti ti-bell" />
              </button>
              <button className="lume-icon-btn lume-icon-btn--avatar" aria-label="Account">
                <i className="ti ti-user" />
              </button>
            </div>
          </div>
          <p className="lume-welcome-sub">Just few steps to complete your profile !</p>
        </div>

        {/* ── Avatar upload ── */}
        <div className="lume-avatar-wrap">
          <div className="lume-avatar-circle" onClick={handleAvatarClick}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile preview" className="lume-avatar-img" />
            ) : (
              <i className="ti ti-user lume-avatar-icon" />
            )}
            <div className="lume-avatar-edit">
              <i className="ti ti-pencil" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        {/* ── Form panel ── */}
        <div className="lume-profile-form">
          <label className="lume-label">First name</label>
          <input
            className="lume-input"
            type="text"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
          />

          <label className="lume-label">Last name</label>
          <input
            className="lume-input"
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
          />

          <label className="lume-label lume-label--muted">Contact number</label>
          <input
            className="lume-input lume-input--disabled"
            type="tel"
            value={contactNumber || ""}
            disabled
          />

          <label className="lume-label">Email</label>
          <input
            className="lume-input"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <label className="lume-label">Password</label>
          <div className="lume-input-wrap">
            <input
              className="lume-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="lume-eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"} />
            </button>
          </div>

          <label className="lume-label">Confirm password</label>
          <div className="lume-input-wrap">
            <input
              className="lume-input"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="lume-eye-btn"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <i className={showConfirmPassword ? "ti ti-eye-off" : "ti ti-eye"} />
            </button>
          </div>
        </div>

        {/* ── Bottom action ── */}
        <div className="lume-bottom-action">
          <button
            className="lume-otp-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save & continue"}
          </button>
        </div>

      </div>
      </div>
    </>
  );
};

export default Profile;

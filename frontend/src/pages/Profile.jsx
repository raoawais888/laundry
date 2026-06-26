import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setupProfile } from "../api";
import { toast } from "react-toastify";
import axios from "axios";
const Profile = ({ user, contactNumber, onSaved }) => {
  const navigate = useNavigate();

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

  // FIX: pre-fill the form with existing user data instead of leaving it blank
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // FIX: revoke the old blob URL whenever it's replaced or the component unmounts
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarClick = () => {
    if (loading) return;
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSave = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName) {
      toast.error("Please enter your first name.");
      return;
    }

    if (!trimmedLastName) {
      toast.error("Please enter your last name.");
      return;
    }

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // FIX: password is only required when the user is actively setting/changing it.
    // If both fields are empty, skip password update entirely (no forced reset on every edit).
    if (password || confirmPassword) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("firstName", trimmedFirstName);
      formData.append("lastName", trimmedLastName);
      formData.append("email", trimmedEmail);
      if (password) {
        formData.append("password", password);
      }
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

  const { data } = await setupProfile(formData);

      console.log("Save Profile Response:", data);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success(data.message || "Profile saved successfully.");

        console.log(data.user);
      if (onSaved) {
        onSaved(data);
      } else {
        // FIX: useNavigate was imported but never used — now actually wired up
       // Example:
       navigate("/verify-email-otp", { state: { trimmedEmail } });
      }
    } catch (error) {
      // FIX: read the backend's message from error.response.data.message (axios),
      // falling back to error.message, then a generic string
      toast.error(
        error?.response?.data?.message || error?.message || "Could not save profile."
      );
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
            <div
              className="lume-avatar-circle"
              onClick={handleAvatarClick}
              style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? "none" : "auto" }}
            >
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
              disabled={loading}
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
                placeholder="Leave blank to keep current password"
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
                placeholder="Re-enter password"
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
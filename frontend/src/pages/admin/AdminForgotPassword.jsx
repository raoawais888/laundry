import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { adminForgotPassword, adminResetPassword } from "../../api";

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("request"); // "request" | "reset"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await adminForgotPassword(email.trim());
      toast.success(data.message || "If that email exists, a reset code has been sent.");
      setStep("reset");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword) {
      toast.error("Please enter the reset code and a new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await adminResetPassword(email.trim(), code.trim(), newPassword);
      toast.success(data.message || "Password reset successfully.");
      navigate("/admin/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#1a1a2e" }}>
      <div className="lume-login-card">
        <div className="lume-banner">
          <h1>Forgot Password</h1>
          <p>{step === "request" ? "We'll email you a reset code" : `Enter the code sent to ${email}`}</p>
        </div>

        <div className="lume-form-panel">
          {step === "request" ? (
            <>
              <label className="lume-label">Email</label>
              <input
                className="lume-input"
                type="email"
                placeholder="admin@lumelaundry.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRequestCode()}
                disabled={loading}
              />

              <button className="lume-otp-btn" onClick={handleRequestCode} disabled={loading} style={{ marginTop: 18 }}>
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </>
          ) : (
            <>
              <label className="lume-label">Reset Code</label>
              <input
                className="lume-input"
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
              />

              <label className="lume-label" style={{ marginTop: 14 }}>New Password</label>
              <input
                className="lume-input"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />

              <label className="lume-label" style={{ marginTop: 14 }}>Confirm Password</label>
              <input
                className="lume-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                disabled={loading}
              />

              <button className="lume-otp-btn" onClick={handleResetPassword} disabled={loading} style={{ marginTop: 18 }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="lume-signup" style={{ marginTop: 16 }}>
                <button type="button" className="lume-link-btn" onClick={() => setStep("request")}>
                  Didn't get a code? Try again
                </button>
              </p>
            </>
          )}

          <p className="lume-signup" style={{ marginTop: 16 }}>
            <Link to="/admin/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;

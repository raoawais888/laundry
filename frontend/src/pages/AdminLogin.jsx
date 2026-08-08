import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin } from "../../api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await adminLogin(email.trim(), password);

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      toast.success("Logged in successfully.");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#1a1a2e" }}>
      <div className="lume-login-card">
        <div className="lume-banner">
          <h1>Admin Login</h1>
          <p>Sign in to the Lume dashboard</p>
        </div>

        <div className="lume-form-panel">
          <label className="lume-label">Email</label>
          <input
            className="lume-input"
            type="email"
            placeholder="admin@lumelaundry.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <label className="lume-label" style={{ marginTop: 14 }}>Password</label>
          <input
            className="lume-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            disabled={loading}
          />

          <button className="lume-otp-btn" onClick={handleLogin} disabled={loading} style={{ marginTop: 18 }}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="lume-signup" style={{ marginTop: 16 }}>
            <Link to="/admin/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
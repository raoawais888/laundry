import { useState } from "react";
import { sendOtp } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
   const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
 const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
      
      return;
    }

    try {
      setLoading(true);

      const { data } = await sendOtp(phone);

      console.log("OTP Response:", data);

      // If backend returns token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // If backend returns user
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success(data.message || "OTP sent successfully.");
     
      // Example:
       navigate("/verify-otp", { state: { phone } });

    } catch (error) {
      toast.error(error);
      

      
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#1a1a2e" }}>
        <div className="lume-login-card">

          {/* ── White header with logo ── */}
          <div className="lume-header">
            <div className="lume-logo">
              <span className="lume-script">Lume</span>
              <div className="lume-row2">
                {/* Iron icon */}
                <svg width="36" height="28" viewBox="0 0 44 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 28 L3 22 Q3 16 11 16 L36 16 Q42 16 42 22 L42 28 Z" fill="#2B35AF" opacity="0.85"/>
                  <path d="M11 16 L11 10 Q11 6 17 6 L25 6 Q29 6 29 10 L29 16" fill="none" stroke="#2B35AF" strokeWidth="2.2" strokeLinejoin="round" opacity="0.85"/>
                  <circle cx="19" cy="23" r="1.4" fill="white"/>
                  <circle cx="26" cy="23" r="1.4" fill="white"/>
                  <circle cx="33" cy="23" r="1.4" fill="white"/>
                </svg>
                {/* Washing machine icon */}
                <svg width="34" height="30" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="36" height="32" rx="4" fill="none" stroke="#2B35AF" strokeWidth="2" opacity="0.85"/>
                  <circle cx="20" cy="22" r="9" fill="none" stroke="#2B35AF" strokeWidth="1.9" opacity="0.85"/>
                  <circle cx="20" cy="22" r="5.2" fill="none" stroke="#2B35AF" strokeWidth="1.3" opacity="0.5"/>
                  <circle cx="8" cy="9" r="2.2" fill="#2B35AF" opacity="0.85"/>
                  <rect x="15" y="7" width="14" height="3.5" rx="1.75" fill="#2B35AF" opacity="0.4"/>
                  <circle cx="18" cy="21" r="1.8" fill="#2B35AF" opacity="0.3"/>
                </svg>
                <span className="lume-wordmark">undry</span>
              </div>
            </div>
          </div>

          {/* ── Blue welcome banner ── */}
          <div className="lume-banner">
            <h1>Welcome Back</h1>
            <p>Login to your Lume account</p>
          </div>

          {/* ── Form panel ── */}
          <div className="lume-form-panel">
            <label className="lume-label">Mobile Number</label>
            <input
              className="lume-input"
              type="tel"
              placeholder="+61 4XXXXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />

 <button className="lume-otp-btn"
        onClick={handleSendOtp}
        disabled={loading}
      >
        {loading ? "Sending..." : "Continue with OTP"}
      </button>
            

            <div className="lume-or">
              <div className="lume-or-line" />
              <span>or continue with</span>
              <div className="lume-or-line" />
            </div>

            {/* Apple */}
            <button className="lume-social-btn">
              <div className="apple-icon">
                <svg width="13" height="15" viewBox="0 0 14 17" fill="none">
                  <path d="M11.63 8.97c-.02-1.96 1.6-2.9 1.67-2.95-0.91-1.33-2.33-1.51-2.84-1.53-1.21-.12-2.36.71-2.97.71-.62 0-1.57-.7-2.58-.68-1.33.02-2.56.78-3.24 1.97-1.39 2.4-.35 5.95 1 7.9.66.95 1.44 2.02 2.47 1.98 1-.04 1.37-.64 2.57-.64 1.2 0 1.54.64 2.58.62 1.07-.02 1.74-0.97 2.39-1.93.76-1.1 1.07-2.17 1.08-2.23-.02-.01-2.11-.81-2.13-3.22zM9.7 2.9C10.27 2.21 10.65 1.26 10.54.3c-.83.04-1.84.55-2.43 1.24-.53.6-.99 1.57-.87 2.5.93.07 1.88-.47 2.46-1.14z" fill="white"/>
                </svg>
              </div>
              Apple
            </button>

            {/* Google */}
            <button className="lume-social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <p className="lume-signup">
              Don't have account ? <a href="#">Sing Up here</a>
            </p>
          </div>

          {/* ── Footer ── */}
          <div className="lume-footer">
            By continuing, you agree to our <a href="#">Terms &amp; Privacy</a>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;
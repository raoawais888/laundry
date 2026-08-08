import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseLogin } from "../api";

const OTP_LENGTH = 6;

const VerifyOtp = ({ onVerified }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone } = location.state || {};
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const focusInput = (index) => {
    const el = inputRefs.current[index];
    if (el) el.focus();
  };

  const handleChange = (index, rawValue) => {
    const value = rawValue.replace(/[^0-9]/g, "");

    if (!value) {
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      return;
    }

    const next = [...otp];
    next[index] = value[value.length - 1];
    setOtp(next);

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter the full 6 digit code.");
      return;
    }

    if (!window.confirmationResult) {
      toast.error("Session expired. Please request a new OTP.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // 1. Verify OTP with Firebase
      const result = await window.confirmationResult.confirm(code);

      // 2. Get Firebase ID token
      const idToken = await result.user.getIdToken();

      // 3. Send token to your backend → get your own JWT + user
      const { data } = await firebaseLogin(idToken);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success("Number verified successfully.");

      if (onVerified) {
        onVerified(data);
      }

      // Two-scenario routing
      if (data.isProfileComplete) {
        navigate("/dashboard");      // existing user
        console.log("existing user");
      } else {
        navigate("/profile");        // first-time user → setup profile
      }
    } catch (error) {
      console.error(error);

      // Firebase throws its own error codes for wrong/expired codes
      if (error.code === "auth/invalid-verification-code") {
        toast.error("Invalid code. Please check and try again.");
      } else if (error.code === "auth/code-expired") {
        toast.error("Code expired. Please resend a new OTP.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) {
      toast.error("Missing phone number. Please go back and try again.");
      return;
    }

    try {
      // Firebase needs a fresh reCAPTCHA for each resend
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      window.confirmationResult = confirmationResult;

      toast.success("OTP resent successfully.");
      setOtp(Array(OTP_LENGTH).fill(""));
      focusInput(0);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Could not resend OTP.");
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

          {/* ── Blue verify banner ── */}
          <div className="lume-banner lume-banner--curved">
            <h1>Verify your number</h1>
            <p>OTP sent to {phone || "+61 4XX XXX XXX"}</p>
          </div>

          {/* ── OTP panel ── */}
          <div className="lume-otp-panel">
            <label className="lume-label">Enter your 6 digit code</label>

            <div className="lume-otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className={`lume-otp-box ${digit ? "lume-otp-box--filled" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                />
              ))}
            </div>

            <p className="lume-resend">
              Didn't get the code?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); handleResend(); }}>
                Resend
              </a>
            </p>
          </div>

          {/* ── Bottom action ── */}
          <div className="lume-bottom-action">
            <button className="lume-otp-btn" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Continue with OTP"}
            </button>
          </div>

          {/* reCAPTCHA mount point for resend */}
          <div id="recaptcha-container"></div>

        </div>
      </div>
    </>
  );
};

export default VerifyOtp;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LumeLaundrySplash = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (selectedRole === "rider") {
      navigate("/rider-started");
    } else if (selectedRole === "customer") {
      navigate("/customer-login");
    }
  };

  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", background: "#1a1a2e" }}
      >
        <div className="lume-card">
          {/* Logo Block */}
          <div className="lume-logo-wrap">
            {/* Top script line: "Lume" */}
            <span className="lume-script">Lume</span>

            {/* Bottom row: icons + "undry" */}
            <div className="lume-bottom-row">
              {/* Iron icon */}
              <svg
                className="lume-svg-icon"
                width="48"
                height="38"
                viewBox="0 0 48 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Iron body */}
                <path
                  d="M4 26 Q4 18 14 18 L38 18 Q44 18 44 24 L44 26 Z"
                  fill="white"
                  opacity="0.9"
                />
                {/* Iron handle */}
                <path
                  d="M12 18 L12 12 Q12 8 18 8 L26 8 Q30 8 30 12 L30 18"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  opacity="0.9"
                  strokeLinejoin="round"
                />
                {/* Steam holes */}
                <circle cx="20" cy="23" r="1.5" fill="#2B35AF" />
                <circle cx="27" cy="23" r="1.5" fill="#2B35AF" />
                <circle cx="34" cy="23" r="1.5" fill="#2B35AF" />
              </svg>

              {/* Washing machine icon */}
              <svg
                className="lume-svg-icon"
                width="44"
                height="40"
                viewBox="0 0 44 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Machine body */}
                <rect
                  x="2"
                  y="4"
                  width="40"
                  height="34"
                  rx="4"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  opacity="0.9"
                />
                {/* Door circle */}
                <circle
                  cx="22"
                  cy="24"
                  r="10"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.9"
                />
                {/* Inner door */}
                <circle
                  cx="22"
                  cy="24"
                  r="6"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.4"
                  opacity="0.6"
                />
                {/* Top controls */}
                <circle cx="10" cy="11" r="2.5" fill="white" opacity="0.9" />
                <rect
                  x="18"
                  y="8.5"
                  width="16"
                  height="4"
                  rx="2"
                  fill="white"
                  opacity="0.5"
                />
                {/* Bubbles inside */}
                <circle cx="20" cy="23" r="2" fill="white" opacity="0.4" />
                <circle cx="25" cy="26" r="1.5" fill="white" opacity="0.3" />
              </svg>

              <span className="lume-laundry-text">undry</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="lume-tagline">
            Your weekends weren't made<br />
            for laundry
          </p>

          {/* Divider */}
          <div className="lume-divider" />

          {/* Role Selection with Card Style */}
          <div className="lume-role-selector">
            <p className="lume-role-label">I am a</p>

            <div className="lume-role-grid">
              {/* Rider Card */}
              <button
                className={`lume-role-card ${
                  selectedRole === "rider" ? "lume-role-card--active" : ""
                }`}
                onClick={() => setSelectedRole("rider")}
              >
                <div className="lume-role-icon-wrapper">
                  <svg
                    className="lume-role-card-icon"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {/* Vehicle/Delivery icon */}
                    <rect x="2" y="8" width="20" height="11" rx="2" />
                    <path d="M6 8V6c0-1 1-2 2-2h8c1 0 2 1 2 2v2" />
                    <circle cx="6" cy="17" r="1.5" />
                    <circle cx="18" cy="17" r="1.5" />
                    <path d="M8 11h8" />
                  </svg>
                </div>
                <span className="lume-role-card-label">Rider</span>
              </button>

              {/* Customer Card */}
              <button
                className={`lume-role-card ${
                  selectedRole === "customer" ? "lume-role-card--active" : ""
                }`}
                onClick={() => setSelectedRole("customer")}
              >
                <div className="lume-role-icon-wrapper">
                  <svg
                    className="lume-role-card-icon"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {/* User/Person icon */}
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span className="lume-role-card-label">Customer</span>
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button
            className={`lume-btn ${!selectedRole ? "lume-btn--disabled" : ""}`}
            onClick={handleGetStarted}
            disabled={!selectedRole}
          >
            Get Started
          </button>
        </div>
      </div>

      <style>{`
        /* Role Selector Label */
        .lume-role-label {
          font-size: 12px;
          font-weight: 700;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          display: block;
          text-align: center;
        }

        /* Role Grid Container */
        .lume-role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 16px 0 24px 0;
        }

        /* Role Card Button */
        .lume-role-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px 16px;
          border: 2px solid #e8e8e8;
          border-radius: 16px;
          background: #ffffff;
          color: #333;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          outline: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          position: relative;
        }

        .lume-role-card:hover {
          border-color: #1cb5a8;
          box-shadow: 0 4px 16px rgba(28, 181, 168, 0.12);
          transform: translateY(-4px);
        }

        .lume-role-card:active {
          transform: translateY(-2px);
        }

        /* Icon Wrapper */
        .lume-role-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          transition: all 0.3s ease;
        }

        /* Icon */
        .lume-role-card-icon {
          width: 32px;
          height: 32px;
          color: #666;
          transition: all 0.3s ease;
        }

        /* Label */
        .lume-role-card-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #333;
          letter-spacing: 0.3px;
          transition: color 0.3s ease;
        }

        /* Active Card State */
        .lume-role-card--active {
          border: 2px solid #1cb5a8;
          background: linear-gradient(135deg, rgba(28, 181, 168, 0.08) 0%, rgba(28, 181, 168, 0.04) 100%);
          box-shadow: 0 6px 20px rgba(28, 181, 168, 0.2);
          transform: translateY(-4px) scale(1.02);
        }

        .lume-role-card--active .lume-role-icon-wrapper {
          background: linear-gradient(135deg, #1cb5a8 0%, #0d9488 100%);
          box-shadow: 0 4px 12px rgba(28, 181, 168, 0.25);
        }

        .lume-role-card--active .lume-role-card-icon {
          color: #ffffff;
        }

        .lume-role-card--active .lume-role-card-label {
          color: #1cb5a8;
          font-weight: 700;
        }

        /* Get Started Button - Disabled */
        .lume-btn--disabled {
          background: #d0d0d0 !important;
          color: #999 !important;
          cursor: not-allowed !important;
          opacity: 0.75 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .lume-btn--disabled:hover {
          background: #d0d0d0 !important;
          transform: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }

        /* Get Started Button - Enabled */
        .lume-btn:not(:disabled) {
          background: linear-gradient(135deg, #1cb5a8 0%, #0d9488 100%);
          box-shadow: 0 8px 20px rgba(28, 181, 168, 0.3);
        }

        .lume-btn:not(:disabled):hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(28, 181, 168, 0.4);
          background: linear-gradient(135deg, #0d9488 0%, #0a7369 100%);
        }

        .lume-btn:not(:disabled):active {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(28, 181, 168, 0.3);
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          .lume-role-label {
            font-size: 11px;
            margin-bottom: 14px;
          }

          .lume-role-grid {
            gap: 12px;
            margin: 12px 0 20px 0;
          }

          .lume-role-card {
            padding: 20px 12px;
            border-radius: 12px;
            gap: 10px;
          }

          .lume-role-icon-wrapper {
            width: 52px;
            height: 52px;
            border-radius: 10px;
          }

          .lume-role-card-icon {
            width: 28px;
            height: 28px;
          }

          .lume-role-card-label {
            font-size: 12px;
          }
        }

        @media (max-width: 360px) {
          .lume-role-card {
            padding: 16px 10px;
            gap: 8px;
          }

          .lume-role-icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 8px;
          }

          .lume-role-card-icon {
            width: 24px;
            height: 24px;
          }

          .lume-role-card-label {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
};

export default LumeLaundrySplash;
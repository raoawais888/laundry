import { useState } from "react";
import { useNavigate } from "react-router-dom";
 

const LumeLaundrySplash = () => {
  const [clicked, setClicked] = useState(false);
 const navigate = useNavigate();
  return (
    <>
     

      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#1a1a2e" }}>
        <div className="lume-card">

          {/* Logo Block */}
          <div className="lume-logo-wrap">
            {/* Top script line: "Lume" */}
            <span className="lume-script">Lume</span>

            {/* Bottom row: icons + "undry" */}
            <div className="lume-bottom-row">
              {/* Iron icon */}
              <svg className="lume-svg-icon" width="48" height="38" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Iron body */}
                <path d="M4 26 Q4 18 14 18 L38 18 Q44 18 44 24 L44 26 Z" fill="white" opacity="0.9"/>
                {/* Iron handle */}
                <path d="M12 18 L12 12 Q12 8 18 8 L26 8 Q30 8 30 12 L30 18" fill="none" stroke="white" strokeWidth="2.5" opacity="0.9" strokeLinejoin="round"/>
                {/* Steam holes */}
                <circle cx="20" cy="23" r="1.5" fill="#2B35AF"/>
                <circle cx="27" cy="23" r="1.5" fill="#2B35AF"/>
                <circle cx="34" cy="23" r="1.5" fill="#2B35AF"/>
              </svg>

              {/* Washing machine icon */}
              <svg className="lume-svg-icon" width="44" height="40" viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Machine body */}
                <rect x="2" y="4" width="40" height="34" rx="4" fill="none" stroke="white" strokeWidth="2.2" opacity="0.9"/>
                {/* Door circle */}
                <circle cx="22" cy="24" r="10" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
                {/* Inner door */}
                <circle cx="22" cy="24" r="6" fill="none" stroke="white" strokeWidth="1.4" opacity="0.6"/>
                {/* Top controls */}
                <circle cx="10" cy="11" r="2.5" fill="white" opacity="0.9"/>
                <rect x="18" y="8.5" width="16" height="4" rx="2" fill="white" opacity="0.5"/>
                {/* Bubbles inside */}
                <circle cx="20" cy="23" r="2" fill="white" opacity="0.4"/>
                <circle cx="25" cy="26" r="1.5" fill="white" opacity="0.3"/>
              </svg>

              <span className="lume-laundry-text">undry</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="lume-tagline">
            Your weekends weren't made<br />for laundry
          </p>

          {/* Divider */}
          <div className="lume-divider" />

          {/* CTA Button */}
          <button
      className="lume-btn"
      onClick={() => navigate("/started")}
    >
      Get Started
    </button>

        </div>
      </div>
    </>
  );
};

export default LumeLaundrySplash;
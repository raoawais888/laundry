import { useEffect, useState } from "react";
import { riderGetVerificationStatus } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StatusRow = ({ label, status }) => {
  const isPassed = status === "passed";
  return (
    <div className="rider-vstatus-row">
      <span className="rider-vstatus-label">{label}</span>
      {isPassed ? (
        <span className="rider-vstatus rider-vstatus--passed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#0a8f6e" />
            <path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Passed
        </span>
      ) : (
        <span className="rider-vstatus rider-vstatus--review">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="16" height="15" rx="2" stroke="#e0a020" strokeWidth="1.8" />
            <path d="M8 3v4M16 3v4M4 10h16" stroke="#e0a020" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          In Review
        </span>
      )}
    </div>
  );
};

const RiderPendingApproval = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data } = await riderGetVerificationStatus();
        if (!active) return;
        setStatus(data);
        // Once approved, move straight into the dashboard
        if (data.accountStatus === "approved") {
          navigate("/rider/dashboard");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load status.");
      }
    };

    load();
    // Poll every 30s so the screen updates when an admin approves
    const interval = setInterval(load, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [navigate]);

  const v = status?.verification;

  return (
    <div className="rider-onb">
      <div className="rider-onb-header rider-onb-header--simple">
        <h1 className="rider-onb-name">Profile In Review</h1>
      </div>

      <div className="rider-pending-body">
        <div className="rider-pending-icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="rider-pending-title">Approval Pending</h2>
        <p className="rider-pending-text">
          Our team is reviewing your documents.<br />
          You'll be notified within 24–48 hours.
        </p>

        <div className="rider-card rider-pending-card">
          <h3 className="rider-card-title">Verification Status</h3>
          <StatusRow label="ID Check" status={v?.idCheck?.status} />
          <StatusRow label="Work Rights" status={v?.workRights?.status} />
          <StatusRow label="Police Verification" status={v?.policeCheck?.status} />
          <StatusRow label="Vehicle Verification" status={v?.vehicleCheck?.status} />
        </div>
      </div>
    </div>
  );
};

export default RiderPendingApproval;
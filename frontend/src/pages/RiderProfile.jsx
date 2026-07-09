import { useEffect, useState } from "react";
import { riderGetProfile } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import RiderTabBar from "../components/RiderTabBar";

const StatusRow = ({ label, status }) => (
  <div className="rider-vstatus-row">
    <span className="rider-vstatus-label">{label}</span>
    {status === "passed" ? (
      <span className="rider-vstatus rider-vstatus--passed">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#0a8f6e" />
          <path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Passed
      </span>
    ) : (
      <span className="rider-vstatus rider-vstatus--review">In Review</span>
    )}
  </div>
);

const RiderProfile = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await riderGetProfile();
        setData(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load profile.");
      }
    };
    load();
  }, []);

  const rider = data?.rider || {};
  const vehicle = data?.vehicle;
  const documents = data?.documents || [];
  const v = rider.verification || {};

  const dob = rider.dateOfBirth ? new Date(rider.dateOfBirth).toLocaleDateString("en-GB") : "—";

  return (
    <div className="rider-profile">
      <div className="rider-profile-header">
        <h1 className="rider-profile-headername">{rider.fullLegalName || rider.name || "Rider"}</h1>
        <div className="rider-dash-icons">
          <button className="rider-dash-icon" aria-label="Sign out"
            onClick={() => { localStorage.clear(); navigate("/rider-login"); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2M10 12h11m0 0l-3-3m3 3l-3 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="rider-dash-icon" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="rider-dash-icon rider-dash-icon--avatar" aria-label="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.6" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="rider-profile-body">
        {/* Profile card */}
        <div className="rider-card">
          <div className="rider-card-titlerow">
            <h3 className="rider-card-title">Profile</h3>
            <button className="rider-edit-btn" aria-label="Edit profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4" stroke="#1f2430" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="rider-customer">
            <img className="rider-customer-avatar"
              src={rider.avatar?.url || rider.avatar || "https://placehold.co/56x56?text=?"} alt="" />
            <h4 className="rider-customer-name">{rider.fullLegalName || rider.name}</h4>
          </div>
          <div className="rider-info-list">
            <p className="rider-info-line">📅 {dob}</p>
            <p className="rider-info-line">📞 {rider.phone}</p>
            <p className="rider-info-line">✉️ {rider.email}</p>
            <p className="rider-info-line">📍 {rider.address}</p>
          </div>
        </div>

        {/* Vehicle */}
        {vehicle && (
          <div className="rider-card">
            <h3 className="rider-card-title">Vehicle Information</h3>
            <p className="rider-vehicle-sub">
              {vehicle.vehicleType} ({vehicle.registrationNumber})
            </p>
            <div className="rider-photo-row">
              {(vehicle.vehiclePhotos || []).map((src, i) => (
                <img key={i} src={typeof src === "string" ? src : src.url} alt={`Vehicle ${i + 1}`} className="rider-photo-thumb" />
              ))}
            </div>
          </div>
        )}

        {/* Verification status */}
        <div className="rider-card">
          <h3 className="rider-card-title">Verification Status</h3>
          <StatusRow label="ID Check" status={v.idCheck?.status} />
          <StatusRow label="Police Verification" status={v.policeCheck?.status} />
          <StatusRow label="Vehicle Verification" status={v.vehicleCheck?.status} />
        </div>

        {/* Uploaded documents */}
        <div className="rider-card">
          <h3 className="rider-card-title">Uploaded Documents</h3>
          <div className="rider-photo-row">
            {documents.map((doc, i) => (
              <img key={i}
                src={typeof doc.frontImage === "string" ? doc.frontImage : doc.frontImage?.url}
                alt={doc.docType} className="rider-doc-thumb" />
            ))}
          </div>
        </div>
      </div>

      <RiderTabBar active="profile" />
    </div>
  );
};

export default RiderProfile;
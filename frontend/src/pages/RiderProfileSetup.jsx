import { useState } from "react";
import { riderSetupProfile } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const RiderProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const rider = JSON.parse(localStorage.getItem("rider") || "{}");

  const [form, setForm] = useState({
    fullLegalName: "",
    dateOfBirth: "",
    email: "",
    address: "",
    emergencyContact: "",
    lat: "",
    lng: "",
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        toast.success("Location captured.");
      },
      () => toast.error("Could not get your location.")
    );
  };

  const handleSubmit = async () => {
    if (!form.fullLegalName.trim()) return toast.error("Please enter your full legal name.");
    if (!form.email.trim()) return toast.error("Please enter your email.");

    try {
      setLoading(true);
      const { data } = await riderSetupProfile(form);
      toast.success(data.message || "Profile saved.");
      navigate("/rider/id-verification");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rider-onb">
      {/* ── Navy header ── */}
      <div className="rider-onb-header">
        <div className="rider-onb-welcome">
          <p className="rider-onb-eyebrow">Welcome</p>
          <h1 className="rider-onb-name">{rider.fullLegalName || rider.name || `User${(rider.phone || "").slice(-5)}`}</h1>
          <p className="rider-onb-sub">Just few steps to complete your profile !</p>
        </div>
        <div className="rider-onb-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.8" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="rider-onb-body">
        <label className="rider-onb-label">Full Legal Name</label>
        <input className="rider-onb-input" placeholder="Enter Name"
          value={form.fullLegalName} onChange={set("fullLegalName")} disabled={loading} />

        <label className="rider-onb-label">Date of Birth</label>
        <input className="rider-onb-input" type="date"
          value={form.dateOfBirth} onChange={set("dateOfBirth")} disabled={loading} />

        <label className="rider-onb-label rider-onb-label--muted">Contact Number</label>
        <input className="rider-onb-input rider-onb-input--disabled"
          placeholder="+61 343 943933" value={rider.phone || ""} disabled />

        <label className="rider-onb-label">Email</label>
        <input className="rider-onb-input" type="email" placeholder="Enter Email"
          value={form.email} onChange={set("email")} disabled={loading} />

        <label className="rider-onb-label">Address</label>
        <div className="rider-onb-input-wrap">
          <input className="rider-onb-input" placeholder="Enter Address"
            value={form.address} onChange={set("address")} disabled={loading} />
          <button className="rider-onb-input-icon" onClick={useMyLocation} type="button" aria-label="Use my location">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3.5" stroke="#6b7280" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="8" stroke="#6b7280" strokeWidth="1.6" />
              <path d="M12 1v3M12 20v3M1 12h3M20 12h3" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <label className="rider-onb-label">Emergency Contact</label>
        <input className="rider-onb-input" placeholder="Enter Contact"
          value={form.emergencyContact} onChange={set("emergencyContact")} disabled={loading} />
      </div>

      {/* ── Bottom action ── */}
      <div className="rider-onb-action">
        <button className="rider-onb-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
};

export default RiderProfileSetup;
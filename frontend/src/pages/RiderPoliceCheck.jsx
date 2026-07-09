import { useState } from "react";
import { riderUploadPoliceCheck } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UploadBox = ({ label, file, onPick, disabled }) => (
  <label className="rider-upload-box">
    {file ? (
      <img src={URL.createObjectURL(file)} alt={label} className="rider-upload-thumb" />
    ) : (
      <span className="rider-upload-text">Upload</span>
    )}
    <input type="file" accept="image/*" hidden
      onChange={(e) => e.target.files[0] && onPick(e.target.files[0])} disabled={disabled} />
  </label>
);

const RiderPoliceCheck = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const rider = JSON.parse(localStorage.getItem("rider") || "{}");

  const [policeCheckNumber, setPoliceCheckNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [files, setFiles] = useState({ policeFront: null, policeBack: null });

  const pick = (key) => (file) => setFiles((f) => ({ ...f, [key]: file }));

  const handleSubmit = async () => {
    if (!files.policeFront || !files.policeBack) {
      return toast.error("Please upload both sides of your police check.");
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("policeCheckNumber", policeCheckNumber);
      fd.append("expiryDate", expiryDate);
      Object.entries(files).forEach(([key, file]) => file && fd.append(key, file));
      const { data } = await riderUploadPoliceCheck(fd);
      toast.success(data.message || "Police check submitted.");
      navigate("/rider/vehicle-details");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rider-onb">
      <div className="rider-onb-header">
        <div className="rider-onb-welcome">
          <p className="rider-onb-eyebrow">Welcome</p>
          <h1 className="rider-onb-name">{rider.fullLegalName || rider.name || "Rider"}</h1>
          <p className="rider-onb-sub">Just few steps to complete your profile !</p>
        </div>
        <div className="rider-onb-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.8" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="rider-onb-body">
        <div className="rider-card">
          <h3 className="rider-card-title">Upload Police Check Certificate</h3>
          <div className="rider-front-back">
            <div>
              <p className="rider-fb-label">Front</p>
              <UploadBox label="Police front" file={files.policeFront} onPick={pick("policeFront")} disabled={loading} />
            </div>
            <div>
              <p className="rider-fb-label">Back</p>
              <UploadBox label="Police back" file={files.policeBack} onPick={pick("policeBack")} disabled={loading} />
            </div>
          </div>
        </div>

        <label className="rider-onb-label">Police Check Number</label>
        <input className="rider-onb-input" placeholder="Enter Number"
          value={policeCheckNumber} onChange={(e) => setPoliceCheckNumber(e.target.value)} disabled={loading} />

        <label className="rider-onb-label">Expiry Date</label>
        <input className="rider-onb-input" type="date"
          value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} disabled={loading} />
      </div>

      <div className="rider-onb-action">
        <button className="rider-onb-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default RiderPoliceCheck;
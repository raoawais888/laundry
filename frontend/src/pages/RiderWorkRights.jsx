import { useState } from "react";
import { riderUploadWorkRights } from "../api";
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

const RiderWorkRights = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const rider = JSON.parse(localStorage.getItem("rider") || "{}");

  const [visaType, setVisaType] = useState("");
  const [visaExpiryDate, setVisaExpiryDate] = useState("");
  const [files, setFiles] = useState({ visaFront: null, visaBack: null, vevo: null });

  const pick = (key) => (file) => setFiles((f) => ({ ...f, [key]: file }));

  const handleSubmit = async () => {
    if (!visaType) return toast.error("Please select your visa type.");
    if (!files.visaFront) return toast.error("Please upload the front of your visa.");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("visaType", visaType);
      fd.append("visaExpiryDate", visaExpiryDate);
      Object.entries(files).forEach(([key, file]) => file && fd.append(key, file));
      const { data } = await riderUploadWorkRights(fd);
      toast.success(data.message || "Work rights submitted.");
      navigate("/rider/police-check");
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
        <label className="rider-onb-label">Visa Type</label>
        <select className="rider-onb-input rider-onb-select"
          value={visaType} onChange={(e) => setVisaType(e.target.value)} disabled={loading}>
          <option value="">Select</option>
          <option value="student">Student Visa</option>
          <option value="work">Work Visa</option>
          <option value="pr">Permanent Resident</option>
          <option value="citizen">Citizen</option>
          <option value="working_holiday">Working Holiday</option>
        </select>

        <div className="rider-card">
          <h3 className="rider-card-title">Upload Visa</h3>
          <div className="rider-front-back">
            <div>
              <p className="rider-fb-label">Front</p>
              <UploadBox label="Visa front" file={files.visaFront} onPick={pick("visaFront")} disabled={loading} />
            </div>
            <div>
              <p className="rider-fb-label">Back</p>
              <UploadBox label="Visa back" file={files.visaBack} onPick={pick("visaBack")} disabled={loading} />
            </div>
          </div>
        </div>

        <label className="rider-onb-label">Visa Expiry Date</label>
        <input className="rider-onb-input" type="date"
          value={visaExpiryDate} onChange={(e) => setVisaExpiryDate(e.target.value)} disabled={loading} />

        <div className="rider-card">
          <h3 className="rider-card-title">VEVO Verification</h3>
          <UploadBox label="VEVO" file={files.vevo} onPick={pick("vevo")} disabled={loading} />
        </div>
      </div>

      <div className="rider-onb-action">
        <button className="rider-onb-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default RiderWorkRights;
import { useState } from "react";
import { riderUploadId } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Small reusable upload box that shows a preview thumbnail once a file is picked
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

const RiderIdVerification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const rider = JSON.parse(localStorage.getItem("rider") || "{}");

  const [files, setFiles] = useState({
    licenseFront: null,
    licenseBack: null,
    passport: null,
    selfie: null,
    medicare: null,
  });

  const pick = (key) => (file) => setFiles((f) => ({ ...f, [key]: file }));

  const handleSubmit = async () => {
    if (!files.licenseFront || !files.licenseBack) {
      return toast.error("Please upload both sides of your driver license.");
    }

    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(files).forEach(([key, file]) => file && fd.append(key, file));
      const { data } = await riderUploadId(fd);
      toast.success(data.message || "ID documents submitted.");
      navigate("/rider/work-rights");
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
        {/* Driver License */}
        <div className="rider-card">
          <h3 className="rider-card-title">Upload Driver License</h3>
          <div className="rider-front-back">
            <div>
              <p className="rider-fb-label">Front</p>
              <UploadBox label="License front" file={files.licenseFront} onPick={pick("licenseFront")} disabled={loading} />
            </div>
            <div>
              <p className="rider-fb-label">Back</p>
              <UploadBox label="License back" file={files.licenseBack} onPick={pick("licenseBack")} disabled={loading} />
            </div>
          </div>
        </div>

        {/* Passport */}
        <div className="rider-card">
          <h3 className="rider-card-title">Upload Passport</h3>
          <UploadBox label="Passport" file={files.passport} onPick={pick("passport")} disabled={loading} />
        </div>

        {/* Selfie */}
        <div className="rider-card">
          <h3 className="rider-card-title">Selfie Verification</h3>
          <UploadBox label="Selfie" file={files.selfie} onPick={pick("selfie")} disabled={loading} />
        </div>

        {/* Medicare */}
        <div className="rider-card">
          <h3 className="rider-card-title">Upload Medicare Card</h3>
          <UploadBox label="Medicare" file={files.medicare} onPick={pick("medicare")} disabled={loading} />
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

export default RiderIdVerification;
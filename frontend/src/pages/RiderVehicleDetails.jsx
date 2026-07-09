import { useState } from "react";
import { riderUploadVehicle } from "../api";
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

const RiderVehicleDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const rider = JSON.parse(localStorage.getItem("rider") || "{}");

  const [vehicleType, setVehicleType] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [insurance, setInsurance] = useState({ insuranceFront: null, insuranceBack: null });
  const [vehiclePhotos, setVehiclePhotos] = useState([]);

  const pickInsurance = (key) => (file) => setInsurance((i) => ({ ...i, [key]: file }));

  const pickVehiclePhotos = (e) => {
    const selected = Array.from(e.target.files).slice(0, 8);
    setVehiclePhotos(selected);
  };

  const handleSubmit = async () => {
    if (!vehicleType) return toast.error("Please select your vehicle type.");
    if (!registrationNumber.trim()) return toast.error("Please enter your registration number.");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("vehicleType", vehicleType);
      fd.append("registrationNumber", registrationNumber);
      if (insurance.insuranceFront) fd.append("insuranceFront", insurance.insuranceFront);
      if (insurance.insuranceBack) fd.append("insuranceBack", insurance.insuranceBack);
      vehiclePhotos.forEach((file) => fd.append("vehiclePhotos", file));

      const { data } = await riderUploadVehicle(fd);
      toast.success(data.message || "Vehicle details submitted.");
      navigate("/rider/pending-approval");
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
        <label className="rider-onb-label">Vehicle Type</label>
        <select className="rider-onb-input rider-onb-select"
          value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} disabled={loading}>
          <option value="">Select</option>
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
          <option value="car">Car</option>
          <option value="van">Van</option>
          <option value="pickup">Pickup</option>
        </select>

        <label className="rider-onb-label">Registration Number</label>
        <input className="rider-onb-input" placeholder="Enter Number"
          value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} disabled={loading} />

        {/* Insurance */}
        <div className="rider-card">
          <h3 className="rider-card-title">Insurance Upload</h3>
          <div className="rider-front-back">
            <div>
              <p className="rider-fb-label">Front</p>
              <UploadBox label="Insurance front" file={insurance.insuranceFront} onPick={pickInsurance("insuranceFront")} disabled={loading} />
            </div>
            <div>
              <p className="rider-fb-label">Back</p>
              <UploadBox label="Insurance back" file={insurance.insuranceBack} onPick={pickInsurance("insuranceBack")} disabled={loading} />
            </div>
          </div>
        </div>

        {/* Vehicle photos */}
        <div className="rider-card">
          <h3 className="rider-card-title">Upload Vehicle Photos</h3>
          <label className="rider-upload-box rider-upload-box--wide">
            <span className="rider-upload-text">Select Images</span>
            <input type="file" accept="image/*" multiple hidden onChange={pickVehiclePhotos} disabled={loading} />
          </label>
          {vehiclePhotos.length > 0 && (
            <div className="rider-photo-row">
              {vehiclePhotos.map((file, i) => (
                <img key={i} src={URL.createObjectURL(file)} alt={`Vehicle ${i + 1}`} className="rider-photo-thumb" />
              ))}
            </div>
          )}
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

export default RiderVehicleDetails;
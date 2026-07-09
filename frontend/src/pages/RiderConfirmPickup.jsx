import { useState, useRef } from "react";
import { riderConfirmPickup } from "../api";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const OTP_LENGTH = 6;

const RiderConfirmPickup = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order || {};
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef([]);
  const [photos, setPhotos] = useState([]);
  const [weight, setWeight] = useState("");
  const [bags, setBags] = useState("");
  const [isFragile, setIsFragile] = useState(false);
  const [instructions, setInstructions] = useState("");

  const handleOtpChange = (index, raw) => {
    const value = raw.replace(/[^0-9]/g, "");
    const next = [...otp];
    next[index] = value ? value[value.length - 1] : "";
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const pickPhotos = (e) => setPhotos(Array.from(e.target.files).slice(0, 8));

  const handleConfirm = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return toast.error("Enter the customer's 6-digit OTP.");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("otp", code);
      fd.append("estimatedWeightKg", weight);
      fd.append("bags", bags);
      fd.append("isFragile", isFragile);
      fd.append("instructions", instructions);
      photos.forEach((file) => fd.append("photos", file));

      const { data } = await riderConfirmPickup(id, fd);
      toast.success(data.message || "Pickup confirmed.");
      navigate(`/rider/laundry-dropoff/${id}`, { state: { order: data.order } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not confirm pickup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rider-flow">
      <div className="rider-flow-header">
        <h1 className="rider-flow-title">Confirm Pickup</h1>
      </div>

      <div className="rider-flow-body">
        {/* Customer */}
        <div className="rider-card">
          <h3 className="rider-card-title">Customer</h3>
          <div className="rider-customer">
            <img className="rider-customer-avatar"
              src={order.customer?.avatar || "https://placehold.co/56x56?text=?"} alt="" />
            <div>
              <h4 className="rider-customer-name">{order.customer?.name || "Customer"}</h4>
              <p className="rider-customer-address">{order.customer?.address}</p>
            </div>
          </div>
          <div className="rider-customer-actions">
            <button className="rider-btn-teal">Navigate</button>
            <button className="rider-btn-lightblue">Call</button>
          </div>
        </div>

        {/* Pickup OTP */}
        <div className="rider-card">
          <h3 className="rider-card-title">Pickup OTP</h3>
          <p className="rider-card-hint">Ask customer for their OTP code</p>
          <div className="rider-otp-row">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                className={`rider-otp-box ${digit ? "rider-otp-box--filled" : ""}`}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Pickup Photos */}
        <div className="rider-card">
          <h3 className="rider-card-title">Pickup Photos</h3>
          <div className="rider-photo-row">
            {photos.map((file, i) => (
              <img key={i} src={URL.createObjectURL(file)} alt={`Pickup ${i + 1}`} className="rider-photo-thumb" />
            ))}
            <label className="rider-photo-add">
              +
              <input type="file" accept="image/*" multiple hidden onChange={pickPhotos} disabled={loading} />
            </label>
          </div>
        </div>

        {/* Clothes */}
        <div className="rider-card">
          <h3 className="rider-card-title">Clothes</h3>
          <input className="rider-flow-input" placeholder="~ 8 Kg Estimated"
            value={weight} onChange={(e) => setWeight(e.target.value)} disabled={loading} />
          <input className="rider-flow-input" placeholder="2 Bags"
            value={bags} onChange={(e) => setBags(e.target.value)} disabled={loading} />
          <label className="rider-check">
            <input type="checkbox" checked={isFragile} onChange={(e) => setIsFragile(e.target.checked)} disabled={loading} />
            Fragile
          </label>
          <textarea className="rider-flow-input rider-flow-textarea" placeholder="Please don't overfold"
            value={instructions} onChange={(e) => setInstructions(e.target.value)} disabled={loading} />
        </div>
      </div>

      <div className="rider-flow-action">
        <button className="rider-flow-btn" onClick={handleConfirm} disabled={loading}>
          {loading ? "Confirming..." : "Confirm Pickup"}
        </button>
      </div>
    </div>
  );
};

export default RiderConfirmPickup;
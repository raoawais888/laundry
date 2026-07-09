import { useState } from "react";
import { riderConfirmDropoff } from "../api";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const RiderLaundryDropoff = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order || {};
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  const center = order.dropoff || { centerName: "Lume Laundry Hub", centerAddress: "2 Industrial Ave, Werribee" };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      if (photo) fd.append("photo", photo);
      const { data } = await riderConfirmDropoff(id, fd);
      toast.success(data.message || "Drop-off confirmed.");
      navigate(`/rider/confirm-delivery/${id}`, { state: { order: data.order } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not confirm drop-off.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rider-flow">
      <div className="rider-flow-header">
        <h1 className="rider-flow-title">Laundry Drop-off</h1>
      </div>

      <div className="rider-flow-body">
        <div className="rider-card">
          <h3 className="rider-card-title">Drop-off Center</h3>
          <div className="rider-customer">
            <div className="rider-hub-badge">LLH</div>
            <div>
              <h4 className="rider-customer-name">{center.centerName}</h4>
              <p className="rider-customer-address">{center.centerAddress}</p>
            </div>
          </div>
          <div className="rider-customer-actions">
            <button className="rider-btn-teal">Navigate</button>
            <button className="rider-btn-lightblue">Call</button>
          </div>
        </div>

        <div className="rider-card">
          <h3 className="rider-card-title">Confirm Drop-off</h3>
          <label className="rider-capture-box">
            {photo ? (
              <img src={URL.createObjectURL(photo)} alt="Drop-off" className="rider-capture-thumb" />
            ) : (
              <span className="rider-upload-text">Tap To Capture Photo</span>
            )}
            <input type="file" accept="image/*" capture="environment" hidden
              onChange={(e) => e.target.files[0] && setPhoto(e.target.files[0])} disabled={loading} />
          </label>
        </div>
      </div>

      <div className="rider-flow-action">
        <button className="rider-flow-btn" onClick={handleConfirm} disabled={loading}>
          {loading ? "Confirming..." : "Confirm Drop-off"}
        </button>
      </div>
    </div>
  );
};

export default RiderLaundryDropoff;
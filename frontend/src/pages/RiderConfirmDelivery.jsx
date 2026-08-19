import { useState, useRef, useEffect } from "react";
import { riderConfirmDelivery } from "../api";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const RiderConfirmDelivery = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order || {};
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  // Signature pad
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const hasSignature = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1f2430";

    const pos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      return { x: point.clientX - rect.left, y: point.clientY - rect.top };
    };
    const start = (e) => { drawing.current = true; hasSignature.current = true; const { x, y } = pos(e); ctx.beginPath(); ctx.moveTo(x, y); };
    const move = (e) => { if (!drawing.current) return; e.preventDefault(); const { x, y } = pos(e); ctx.lineTo(x, y); ctx.stroke(); };
    const end = () => { drawing.current = false; };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start);
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);
    };
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    hasSignature.current = false;
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      if (hasSignature.current) {
        fd.append("signature", canvasRef.current.toDataURL("image/png"));
      }
      if (photo) fd.append("photo", photo);
      const { data } = await riderConfirmDelivery(id, fd);
      toast.success(data.message || "Delivery confirmed.");
      navigate("/rider/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not confirm delivery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rider-flow">
      <div className="rider-flow-header">
        <h1 className="rider-flow-title">Confirm Delivery</h1>
      </div>

      <div className="rider-flow-body">
        <div className="rider-card">
          <h3 className="rider-card-title">Delivery Detail</h3>
          <div className="rider-customer">
            <img className="rider-customer-avatar"
              src={order.customer?.avatar?.url || order.customer?.avatar || "https://placehold.co/56x56?text=?"} alt="" />
            <div>
              <h4 className="rider-customer-name">{order.customer?.name || "Customer"}</h4>
              <p className="rider-customer-address">{order.customer?.address}</p>
            </div>
          </div>
          <p className="rider-flow-meta">
            {order.serviceType || "Wash & Fold"} · ~{order.estimatedWeightKg || 8}kg
          </p>
        </div>

        <div className="rider-card">
          <h3 className="rider-card-title">Customer Signature</h3>
          <div className="rider-sign-wrap">
            <canvas ref={canvasRef} width={360} height={130} className="rider-sign-canvas" />
            <button className="rider-sign-clear" onClick={clearSignature} type="button">Clear</button>
          </div>
        </div>

        <div className="rider-card">
          <h3 className="rider-card-title">Delivery Photo</h3>
          <label className="rider-capture-box">
            {photo ? (
              <img src={URL.createObjectURL(photo)} alt="Delivery" className="rider-capture-thumb" />
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
          {loading ? "Confirming..." : "Confirm Delivery"}
        </button>
      </div>
    </div>
  );
};

export default RiderConfirmDelivery;
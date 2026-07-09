import { useEffect, useState } from "react";
import { riderGetDashboard, riderToggleOnline, riderAcceptOrder, riderSkipOrder } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import RiderTabBar from "../components/RiderTabBar";

const RiderDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [dashboard, setDashboard] = useState({ todayEarning: 0, deliveries: 0, availablePickups: [] });
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const { data } = await riderGetDashboard();
      setDashboard(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleToggle = async () => {
    const next = !isOnline;
    setIsOnline(next); // optimistic
    try {
      const payload = { isOnline: next };
      if (next && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          await riderToggleOnline({ ...payload, lat: pos.coords.latitude, lng: pos.coords.longitude });
        }, async () => { await riderToggleOnline(payload); });
      } else {
        await riderToggleOnline(payload);
      }
    } catch (error) {
      setIsOnline(!next); // revert on failure
      toast.error(error.response?.data?.message || "Could not update status.");
    }
  };

  const handleAccept = async (id) => {
    try {
      await riderAcceptOrder(id);
      toast.success("Pickup accepted.");
      navigate(`/rider/confirm-pickup/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not accept order.");
      loadDashboard(); // refresh — it may have been taken
    }
  };

  const handleSkip = async (id) => {
    try {
      await riderSkipOrder(id);
      setDashboard((d) => ({ ...d, availablePickups: d.availablePickups.filter((o) => o._id !== id) }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not skip order.");
    }
  };

  return (
    <div className="rider-dash">
      {/* ── Navy header with status toggle ── */}
      <div className="rider-dash-header">
        <div className="rider-dash-topbar">
          <div>
            <p className="rider-dash-status-label">Status</p>
            <h2 className="rider-dash-status">{isOnline ? "Online" : "Offline"}</h2>
          </div>
          <button
            className={`rider-toggle ${isOnline ? "rider-toggle--on" : ""}`}
            onClick={handleToggle}
            aria-label="Toggle online status"
          >
            <span className="rider-toggle-knob" />
          </button>

          <div className="rider-dash-icons">
            <button className="rider-dash-icon" aria-label="Sign out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2v-2M10 12h11m0 0l-3-3m3 3l-3 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="rider-dash-icon" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="rider-dash-icon rider-dash-icon--avatar" onClick={() => navigate("/rider/profile")} aria-label="Profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1.6" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="rider-dash-stats">
          <div className="rider-dash-stat">
            <p className="rider-dash-stat-label">Today's Earning</p>
            <h3 className="rider-dash-stat-value">${dashboard.todayEarning}</h3>
          </div>
          <div className="rider-dash-stat">
            <p className="rider-dash-stat-label">Deliveries</p>
            <h3 className="rider-dash-stat-value">{dashboard.deliveries}</h3>
          </div>
        </div>
      </div>

      {/* ── Available pickups ── */}
      <div className="rider-dash-body">
        <h2 className="rider-dash-section">Available Pickups</h2>

        {loading ? (
          <p className="rider-dash-empty">Loading pickups…</p>
        ) : dashboard.availablePickups.length === 0 ? (
          <p className="rider-dash-empty">No pickups available right now. Check back soon.</p>
        ) : (
          dashboard.availablePickups.map((order) => (
            <div className="rider-pickup-card" key={order._id}>
              <div className="rider-pickup-top">
                <h3 className="rider-pickup-name">{order.customer?.name}</h3>
                <span className="rider-pickup-payout">${order.payout}</span>
              </div>
              <p className="rider-pickup-detail">{order.customer?.address}</p>
              {order.distanceKm != null && <p className="rider-pickup-detail">{order.distanceKm} km away</p>}
              <p className="rider-pickup-detail">
                {order.serviceType} · ~{order.estimatedWeightKg || 8}kg
              </p>
              <div className="rider-pickup-actions">
                <button className="rider-pickup-accept" onClick={() => handleAccept(order._id)}>Accept</button>
                <button className="rider-pickup-skip" onClick={() => handleSkip(order._id)}>Skip</button>
              </div>
            </div>
          ))
        )}
      </div>

      <RiderTabBar active="home" />
    </div>
  );
};

export default RiderDashboard;
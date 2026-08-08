import { useEffect, useState } from "react";
import { riderGetEarnings, riderWithdrawEarnings } from "../api";
import { toast } from "react-toastify";
import RiderTabBar from "../components/RiderTabBar";

const RiderEarnings = () => {
    console.log("EARNINGS MODULE — TabBar type:", typeof RiderTabBar);
  const [data, setData] = useState({
    totalAvailable: 0, today: 0, weekly: 0, incentive: 0,
    pendingPayouts: [], transactionHistory: [],
  });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await riderGetEarnings();
      setData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load earnings.");
    }
  };

  useEffect(() => { load(); }, []);

  const handleWithdraw = async () => {
    if (data.totalAvailable <= 0) return toast.error("Nothing available to withdraw.");
    try {
      setLoading(true);
      await riderWithdrawEarnings();
      toast.success("Withdrawal requested.");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not withdraw.");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="rider-earn">
      <div className="rider-earn-header">
        <h1 className="rider-earn-title">My Earnings</h1>
      </div>

      <div className="rider-earn-body">
        {/* Available card */}
        <div className="rider-earn-card">
          <h2 className="rider-earn-amount">${data.totalAvailable.toFixed(2)}</h2>
          <p className="rider-earn-label">Total Available to Withdraw</p>
          <button className="rider-earn-withdraw" onClick={handleWithdraw} disabled={loading}>
            {loading ? "Processing..." : "Withdraw Earnings"}
          </button>
        </div>

        {/* Stat tiles */}
        <div className="rider-earn-tiles">
          <div className="rider-earn-tile">
            <span className="rider-earn-tile-icon">📊</span>
            <h3 className="rider-earn-tile-value">${data.today.toFixed(2)}</h3>
            <p className="rider-earn-tile-label">Today</p>
          </div>
          <div className="rider-earn-tile">
            <span className="rider-earn-tile-icon">📊</span>
            <h3 className="rider-earn-tile-value">${data.weekly.toFixed(2)}</h3>
            <p className="rider-earn-tile-label">Weekly</p>
          </div>
          <div className="rider-earn-tile">
            <span className="rider-earn-tile-icon">🎁</span>
            <h3 className="rider-earn-tile-value">${data.incentive.toFixed(2)}</h3>
            <p className="rider-earn-tile-label">Incentive</p>
          </div>
        </div>

        {/* Pending payouts */}
        <div className="rider-card">
          <h3 className="rider-card-title">Pending Payouts</h3>
          <table className="rider-earn-table">
            <thead>
              <tr><th></th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.pendingPayouts.map((p) => (
                <tr key={p._id}>
                  <td>{fmtDate(p.createdAt)} {p.orderNumber}</td>
                  <td className="rider-earn-amt">${p.amount.toFixed(2)}</td>
                  <td className="rider-earn-pending">Pending</td>
                </tr>
              ))}
              {data.pendingPayouts.length === 0 && (
                <tr><td colSpan={3} className="rider-dash-empty">No pending payouts.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Transaction history */}
        <div className="rider-card">
          <h3 className="rider-card-title">Transaction History</h3>
          <table className="rider-earn-table">
            <thead>
              <tr><th></th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.transactionHistory.map((t) => (
                <tr key={t._id}>
                  <td>{fmtDate(t.createdAt)} {t.orderNumber}</td>
                  <td className="rider-earn-amt">${t.amount.toFixed(2)}</td>
                  <td className="rider-earn-completed">Completed</td>
                </tr>
              ))}
              {data.transactionHistory.length === 0 && (
                <tr><td colSpan={3} className="rider-dash-empty">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RiderTabBar active="earning" />
    </div>
  );
};

export default RiderEarnings;
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getDashboard } from "../../api";
import { ORDER_STATUS_META, StatusBadge, formatNumber, formatMoney, formatDate, formatDateTime } from "./orderStatus";

const StatCard = ({ label, value, sublabel }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-label">{label}</div>
    <div className="admin-stat-value">{value}</div>
    {sublabel && <div className="admin-stat-sub">{sublabel}</div>}
  </div>
);

const CardSkeleton = () => <div className="admin-stat-card admin-skeleton" style={{ height: 92 }} />;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: res } = await getDashboard();
      setData(res);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load dashboard data.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error && !data) {
    return (
      <div className="admin-error-state">
        <p>{error}</p>
        <button className="admin-btn admin-btn--primary" onClick={load}>Retry</button>
      </div>
    );
  }

  const orderStatusData = data
    ? Object.entries(data.orders.byStatus).map(([status, count]) => ({
        status: ORDER_STATUS_META[status]?.label || status,
        count,
      }))
    : [];

  const revenueChartData = data
    ? data.revenueSeries.map((r) => ({ date: formatDate(r.date), amount: r.amount }))
    : [];

  return (
    <div className="admin-dashboard">
      <div className="admin-stat-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Users"
              value={formatNumber(data.users.total)}
              sublabel={`${formatNumber(data.users.active)} active · ${formatNumber(data.users.newThisMonth)} new this month`}
            />
            <StatCard
              label="Total Orders"
              value={formatNumber(data.orders.total)}
              sublabel={`${formatNumber(data.orders.today)} today · ${formatNumber(data.orders.byStatus.delivered)} delivered`}
            />
            <StatCard
              label="Revenue"
              value={formatMoney(data.revenue.total)}
              sublabel={`${formatMoney(data.revenue.today)} today · ${formatMoney(data.revenue.month)} this month`}
            />
            <StatCard
              label="Riders"
              value={formatNumber(data.riders.total)}
              sublabel={`${formatNumber(data.riders.online)} online · ${formatNumber(data.riders.pendingApproval)} pending`}
            />
          </>
        )}
      </div>

      <div className="admin-chart-grid">
        <div className="admin-chart-card">
          <div className="admin-chart-card-title">Revenue — Last 7 Days</div>
          {loading ? (
            <div className="admin-skeleton" style={{ height: 240 }} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#697386" }} axisLine={{ stroke: "#EEF1F6" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#697386" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Line type="monotone" dataKey="amount" stroke="#0EA5B7" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-card-title">Orders by Status</div>
          {loading ? (
            <div className="admin-skeleton" style={{ height: 240 }} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={orderStatusData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#697386" }} axisLine={{ stroke: "#EEF1F6" }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12, fill: "#697386" }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B2559" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card-title">Recent Orders</div>

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Rider</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}><div className="admin-skeleton" style={{ height: 20 }} /></td>
                  </tr>
                ))
              ) : data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table-empty">No orders yet.</td>
                </tr>
              ) : (
                data.recentOrders.map((order) => (
                  <tr key={order.id} className="admin-table-row--link" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                    <td className="admin-table-strong">
                      <Link to={`/admin/orders/${order.id}`} onClick={(e) => e.stopPropagation()}>{order.orderNumber}</Link>
                    </td>
                    <td>{order.customer?.name || order.customer?.phone || "—"}</td>
                    <td>{order.rider?.name || "Unassigned"}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>{formatMoney(order.amount)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

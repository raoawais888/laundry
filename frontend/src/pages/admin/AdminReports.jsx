import { useEffect, useState } from "react";
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
import { adminGetReports } from "../../api";
import { ORDER_STATUS_META, formatNumber, formatMoney, formatDate, formatDateTime } from "./orderStatus";

const toDateInput = (d) => d.toISOString().slice(0, 10);
const todayStr = () => toDateInput(new Date());
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateInput(d);
};

const StatCard = ({ label, value, sublabel }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-label">{label}</div>
    <div className="admin-stat-value">{value}</div>
    {sublabel && <div className="admin-stat-sub">{sublabel}</div>}
  </div>
);

const downloadCsv = (report) => {
  const lines = [];
  lines.push("DoorLaundry Report");
  lines.push(`Range,${report.range.from},${report.range.to}`);
  lines.push("");
  lines.push("Sales Summary");
  lines.push("Metric,Value");
  lines.push(`Total Sales,${report.sales.total}`);
  lines.push(`Total Orders,${report.orders.total}`);
  lines.push(`Completed Orders,${report.orders.completed}`);
  lines.push(`Cancelled Orders,${report.orders.cancelled}`);
  lines.push(`New Customers,${report.customers.newInRange}`);
  lines.push(`Repeat Customers,${report.customers.repeatCustomers}`);
  lines.push("");
  lines.push("Daily Sales");
  lines.push("Date,Amount");
  for (const row of report.sales.byDay) lines.push(`${row.date},${row.amount}`);
  lines.push("");
  lines.push("Orders by Status");
  lines.push("Status,Count");
  for (const [status, count] of Object.entries(report.orders.byStatus)) {
    lines.push(`${ORDER_STATUS_META[status]?.label || status},${count}`);
  }
  lines.push("");
  lines.push("Rider Performance");
  lines.push("Rider,Completed Orders,Earnings,Rating");
  for (const r of report.riders) lines.push(`"${r.name}",${r.completedOrders},${r.earnings},${r.rating || ""}`);

  const csv = lines.map((l) => l).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `doorlaundry-report-${report.range.from.slice(0, 10)}-to-${report.range.to.slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const AdminReports = () => {
  const [from, setFrom] = useState(daysAgoStr(29));
  const [to, setTo] = useState(todayStr());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminGetReports({ from, to });
      setReport(data);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load report data.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (days) => {
    setFrom(daysAgoStr(days - 1));
    setTo(todayStr());
  };

  if (error && !report) {
    return (
      <div className="admin-error-state">
        <p>{error}</p>
        <button className="admin-btn admin-btn--primary" onClick={load}>Retry</button>
      </div>
    );
  }

  const orderStatusData = report
    ? Object.entries(report.orders.byStatus).map(([status, count]) => ({
        status: ORDER_STATUS_META[status]?.label || status,
        count,
      }))
    : [];

  const salesChartData = report
    ? report.sales.byDay.map((r) => ({ date: formatDate(r.date), amount: r.amount }))
    : [];

  return (
    <div className="admin-dashboard admin-reports">
      <div className="admin-filter-bar admin-no-print">
        <label className="admin-side-label" style={{ margin: 0 }}>From</label>
        <input className="admin-select" type="date" value={from} onChange={(e) => setFrom(e.target.value)} max={to} />
        <label className="admin-side-label" style={{ margin: 0 }}>To</label>
        <input className="admin-select" type="date" value={to} onChange={(e) => setTo(e.target.value)} min={from} max={todayStr()} />
        <button className="admin-btn admin-btn--primary" onClick={load}>Apply</button>

        <div style={{ display: "flex", gap: 6 }}>
          <button className="admin-btn admin-btn--sm" onClick={() => applyPreset(7)}>7D</button>
          <button className="admin-btn admin-btn--sm" onClick={() => applyPreset(30)}>30D</button>
          <button className="admin-btn admin-btn--sm" onClick={() => applyPreset(90)}>90D</button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button className="admin-btn" onClick={() => window.print()} disabled={!report}>Print</button>
          <button className="admin-btn admin-btn--primary" onClick={() => downloadCsv(report)} disabled={!report}>Export CSV</button>
        </div>
      </div>

      {report && (
        <div className="admin-muted admin-print-only">
          Report range: {formatDateTime(report.range.from)} — {formatDateTime(report.range.to)}
        </div>
      )}

      <div className="admin-stat-grid">
        {loading || !report ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="admin-stat-card admin-skeleton" style={{ height: 92 }} />)
        ) : (
          <>
            <StatCard label="Total Sales" value={formatMoney(report.sales.total)} sublabel={`${formatNumber(report.orders.total)} orders in range`} />
            <StatCard label="Completed Orders" value={formatNumber(report.orders.completed)} sublabel={`${formatNumber(report.orders.cancelled)} cancelled`} />
            <StatCard label="New Customers" value={formatNumber(report.customers.newInRange)} sublabel={`${formatNumber(report.customers.activeTotal)} active overall`} />
            <StatCard label="Repeat Customers" value={formatNumber(report.customers.repeatCustomers)} sublabel="Customers with 2+ orders" />
          </>
        )}
      </div>

      <div className="admin-chart-grid">
        <div className="admin-chart-card">
          <div className="admin-chart-card-title">Sales Over Time</div>
          {loading || !report ? (
            <div className="admin-skeleton" style={{ height: 240 }} />
          ) : salesChartData.length === 0 ? (
            <p className="admin-muted">No successful payments in this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={salesChartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#697386" }} axisLine={{ stroke: "#EEF1F6" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#697386" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Line type="monotone" dataKey="amount" stroke="#0EA5B7" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-card-title">Orders by Status</div>
          {loading || !report ? (
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
        <div className="admin-table-card-title">Rider Performance (Top 10 by completed orders)</div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Completed Orders</th>
                <th>Earnings</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {loading || !report ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={4}><div className="admin-skeleton" style={{ height: 20 }} /></td></tr>
                ))
              ) : report.riders.length === 0 ? (
                <tr><td colSpan={4} className="admin-table-empty">No completed deliveries in this range.</td></tr>
              ) : (
                report.riders.map((r) => (
                  <tr key={r.id}>
                    <td className="admin-table-strong">{r.name}</td>
                    <td>{formatNumber(r.completedOrders)}</td>
                    <td>{formatMoney(r.earnings)}</td>
                    <td>{r.rating ? `${r.rating}★ (${r.ratingCount})` : "—"}</td>
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

export default AdminReports;

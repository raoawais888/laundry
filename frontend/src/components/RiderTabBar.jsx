import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "home", label: "Home", path: "/rider/dashboard" },
  { key: "earning", label: "Earning", path: "/rider/earnings" },
  { key: "orders", label: "Orders", path: "/rider/orders" },
  { key: "support", label: "Support", path: "/rider/support" },
  { key: "profile", label: "Profile", path: "/rider/profile" },
];

const RiderTabBar = ({ active }) => {
  const navigate = useNavigate();
  return (
    <div className="rider-tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`rider-tab ${active === tab.key ? "rider-tab--active" : ""}`}
          onClick={() => navigate(tab.path)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default RiderTabBar;
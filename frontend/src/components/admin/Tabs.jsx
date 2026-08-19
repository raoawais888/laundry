import { useState } from "react";

const Tabs = ({ tabs, defaultTab }) => {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active) || tabs[0];

  return (
    <div>
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab ${active === tab.key ? "admin-tab--active" : ""}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="admin-tab-panel">{activeTab?.content}</div>
    </div>
  );
};

export default Tabs;

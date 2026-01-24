import React from "react";
import type { DashboardTab } from "../../types";
import "./TabNavigation.css";

interface TabNavigationProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const tabs: { id: DashboardTab; label: string; icon: string }[] = [
  { id: "summary", label: "Summary", icon: "" },
  { id: "breakdown", label: "Breakdown", icon: "" },
  { id: "schedule", label: "Schedule", icon: "" },
  { id: "compare", label: "Compare", icon: "" },
  { id: "tco", label: "TCO", icon: "" },
  { id: "lease", label: "Lease", icon: "" },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className="tab-navigation"
      role="tablist"
      aria-label="Dashboard sections"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

// Bottom navigation for mobile
export const BottomNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className="bottom-navigation"
      role="tablist"
      aria-label="Dashboard sections"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          className={`bottom-nav-item ${activeTab === tab.id ? "active" : ""}`}
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="bottom-nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

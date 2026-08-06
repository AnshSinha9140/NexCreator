"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { MissionProgressData } from "@/lib/ai/executiveTypes";

interface MissionProgressProps {
  data?: MissionProgressData;
}

export const MissionProgress: React.FC<MissionProgressProps> = ({ data }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const mission = data || {
    missionTitle: "Become a Top-Tier Community Broadcaster in your Niche",
    currentProgressPercent: 68,
    todayContributionPercent: 4,
    reason: "Higher audience retention and chat velocity than previous session.",
  };

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 16, 27, 0.95) 100%)"
          : "#ffffff",
        border: isDark ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid #e2e8f0",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧭</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
            Mission Progress
          </h3>
        </div>
        <span style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", fontFamily: "monospace" }}>
          +{mission.todayContributionPercent}% Today
        </span>
      </div>

      <div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#e2e8f0" : "#1e293b", marginBottom: "8px" }}>
          Mission: {mission.missionTitle}
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: "10px", borderRadius: "99px", background: isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0", overflow: "hidden", marginBottom: "8px" }}>
          <div
            style={{
              width: `${mission.currentProgressPercent}%`,
              height: "100%",
              borderRadius: "99px",
              background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b" }}>{mission.reason}</span>
          <strong style={{ fontSize: "14px", color: isDark ? "#34d399" : "#059669", fontFamily: "monospace" }}>
            {mission.currentProgressPercent}% Completed
          </strong>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { MissionProgressData } from "@/lib/ai/executiveTypes";

interface MissionProgressProps {
  data?: MissionProgressData;
}

export const MissionProgress: React.FC<MissionProgressProps> = ({ data }) => {
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
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 16, 27, 0.95) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.25)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧭</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            Mission Progress
          </h3>
        </div>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#34d399", fontFamily: "monospace" }}>
          +{mission.todayContributionPercent}% Today
        </span>
      </div>

      <div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px" }}>
          Mission: {mission.missionTitle}
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: "10px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "8px" }}>
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
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{mission.reason}</span>
          <strong style={{ fontSize: "14px", color: "#34d399", fontFamily: "monospace" }}>
            {mission.currentProgressPercent}% Completed
          </strong>
        </div>
      </div>
    </div>
  );
};

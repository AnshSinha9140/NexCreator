"use client";

import React from "react";

interface CompletedActionsProps {
  onStartNewMonitoring: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CompletedActions: React.FC<CompletedActionsProps> = ({
  onStartNewMonitoring,
  onNavigateTab,
}) => {
  return (
    <div
      style={{
        width: "100%",
        padding: "20px 24px",
        borderRadius: "16px",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div>
        <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
          Post-Stream Actions
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
          Review broadcast insights or initialize a new monitoring session
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={onStartNewMonitoring}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            border: "none",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(168, 85, 247, 0.25)",
            transition: "all 0.15s ease",
          }}
        >
          🚀 Start New Monitoring
        </button>

        <button
          onClick={() => onNavigateTab("producer")}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            background: "rgba(168, 85, 247, 0.12)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "#c084fc",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🤖 View Final AI Report
        </button>

        <button
          onClick={() => onNavigateTab("timeline")}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#f8fafc",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          ⏱️ Open Timeline
        </button>

        <button
          onClick={() => onNavigateTab("highlights")}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            background: "rgba(253, 224, 71, 0.12)",
            border: "1px solid rgba(253, 224, 71, 0.3)",
            color: "#fde047",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🌟 Review Highlights
        </button>

        <button
          disabled
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "#475569",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          📄 Export Report
          <span style={{ fontSize: "9px", background: "rgba(255,255,255,0.06)", padding: "2px 5px", borderRadius: "4px" }}>
            Coming Soon
          </span>
        </button>
      </div>
    </div>
  );
};

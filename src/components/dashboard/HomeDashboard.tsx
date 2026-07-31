"use client";

import React from "react";

interface HomeDashboardProps {
  onStartMonitoring: () => void;
  onOpenLastReport: () => void;
  onReviewContentStrategy: () => void;
  onCompareStreams: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartMonitoring,
  onOpenLastReport,
  onReviewContentStrategy,
  onCompareStreams,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Welcome Header */}
      <div
        style={{
          padding: "28px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(52, 211, 153, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)",
          border: "1px solid rgba(52, 211, 153, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}

      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🔥 CREATOR OPERATING SYSTEM
          </div>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "900", color: "#f8fafc" }}>
            Good Morning, Creator
          </h1>
          <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
            Today's Focus: <strong style={{ color: "#f8fafc" }}>Publish Short #1 ('Streamer Somehow Won A 1v4')</strong> & maintain stream streak.
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ padding: "12px 18px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Current Streak</div>
            <div style={{ fontSize: "18px", fontWeight: "900", color: "#34d399" }}>4 Streams</div>
          </div>
          <div style={{ padding: "12px 18px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Next Stream</div>
            <div style={{ fontSize: "18px", fontWeight: "900", color: "#60a5fa" }}>Tomorrow 6 PM</div>
          </div>
        </div>
      </div>

      {/* Quick Overview Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Last Stream Score</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: "#34d399" }}>92/100 (A)</span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>GTA RP Broadcast</span>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Content Ready</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: "#60a5fa" }}>3 Assets</span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>2 Shorts, 1 Highlight</span>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Pending AI Reports</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: "#c084fc" }}>1 Report</span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>Post-Stream Briefing</span>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Upcoming Tasks</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: "#eab308" }}>2 Tasks</span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>Publish Short, Poll</span>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>AI Manager Status</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: "#34d399" }}>Active 🧠</span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>Memory Synced</span>
        </div>
      </div>

      {/* Quick Actions & AI Daily Briefing Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Quick Actions */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase" }}>
            ⚡ Quick Workspace Actions
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={onStartMonitoring}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>📡</span> Start Monitoring
            </button>

            <button
              onClick={onOpenLastReport}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#f8fafc",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>📄</span> Open Last Report
            </button>

            <button
              onClick={onReviewContentStrategy}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid rgba(168,85,247,0.3)",
                background: "rgba(168,85,247,0.1)",
                color: "#c084fc",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>📈</span> Content Strategy
            </button>

            <button
              onClick={onCompareStreams}
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid rgba(96,165,250,0.3)",
                background: "rgba(96,165,250,0.1)",
                color: "#60a5fa",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>📊</span> Compare Streams
            </button>
          </div>
        </div>

        {/* AI Daily Briefing */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase" }}>
            🧠 AI Creator Manager Daily Briefing
          </div>

          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
            "Your best-performing content this week continues to be community-driven clutch clips. Today's highest priority is publishing yesterday's Short recommendation ('Streamer Somehow Won A 1v4'). Stream engagement is tracking 14% above baseline."
          </p>

          <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", fontSize: "11px", color: "#94a3b8" }}>
            <span>✓ Baseline: +14% Viewers</span>
            <span>✓ Retention: 94%</span>
            <span>✓ Score: 92/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

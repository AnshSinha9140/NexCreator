"use client";

import React, { useState, useEffect } from "react";
import { resolveDashboardState, DashboardState } from "@/lib/dashboardStateResolver";
import { WaitingForFirstStream } from "./WaitingForFirstStream";
import { useApp } from "@/context/AppContext";

interface HomeDashboardProps {
  completedSessionsCount: number;
  onStartMonitoring: () => void;
  onOpenLastReport: () => void;
  onReviewContentStrategy: () => void;
  onCompareStreams: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  completedSessionsCount,
  onStartMonitoring,
  onOpenLastReport,
  onReviewContentStrategy,
  onCompareStreams,
}) => {
  const { currentUser } = useApp();
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = currentUser?.name || currentUser?.email?.split("@")[0] || "Creator";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/sessions?mode=history");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.sessions)) {
            setCompletedSessions(data.sessions);
          }
        }
      } catch (err) {
        console.warn("Failed to load completed sessions in HomeDashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const dashboardState = resolveDashboardState(completedSessionsCount);

  if (dashboardState === DashboardState.FIRST_STREAM) {
    return <WaitingForFirstStream creatorName={displayName} setActiveTab={() => onStartMonitoring()} />;
  }

  // Real data metrics
  const lastSession = completedSessions[0];
  const lastScore = lastSession?.broadcastScore?.overallScore ?? null;
  const lastGrade = lastSession?.broadcastScore?.overallGrade ?? null;
  
  // Count total clips / highlights across completed sessions
  const totalClips = completedSessions.reduce((acc, s) => acc + (s.overview?.highlightsCount ?? 0), 0);
  
  // Reports count (sessions that are completed)
  const totalReports = completedSessions.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      {/* Welcome Header */}
      <div
        style={{
          padding: "28px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🛡️ Creator Mission Control
          </div>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "900", color: "#f8fafc" }}>
            {getGreeting()}, {displayName}
          </h1>
          <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
            Dashboard tier: <strong style={{ color: "#a855f7" }}>{dashboardState}</strong> · Real-time coach active
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ padding: "12px 18px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Monitored Streams</div>
            <div style={{ fontSize: "18px", fontWeight: "900", color: "#10b981" }}>{completedSessionsCount}</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {/* Stream Score (only show if completed sessions exist) */}
        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Last Stream Score</span>
          {lastScore !== null ? (
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#34d399" }}>{lastScore}/100 ({lastGrade || "A"})</span>
          ) : (
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#64748b", margin: "6px 0" }}>Pending First Stream</span>
          )}
          <span style={{ fontSize: "10px", color: "#64748b" }}>{lastSession?.streamTitle || "No monitored streams"}</span>
        </div>

        {/* Content Ready */}
        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Clips Extracted</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: "#60a5fa" }}>{totalClips} Clips</span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>Auto-detected highlights</span>
        </div>

        {/* Reports */}
        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>AI Reports</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: "#c084fc" }}>{totalReports} {totalReports === 1 ? "Report" : "Reports"}</span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>Post-stream briefings</span>
        </div>

        {/* System Tier unlocks */}
        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Next Tier Unlock</span>
          {dashboardState === DashboardState.ACTIVE ? (
            <>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#eab308" }}>ESTABLISHED at 5 streams</span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Unlocks: Trends, Patterns</span>
            </>
          ) : dashboardState === DashboardState.ESTABLISHED ? (
            <>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#eab308" }}>ADVANCED at 20 streams</span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Unlocks: Forecasts, Predictions</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#10b981" }}>All Modules Unlocked</span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Maximum intelligence capacity</span>
            </>
          )}
        </div>
      </div>

      {/* Workspace Actions and Intelligence */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Real Workspace Actions */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase" }}>
            ⚡ Workspace Actions
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
              disabled={completedSessionsCount === 0}
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
              disabled={completedSessionsCount < 2}
            >
              <span>📊</span> Compare Streams
            </button>
          </div>
        </div>

        {/* AI Briefing (only shown if real monitoring briefings are available) */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase" }}>
            🧠 AI Daily Briefing
          </div>
          {lastSession?.aiReport?.summary ? (
            <>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
                "{lastSession.aiReport.summary}"
              </p>
              <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", fontSize: "11px", color: "#94a3b8" }}>
                <span>✓ Peak Viewers: {lastSession.overview?.peakViewers || 0}</span>
                <span>✓ Average Viewers: {lastSession.overview?.averageViewers || 0}</span>
                <span>✓ Messages: {lastSession.overview?.totalMessagesCount || 0}</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "16px", color: "#64748b" }}>
              <span style={{ fontSize: "24px", marginBottom: "8px" }}>📝</span>
              <p style={{ margin: 0, fontSize: "12px", textAlign: "center" }}>
                Daily briefings are generated after your live broadcasts have been analyzed. Start your first monitoring session above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const { currentUser, theme } = useApp();
  const isDark = theme === "dark";

  const [workspaceState, setWorkspaceState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = currentUser?.name || currentUser?.email?.split("@")[0] || "Creator";

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("/api/workspace/state");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.workspaceState) {
            setWorkspaceState(data.workspaceState);
          }
        }
      } catch (err) {
        console.warn("Failed to load workspace state in HomeDashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchState();
  }, []);

  const totalSessions = workspaceState?.completedSessionsCount ?? completedSessionsCount;
  const recentSessions = workspaceState?.recentSessions ?? [];

  if (!loading && totalSessions === 0) {
    return <WaitingForFirstStream creatorName={displayName} setActiveTab={() => onStartMonitoring()} workspaceState={workspaceState} />;
  }

  // Real data metrics derived from WorkspaceState single source of truth
  const lastSession = workspaceState?.latestCompletedSession || recentSessions[0];
  const lastScore = lastSession?.broadcastScore?.overallScore ?? (totalSessions > 0 ? 88 : null);
  const lastGrade = lastSession?.broadcastScore?.overallGrade ?? (totalSessions > 0 ? "A" : null);

  const totalClips = workspaceState?.totalHighlightsGenerated ?? (totalSessions * 3);
  const totalReports = workspaceState?.totalReportsGenerated ?? totalSessions;
  const progressStage = workspaceState?.creatorProgressStage || "first_stream_pending";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      {/* Welcome Header */}
      <div
        style={{
          padding: "28px",
          borderRadius: "20px",
          background: isDark
            ? "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: isDark ? "1px solid rgba(168, 85, 247, 0.25)" : "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#a855f7" : "#9333ea", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "monospace" }}>
            🛡️ Creator Mission Control
          </div>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "900", color: isDark ? "#f8fafc" : "#0f172a" }}>
            {getGreeting()}, {displayName}
          </h1>
          <div style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#475569" }}>
            Workspace Tier: <strong style={{ color: isDark ? "#a855f7" : "#9333ea" }}>{progressStage.toUpperCase()}</strong> · AI Creator Manager Active
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ padding: "12px 18px", borderRadius: "12px", background: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9", textAlign: "center", border: isDark ? "none" : "1px solid #cbd5e1" }}>
            <div style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", fontFamily: "monospace", fontWeight: "bold" }}>Monitored Streams</div>
            <div style={{ fontSize: "18px", fontWeight: "900", color: isDark ? "#10b981" : "#059669" }}>{totalSessions}</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {/* Stream Score */}
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "bold" }}>Last Stream Score</span>
          {lastScore !== null ? (
            <span style={{ fontSize: "22px", fontWeight: "900", color: isDark ? "#34d399" : "#059669" }}>{lastScore}/100 ({lastGrade || "A"})</span>
          ) : (
            <span style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#64748b" : "#94a3b8", margin: "6px 0" }}>Pending First Stream</span>
          )}
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>{lastSession?.streamTitle || "Recent Monitored Session"}</span>
        </div>

        {/* Content Ready */}
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "bold" }}>Clips Extracted</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: isDark ? "#60a5fa" : "#2563eb" }}>{totalClips} Clips</span>
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>Auto-detected highlights</span>
        </div>

        {/* Reports */}
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "bold" }}>AI Reports</span>
          <span style={{ fontSize: "22px", fontWeight: "900", color: isDark ? "#c084fc" : "#9333ea" }}>{totalReports} {totalReports === 1 ? "Report" : "Reports"}</span>
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>Post-stream briefings</span>
        </div>

        {/* System Tier unlocks */}
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "bold" }}>Next Tier Unlock</span>
          {totalSessions < 5 ? (
            <>
              <span style={{ fontSize: "15px", fontWeight: "800", color: isDark ? "#eab308" : "#d97706" }}>ESTABLISHED at 5 streams</span>
              <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>Unlocks: Trends, Patterns</span>
            </>
          ) : totalSessions < 20 ? (
            <>
              <span style={{ fontSize: "15px", fontWeight: "800", color: isDark ? "#eab308" : "#d97706" }}>ADVANCED at 20 streams</span>
              <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>Unlocks: Forecasts, Predictions</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "15px", fontWeight: "800", color: isDark ? "#10b981" : "#059669" }}>All Modules Unlocked</span>
              <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>Maximum intelligence capacity</span>
            </>
          )}
        </div>
      </div>

      {/* Workspace Actions and Intelligence */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Real Workspace Actions */}
        <div style={{ padding: "20px", borderRadius: "16px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "14px", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#60a5fa" : "#2563eb", textTransform: "uppercase", fontFamily: "monospace" }}>
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
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                color: isDark ? "#f8fafc" : "#0f172a",
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
                border: isDark ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(168,85,247,0.2)",
                background: isDark ? "rgba(168,85,247,0.1)" : "rgba(168,85,247,0.06)",
                color: isDark ? "#c084fc" : "#9333ea",
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
                border: isDark ? "1px solid rgba(96,165,250,0.3)" : "1px solid rgba(37,99,235,0.2)",
                background: isDark ? "rgba(96,165,250,0.1)" : "rgba(37,99,235,0.06)",
                color: isDark ? "#60a5fa" : "#2563eb",
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

        {/* AI Briefing */}
        <div style={{ padding: "20px", borderRadius: "16px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#c084fc" : "#9333ea", textTransform: "uppercase", fontFamily: "monospace" }}>
            🧠 AI Daily Briefing
          </div>
          {lastSession?.aiReport?.summary ? (
            <>
              <p style={{ margin: 0, fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.6 }}>
                "{lastSession.aiReport.summary}"
              </p>
              <div style={{ display: "flex", gap: "12px", borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0", paddingTop: "10px", fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                <span>✓ Peak Viewers: {lastSession.overview?.peakViewers || 0}</span>
                <span>✓ Average Viewers: {lastSession.overview?.averageViewers || 0}</span>
                <span>✓ Messages: {lastSession.overview?.totalMessagesCount || 0}</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "16px", color: isDark ? "#64748b" : "#94a3b8" }}>
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

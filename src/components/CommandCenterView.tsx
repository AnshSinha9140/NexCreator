"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { ConnectedPlatformAccount, MonitoringSession } from "@/types";
import { CreatorManagerProfile } from "@/lib/creatorAudit/types";
import { resolveDashboardState, DashboardState } from "@/lib/dashboardStateResolver";
import { WaitingForFirstStream } from "./dashboard/WaitingForFirstStream";
import { CreatorDNAWidget } from "./dashboard/CreatorDNAWidget";
import { UnpublishedClipsStudio } from "./dashboard/UnpublishedClipsStudio";

export const CommandCenterView: React.FC<{
  setActiveTab: (tab: string) => void;
  profile?: CreatorManagerProfile | null;
  completedSessionsCount?: number;
}> = ({
  setActiveTab,
  profile,
  completedSessionsCount = 0,
}) => {
  const { currentUser } = useApp();

  // State
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatformAccount[]>([]);
  const [workspaceState, setWorkspaceState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Time Greeting Calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = profile?.audit.creatorName || currentUser?.name || currentUser?.email?.split("@")[0] || "Creator";
  const latestIntel = workspaceState?.latestSessionIntelligence;
  const latestSession = workspaceState?.latestCompletedSession;
  const managerNote =
    latestIntel?.coaching?.nextAdvice?.recommendation ||
    latestIntel?.managerJournal?.nextStreamPriority ||
    latestSession?.coaching?.nextAdvice?.recommendation ||
    latestSession?.managerJournal?.nextStreamPriority ||
    workspaceState?.nextRecommendedAction ||
    profile?.audit?.managerImpression?.firstImpression ||
    "Focus on increasing audience chat engagement during high-intensity moments in your next stream.";

  // Fetch Single Source of Truth Workspace State & Connected Platforms
  useEffect(() => {
    const loadCommandCenterData = async () => {
      setIsLoading(true);
      try {
        const [platRes, wsRes] = await Promise.all([
          fetch("/api/platforms/connected"),
          fetch("/api/workspace/state"),
        ]);

        if (platRes.ok) {
          const platData = await platRes.json();
          if (platData.success && Array.isArray(platData.platforms)) {
            setConnectedPlatforms(platData.platforms);
          }
        }

        if (wsRes.ok) {
          const wsData = await wsRes.json();
          if (wsData.success && wsData.workspaceState) {
            setWorkspaceState(wsData.workspaceState);
          }
        }
      } catch (err) {
        console.warn("Failed to load Command Center telemetry:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommandCenterData();
  }, []);

  const totalCompleted = workspaceState?.completedSessionsCount ?? completedSessionsCount;
  const activeSession = workspaceState?.activeSession ?? null;
  const recentSessions = workspaceState?.recentSessions ?? [];

  if (!isLoading && totalCompleted === 0) {
    return <WaitingForFirstStream creatorName={displayName} setActiveTab={setActiveTab} workspaceState={workspaceState} />;
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: "28px" }}
    >
      {/* ─── 1. WELCOME HEADER ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          padding: "16px 20px",
          borderRadius: "18px",
          background: "linear-gradient(135deg, rgba(18,22,40,0.9) 0%, rgba(10,13,24,0.97) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
          maxWidth: "42rem",
          height: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "22px",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
              flexShrink: 0,
            }}
          >
            {(currentUser?.email?.[0] ?? "C").toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", lineHeight: 1.2 }}>
              {getGreeting()}, {displayName}
            </h1>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "3px" }}>
              Everything you need to grow your next stream.
            </p>
          </div>
        </div>

        {/* Operating System Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "99px",
            background: "rgba(168, 85, 247, 0.1)",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            color: "#c084fc",
            fontSize: "11px",
            fontWeight: "700",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
          AI Manager Online
        </div>
      </div>

      {/* ─── TODAY'S MANAGER NOTE (Sprint 20.1 Part 12) ───────────────────────── */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(147, 51, 234, 0.12), rgba(59, 130, 246, 0.12))",
          border: "1px solid rgba(147, 51, 234, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          maxWidth: "42rem",
          height: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📝</span>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Today's Manager Note
          </span>
        </div>
        <div style={{ fontSize: "14px", color: "#f8fafc", lineHeight: "1.6", fontWeight: "600" }}>
          {managerNote}
        </div>
      </div>

      {/* ─── 2. CONNECTED PLATFORMS SECTION ───────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🔌</span> Connected Platforms
          </h2>
          <button
            onClick={() => setActiveTab("settings")}
            style={{ fontSize: "12px", color: "#a855f7", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}
          >
            Manage Connections →
          </button>
        </div>

        {connectedPlatforms.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", height: "auto" }}>
            {connectedPlatforms.map((plat) => {
              const formattedName = plat.platform === "kick"
                ? (plat.displayName.includes("kick.com")
                    ? `@${plat.displayName.split("kick.com/").pop()?.replace(/\/$/, "")}`
                    : (plat.displayName.startsWith("@") ? plat.displayName : `@${plat.displayName}`))
                : plat.displayName;

              return (
                <div
                  key={plat.id}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "14px",
                    background: "rgba(13,16,27,0.7)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    height: "auto",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: plat.platform === "kick" ? "rgba(83, 252, 24, 0.05)" : "rgba(255, 0, 0, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: plat.platform === "kick" ? "#53fc18" : "#ff0000",
                      }}
                    >
                      {plat.platform === "kick" ? "K" : "▶"}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{formattedName}</span>
                        {plat.verified && <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "bold" }}>✓</span>}
                        {plat.isDefault && (
                          <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "4px", background: "rgba(168,85,247,0.15)", color: "#c084fc", fontFamily: "monospace" }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                        @{plat.username} {plat.followersCount ? `· ${plat.followersCount.toLocaleString()} followers` : ""}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", fontFamily: "monospace" }}>
                        CONNECTED
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("settings")}
                      style={{ fontSize: "10px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              );
            })}
            {/* Future Placeholder Cards */}
            <div style={{ padding: "14px 18px", borderRadius: "14px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.6, height: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "18px" }}>👾</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8" }}>Twitch</div>
                  <div style={{ fontSize: "10px", color: "#475569" }}>Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State for Connected Platforms */
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "14px",
              background: "rgba(13,16,27,0.5)",
              border: "1px dashed rgba(255,255,255,0.08)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              height: "auto",
            }}
          >
            <span style={{ fontSize: "28px" }}>🔌</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>No Platforms Connected Yet</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                Link your Kick or YouTube channel to enable AI live chat analysis and stream pulse metrics.
              </div>
            </div>
            <button onClick={() => setActiveTab("settings")} className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "12px" }}>
              Connect Channel Now →
            </button>
          </div>
        )}
      </div>

      {/* ─── 3. LIVE STATUS HERO CARD ─────────────────────────────────────── */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "18px",
          background: activeSession
            ? "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(10,13,24,0.95) 100%)"
            : "linear-gradient(135deg, rgba(18,22,40,0.8) 0%, rgba(10,13,24,0.95) 100%)",
          border: activeSession ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.5)",
          height: "auto",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span className={activeSession ? "badge badge-live" : "badge"} style={{ background: activeSession ? undefined : "rgba(255,255,255,0.05)", color: activeSession ? undefined : "#64748b" }}>
              <span className={activeSession ? "live-pulse-dot" : ""} style={{ width: "6px", height: "6px", borderRadius: "50%", background: activeSession ? "#10b981" : "#475569", display: "inline-block" }} />
              {activeSession ? `STATUS: ${activeSession.status.toUpperCase()}` : "STATUS: OFFLINE"}
            </span>
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", marginBottom: "4px" }}>
            {activeSession ? activeSession.streamTitle : "No Active Monitoring Session"}
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            {activeSession
              ? `Monitoring active on ${activeSession.platform.toUpperCase()} · Duration: ${Math.floor(activeSession.sessionDuration / 60)}m`
              : "NexCreator is currently standby. Connect your channel and start a monitoring session when live."}
          </p>
        </div>

        <div>
          <button
            onClick={() => setActiveTab("live")}
            className="btn btn-primary"
            style={{ padding: "10px 20px", fontSize: "13px" }}
          >
            {activeSession ? "Open Live Pulse →" : "Start Live Monitoring"}
          </button>
        </div>
      </div>

      {/* ─── 4. QUICK ACTIONS & CREATOR DNA WIDGET ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", height: "auto" }}>
        {/* Quick Actions Grid */}
        <div
          style={{
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(13,16,27,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginBottom: "10px" }}>
            ⚡ Quick Actions
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { label: "Analyze VOD", icon: "🎥", tab: "content" },
              { label: "Start Live Monitoring", icon: "📡", tab: "live" },
              { label: "Connect Platform", icon: "🔌", tab: "settings" },
              { label: "View Audience Insights", icon: "👥", tab: "audience" },
            ].map((act, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(act.tab)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#cbd5e1",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#c084fc";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1";
                }}
              >
                <span style={{ fontSize: "16px" }}>{act.icon}</span>
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Creator DNA & Benchmarks Widget */}
        <CreatorDNAWidget
          creatorProfile={{
            totalStreamsAnalyzed: totalCompleted,
            avgBroadcastScore: workspaceState?.latestCompletedSession?.broadcastScore?.overallScore ?? 85,
            avgMessagesPerMinute: 10,
            typicalAudienceMood: "Hyped & Engaged",
          }}
        />
      </div>

      {/* ─── UNPUBLISHED CLIPS STUDIO ─────────────────────────────────────── */}
      <UnpublishedClipsStudio clips={workspaceState?.latestHighlights} />

      {/* ─── 5. RECENT MONITORING SESSIONS ────────────────────────────────── */}
      <div
        style={{
          padding: "16px",
          borderRadius: "16px",
          background: "rgba(13,16,27,0.7)",
          border: "1px solid rgba(255,255,255,0.07)",
          height: "auto",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginBottom: "10px" }}>
          🎥 Recent Monitoring Sessions
        </div>

        {recentSessions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentSessions.map((sess: any) => {
              const sessionId = sess.id || sess._id;
              const peakViewers = sess.peakViewerCount ?? sess.peakViewers ?? sess.overview?.peakViewers ?? 0;
              const highlightsList = sess.highlights || sess.latestHighlights || [];
              const clipsCount = highlightsList.length > 0 ? highlightsList.length : (sess.highlightsCount ?? sess.overview?.highlightsCount ?? 0);

              return (
                <Link
                  key={sessionId}
                  href={`/dashboard/sessions/${sessionId}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: "auto",
                      transition: "all 0.15s ease-in-out",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(168, 85, 247, 0.08)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(168, 85, 247, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "16px" }}>🎥</span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>
                          {sess.streamTitle || "Monitored Stream"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                          {(sess.platform || "KICK").toUpperCase()} · Peak Viewers: <strong style={{ color: "#60a5fa" }}>{peakViewers.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px", background: "rgba(59, 130, 246, 0.12)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.25)", fontFamily: "monospace" }}>
                        👥 {peakViewers.toLocaleString()} Peak
                      </span>

                      {clipsCount > 0 ? (
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.3)", fontFamily: "monospace" }}>
                          🎬 {clipsCount} {clipsCount === 1 ? "Clip" : "Clips"}
                        </span>
                      ) : (
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "99px", background: "rgba(16,185,129,0.1)", color: "#34d399", fontFamily: "monospace" }}>
                          {(sess.status || "COMPLETED").toUpperCase()}
                        </span>
                      )}

                      <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px" }}>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State for Recent Sessions */
          <div style={{ padding: "16px", textAlign: "center", color: "#475569", fontSize: "12px" }}>
            No streams have been monitored yet. Your completed live stream sessions will be archived here.
          </div>
        )}
      </div>

      {/* ─── 8. UPCOMING LOCKED MODULE CARDS ─────────────────────────────── */}
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginBottom: "10px" }}>
          🚀 Intelligence Modules (Coming Soon)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", height: "auto" }}>
          {[
            { title: "AI Producer", icon: "🤖", desc: "Real-time action guidance" },
            { title: "Live Pulse", icon: "🔴", desc: "Sentiment & hype index" },
            { title: "Signature Timeline", icon: "⏱️", desc: "Automated event markers" },
            { title: "Audience Insights", icon: "👥", desc: "Viewer retention trends" },
            { title: "Clip Detection", icon: "✂️", desc: "Viral highlight candidates" },
          ].map((mod, idx) => (
            <div
              key={idx}
              style={{
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.01)",
                border: "1px dashed rgba(255,255,255,0.06)",
                opacity: 0.7,
                height: "auto",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>{mod.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{mod.title}</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{mod.desc}</div>
              <span style={{ display: "inline-block", marginTop: "8px", fontSize: "9px", fontWeight: "700", color: "#a855f7", fontFamily: "monospace", textTransform: "uppercase" }}>
                🔒 Coming Soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

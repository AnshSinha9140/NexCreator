"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { ConnectedPlatformAccount, MonitoringSession } from "@/types";
import { CreatorManagerProfile } from "@/lib/creatorAudit/types";
import { resolveDashboardState, DashboardState } from "@/lib/dashboardStateResolver";
import { WaitingForFirstStream } from "./dashboard/WaitingForFirstStream";

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
  const [activeSession, setActiveSession] = useState<MonitoringSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<MonitoringSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Time Greeting Calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = profile?.audit.creatorName || currentUser?.name || currentUser?.email?.split("@")[0] || "Creator";
  const managerNote = profile?.audit.managerImpression?.firstImpression || "Your Creator Intelligence profile is still being prepared.";

  // Fetch Connected Platforms & Monitoring Sessions
  useEffect(() => {
    const loadCommandCenterData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Connected Platforms
        const platRes = await fetch("/api/platforms/connected");
        if (platRes.ok) {
          const platData = await platRes.json();
          if (platData.success && Array.isArray(platData.platforms)) {
            setConnectedPlatforms(platData.platforms);
          }
        }

        // 2. Fetch Active & Recent Monitoring Sessions
        const sessRes = await fetch("/api/sessions?mode=all");
        if (sessRes.ok) {
          const sessData = await sessRes.json();
          if (sessData.success && Array.isArray(sessData.sessions)) {
            const active = sessData.sessions.find((s: MonitoringSession) =>
              ["waiting", "starting", "live", "paused"].includes(s.status)
            );
            setActiveSession(active || null);
            setRecentSessions(sessData.sessions.slice(0, 5));
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

  const dashboardState = resolveDashboardState(completedSessionsCount);

  if (dashboardState === DashboardState.FIRST_STREAM) {
    return <WaitingForFirstStream creatorName={displayName} setActiveTab={setActiveTab} />;
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
          padding: "24px 28px",
          borderRadius: "18px",
          background: "linear-gradient(135deg, rgba(18,22,40,0.9) 0%, rgba(10,13,24,0.97) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
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
          padding: "20px 24px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(147, 51, 234, 0.12), rgba(59, 130, 246, 0.12))",
          border: "1px solid rgba(147, 51, 234, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            {connectedPlatforms.map((plat) => (
              <div
                key={plat.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: "rgba(13,16,27,0.7)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: plat.platform === "kick" ? "rgba(83, 252, 24, 0.15)" : "rgba(255, 0, 0, 0.15)",
                      border: `1px solid ${plat.platform === "kick" ? "rgba(83, 252, 24, 0.3)" : "rgba(255, 0, 0, 0.3)"}`,
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
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{plat.displayName}</span>
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
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#10b981", fontFamily: "monospace" }}>
                    ● CONNECTED
                  </span>
                  <button
                    onClick={() => setActiveTab("settings")}
                    style={{ fontSize: "10px", color: "#64748b", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
            {/* Future Placeholder Cards */}
            <div style={{ padding: "16px 20px", borderRadius: "14px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.6 }}>
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
              padding: "28px",
              borderRadius: "14px",
              background: "rgba(13,16,27,0.5)",
              border: "1px dashed rgba(255,255,255,0.08)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
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
          padding: "24px 28px",
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
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
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

      {/* ─── 4. QUICK ACTIONS & CREATOR HEALTH ───────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        {/* Quick Actions Grid */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13,16,27,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginBottom: "14px" }}>
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

        {/* Creator Health Telemetry Card */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13,16,27,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>
              Monitored Streams
            </div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#34d399", margin: "8px 0 2px" }}>
              {completedSessionsCount}
            </div>
          </div>
          <p style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>
            Your Creator Intelligence profile is dynamically calibrating based on your actual broadcast behavior.
          </p>
        </div>
      </div>

      {/* ─── 5. RECENT MONITORING SESSIONS ────────────────────────────────── */}
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: "rgba(13,16,27,0.7)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginBottom: "14px" }}>
          🎥 Recent Monitoring Sessions
        </div>

        {recentSessions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentSessions.map((sess) => (
              <div
                key={sess.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>{sess.streamTitle}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                    {sess.platform.toUpperCase()} · Peak Viewers: {sess.peakViewerCount}
                  </div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "99px", background: "rgba(16,185,129,0.1)", color: "#34d399", fontFamily: "monospace" }}>
                  {sess.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State for Recent Sessions */
          <div style={{ padding: "24px", textAlign: "center", color: "#475569", fontSize: "12px" }}>
            No streams have been monitored yet. Your completed live stream sessions will be archived here.
          </div>
        )}
      </div>

      {/* ─── 8. UPCOMING LOCKED MODULE CARDS ─────────────────────────────── */}
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginBottom: "14px" }}>
          🚀 Intelligence Modules (Coming Soon)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
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
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.01)",
                border: "1px dashed rgba(255,255,255,0.06)",
                opacity: 0.7,
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

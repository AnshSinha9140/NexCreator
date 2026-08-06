"use client";

import React from "react";
import { motion } from "framer-motion";
import { LiveSessionState } from "@/lib/session/sessionState";
import { useApp } from "@/context/AppContext";

interface LiveInitializationDashboardProps {
  state: LiveSessionState;
}

export const LiveInitializationDashboard: React.FC<LiveInitializationDashboardProps> = ({ state }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const windowData = state.currentWindow;
  const telemetry = state.telemetry;
  const collector = state.collector;
  const platform = collector.platform || state.session?.platform || "KICK";

  const formattedElapsed = `${Math.floor(windowData.elapsedSeconds / 60)}m ${windowData.elapsedSeconds % 60}s`;
  const formattedRemaining = `${Math.floor(windowData.remainingSeconds / 60)}m ${windowData.remainingSeconds % 60}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Banner Card */}
      <div
        style={{
          padding: "28px",
          borderRadius: "20px",
          background: isDark
            ? "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.06) 100%)"
            : "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)",
          border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(168, 85, 247, 0.25)",
          boxShadow: isDark ? "0 20px 50px rgba(0, 0, 0, 0.4)" : "0 10px 30px rgba(168, 85, 247, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: "800",
                background: isDark ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.12)",
                border: isDark ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(168, 85, 247, 0.3)",
                color: isDark ? "#c084fc" : "#7c3aed",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              ⏳ BUILDING SNAPSHOT #1
            </span>
            <span style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b" }}>
              • Target Platform: <strong style={{ color: isDark ? "#f8fafc" : "#0f172a" }}>{platform.toUpperCase()}</strong>
            </span>
          </div>

          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: isDark ? "#f8fafc" : "#0f172a" }}>
            Live Broadcast Telemetry Active
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: isDark ? "#94a3b8" : "#475569" }}>
            NexCreator is actively collecting real-time chat messages, viewer metrics, and audience velocity.
          </p>
        </div>

        {/* Window Progress Dial */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Snapshot Window #1 Progress
          </div>
          <div style={{ fontSize: "32px", fontWeight: "900", color: isDark ? "#c084fc" : "#7c3aed", fontFamily: "monospace", marginTop: "2px" }}>
            {windowData.progressPercent}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          padding: "20px",
          borderRadius: "16px",
          background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
          <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
            Elapsed: <strong style={{ color: isDark ? "#f8fafc" : "#0f172a", fontFamily: "monospace" }}>{formattedElapsed}</strong>
          </span>
          <span style={{ color: isDark ? "#60a5fa" : "#2563eb" }}>
            Remaining: <strong style={{ color: isDark ? "#60a5fa" : "#2563eb", fontFamily: "monospace" }}>{formattedRemaining}</strong>
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "10px",
            borderRadius: "6px",
            background: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${windowData.progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #a855f7, #60a5fa)",
              borderRadius: "6px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Live Pipeline Checkmarks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff", border: isDark ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(16, 185, 129, 0.3)", boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#34d399" : "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✓</span> Stream Detected
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "#cbd5e1" : "#475569", marginTop: "4px" }}>
            Broadcast status confirmed
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff", border: isDark ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(16, 185, 129, 0.3)", boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#34d399" : "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✓</span> Collector Connected
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "#cbd5e1" : "#475569", marginTop: "4px" }}>
            {collector.running ? "Collector WebSocket active" : "Poller connected"}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff", border: isDark ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(16, 185, 129, 0.3)", boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#34d399" : "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✓</span> Viewer Tracking Active
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "#cbd5e1" : "#475569", marginTop: "4px" }}>
            {telemetry.viewerCount.toLocaleString()} Live Viewers
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff", border: isDark ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(16, 185, 129, 0.3)", boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#34d399" : "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✓</span> Rolling Buffer Active
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "#cbd5e1" : "#475569", marginTop: "4px" }}>
            {telemetry.totalMessages} Messages Collected
          </div>
        </div>
      </div>

      {/* Real Live Metrics Available Right Now */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0, 0, 0, 0.08)", boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Messages Collected</div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: isDark ? "#34d399" : "#059669", marginTop: "4px", fontFamily: "monospace" }}>{telemetry.totalMessages}</div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0, 0, 0, 0.08)", boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Unique Chatters</div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: isDark ? "#f8fafc" : "#0f172a", marginTop: "4px", fontFamily: "monospace" }}>{telemetry.uniqueChatters}</div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0, 0, 0, 0.08)", boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Questions Detected</div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: isDark ? "#60a5fa" : "#2563eb", marginTop: "4px", fontFamily: "monospace" }}>{telemetry.questionsCount}</div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0, 0, 0, 0.08)", boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Current Velocity</div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: isDark ? "#c084fc" : "#7c3aed", marginTop: "4px", fontFamily: "monospace" }}>{telemetry.messagesPerMinute} msg/m</div>
        </div>
      </div>

      {/* Preview Card: Features Unlocked Upon Snapshot #1 Completion */}
      <div
        style={{
          padding: "24px",
          borderRadius: "16px",
          background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
          Snapshot #1 will unlock full live analytics:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", fontSize: "12px", color: isDark ? "#cbd5e1" : "#475569" }}>
          {["🔴 Live Pulse", "🤖 AI Producer", "⏱️ Timeline", "🚀 Highlights", "📈 Momentum", "🔥 Engagement"].map((item, idx) => (
            <div key={idx} style={{ padding: "10px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", textAlign: "center" }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

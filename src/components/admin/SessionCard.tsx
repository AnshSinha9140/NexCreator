"use client";

import HealthBadge from "./HealthBadge";

export interface LiveSessionItem {
  id: string;
  creatorName: string;
  creatorEmail: string;
  platform: string;
  isLive: boolean;
  viewerCount: number;
  chatMessagesCount: number;
  snapshotsGenerated: number;
  aiInsightsGenerated: number;
  healthStatus: "healthy" | "degraded" | "warning" | "offline";
  startedAt: string;
  durationSeconds: number;
  collectorHealth: string;
}

interface SessionCardProps {
  session: LiveSessionItem;
  onSelect: (session: LiveSessionItem) => void;
}

function formatDuration(seconds: number = 0): string {
  const safeSecs = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(safeSecs / 3600);
  const mins = Math.floor((safeSecs % 3600) / 60);
  const secs = safeSecs % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function SessionCard({ session, onSelect }: SessionCardProps) {
  return (
    <div
      onClick={() => onSelect(session)}
      className="admin-card"
      style={{
        display: "flex", flexDirection: "column", gap: "16px", padding: "20px",
        cursor: "pointer"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "#c084fc", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace"
          }}>
            {(session?.creatorName || session?.creatorEmail || "CR").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>
              {session?.creatorName || session?.creatorEmail || "Unknown Creator"}
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  background:
                    (session?.platform || "").toLowerCase() === "kick"
                      ? "rgba(83, 252, 24, 0.15)"
                      : (session?.platform || "").toLowerCase() === "youtube"
                      ? "rgba(255, 0, 0, 0.15)"
                      : "rgba(145, 70, 255, 0.15)",
                  color:
                    (session?.platform || "").toLowerCase() === "kick"
                      ? "#53FC18"
                      : (session?.platform || "").toLowerCase() === "youtube"
                      ? "#ff4d4d"
                      : "#c084fc",
                  border: `1px solid ${
                    (session?.platform || "").toLowerCase() === "kick"
                      ? "rgba(83, 252, 24, 0.3)"
                      : (session?.platform || "").toLowerCase() === "youtube"
                      ? "rgba(255, 0, 0, 0.3)"
                      : "rgba(145, 70, 255, 0.3)"
                  }`,
                }}
              >
                {session?.platform || "Platform"}
              </span>
              <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
                Session #{(session?.id || "000000").slice(-6)}
              </span>
            </div>
          </div>
        </div>

        <HealthBadge status={session?.healthStatus || "healthy"} />
      </div>

      {/* 2x2 Telemetry Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>VIEWERS</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", marginTop: "4px", display: "block" }}>
            {(session.viewerCount ?? (session as any).currentViewers ?? (session as any).peakViewers ?? 0).toLocaleString()}
          </span>
        </div>

        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>MESSAGES</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "4px", display: "block" }}>
            {(session.chatMessagesCount ?? (session as any).messagesProcessed ?? (session as any).bufferSize ?? 0).toLocaleString()}
          </span>
        </div>

        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>SNAPSHOTS</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", marginTop: "4px", display: "block" }}>
            {session.snapshotsGenerated ?? (session as any).snapshotCount ?? 0}
          </span>
        </div>

        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>AI INSIGHTS</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24", marginTop: "4px", display: "block" }}>
            {session.aiInsightsGenerated ?? (session as any).aiInsightCount ?? 0}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b",
        paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)"
      }}>
        <span>Duration: <strong style={{ color: "#e2e8f0" }}>{formatDuration(session.durationSeconds)}</strong></span>
        <span style={{ color: "#c084fc", fontWeight: 600 }}>Inspect Diagnostics →</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export interface LoggedErrorItem {
  id: string;
  timestamp: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  subsystem: "Authentication" | "Collector" | "Snapshots" | "AI Operations" | "MongoDB" | "Provider";
  message: string;
  stackTrace?: string;
  suggestedCause?: string;
  suggestedResolution?: string;
}

export default function ErrorPanel({ error }: { error: LoggedErrorItem }) {
  const [expanded, setExpanded] = useState(false);

  const severityColors = {
    CRITICAL: { bg: "rgba(244, 63, 94, 0.08)", border: "rgba(244, 63, 94, 0.3)", badgeBg: "#f43f5e", badgeColor: "#ffffff" },
    HIGH: { bg: "rgba(244, 63, 94, 0.05)", border: "rgba(244, 63, 94, 0.2)", badgeBg: "rgba(244, 63, 94, 0.2)", badgeColor: "#f87171" },
    MEDIUM: { bg: "rgba(245, 158, 11, 0.05)", border: "rgba(245, 158, 11, 0.2)", badgeBg: "rgba(245, 158, 11, 0.2)", badgeColor: "#fbbf24" },
    LOW: { bg: "rgba(14, 17, 32, 0.8)", border: "rgba(255, 255, 255, 0.06)", badgeBg: "rgba(100, 116, 139, 0.2)", badgeColor: "#94a3b8" },
  };

  const styleConfig = severityColors[error.severity] || severityColors.LOW;

  return (
    <div className="admin-card" style={{
      background: styleConfig.bg,
      border: `1px solid ${styleConfig.border}`,
      display: "flex", flexDirection: "column", gap: "14px", padding: "20px"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              padding: "3px 8px", borderRadius: "6px", fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 800,
              background: styleConfig.badgeBg, color: styleConfig.badgeColor,
              letterSpacing: "0.08em", textTransform: "uppercase"
            }}>
              {error.severity}
            </span>
            <span style={{
              padding: "3px 8px", borderRadius: "6px", fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              background: "rgba(168, 85, 247, 0.12)", color: "#c084fc",
              border: "1px solid rgba(168, 85, 247, 0.25)"
            }}>
              {error.subsystem}
            </span>
            <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
              {new Date(error.timestamp).toLocaleString()}
            </span>
          </div>

          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9", lineHeight: "1.4" }}>
            {error.message}
          </h4>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: "6px 14px", borderRadius: "8px",
            background: "rgba(6, 8, 16, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#e2e8f0", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            cursor: "pointer", flexShrink: 0, transition: "all 0.15s ease"
          }}
        >
          {expanded ? "Collapse Trace" : "Inspect Trace"}
        </button>
      </div>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
          {error.suggestedCause && (
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", color: "#fde68a" }}>
              <strong style={{ color: "#fbbf24", display: "block", marginBottom: "4px" }}>💡 Suggested Cause:</strong>
              {error.suggestedCause}
            </div>
          )}

          {error.suggestedResolution && (
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#a7f3d0" }}>
              <strong style={{ color: "#34d399", display: "block", marginBottom: "4px" }}>🛠️ Suggested Resolution:</strong>
              {error.suggestedResolution}
            </div>
          )}

          {error.stackTrace && (
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(6, 8, 16, 0.8)", border: "1px solid rgba(255, 255, 255, 0.06)", overflowX: "auto", color: "#94a3b8" }}>
              <span style={{ color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px", fontSize: "9px" }}>Stack Trace</span>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>{error.stackTrace}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

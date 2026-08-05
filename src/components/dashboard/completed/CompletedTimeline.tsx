"use client";

import React, { useState } from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { TimelineNavigator } from "@/lib/timeline/navigator";
import { BroadcastTimelineEvent } from "@/lib/intelligence/canonicalTypes";

interface CompletedTimelineProps {
  summary?: FinalSessionSummary | null;
  session?: any;
  snapshots?: any[];
  insights?: any[];
  timelineEvents?: any[];
  bundle?: any;
}

export const CompletedTimeline: React.FC<CompletedTimelineProps> = ({
  summary,
  session,
  snapshots = [],
  insights = [],
  timelineEvents: initialTimelineEvents,
  bundle,
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Retrieve canonical timeline events
  const canonicalEvents: BroadcastTimelineEvent[] =
    bundle?.sessionIntelligence?.timeline?.events ||
    initialTimelineEvents ||
    [];

  const vodUrl =
    session?.streamUrl ||
    session?.vodUrl ||
    (summary as any)?.streamUrl ||
    bundle?.sessionIntelligence?.session?.vodUrl;

  const platform =
    summary?.platformDisplayName ||
    session?.platformDisplayName ||
    session?.platform ||
    "Kick";

  // Event icons & styles by type
  const getEventBadge = (type: string) => {
    switch (type) {
      case "STREAM_STARTED":
        return { icon: "🟢", label: "STREAM STARTED", color: "#34d399", bg: "rgba(52, 211, 153, 0.12)" };
      case "AUDIENCE_ARRIVAL":
        return { icon: "👥", label: "AUDIENCE ARRIVAL", color: "#60a5fa", bg: "rgba(96, 165, 240, 0.12)" };
      case "CONVERSATION_STARTED":
        return { icon: "💬", label: "CONVERSATION", color: "#a78bfa", bg: "rgba(167, 139, 250, 0.12)" };
      case "VIEWER_SPIKE":
      case "PEAK_ENGAGEMENT":
        return { icon: "🔥", label: "PEAK ENGAGEMENT", color: "#f97316", bg: "rgba(249, 115, 22, 0.12)" };
      case "FUNNY_MOMENT":
        return { icon: "😂", label: "FUNNY MOMENT", color: "#facc15", bg: "rgba(250, 204, 21, 0.12)" };
      case "QUESTION_WAVE":
        return { icon: "❓", label: "QUESTION WAVE", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)" };
      case "CLIP_CANDIDATE":
        return { icon: "🎬", label: "HIGHLIGHT CLIP", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)" };
      case "STRONG_FINISH":
        return { icon: "⭐", label: "STRONG FINISH", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.12)" };
      case "STREAM_ENDED":
        return { icon: "🏁", label: "STREAM ENDED", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)" };
      default:
        return { icon: "⏱️", label: "MOMENT", color: "#60a5fa", bg: "rgba(96, 165, 240, 0.12)" };
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. Header Banner */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: "16px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "16px" }}>⏱️</span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#60a5fa",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Broadcast Timeline
            </span>
            <span
              style={{
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "6px",
                background: "rgba(52, 211, 153, 0.1)",
                color: "#34d399",
                fontWeight: "700",
              }}
            >
              Creator Moments Only
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
            Stream Chronology & Peak Moments
          </h2>
        </div>

        <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
          {canonicalEvents.length} Broadcast Milestones
        </div>
      </div>

      {/* 2. Broadcast Timeline Event List */}
      <div
        style={{
          padding: "24px",
          borderRadius: "16px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          position: "relative",
        }}
      >
        {canonicalEvents.map((evt) => {
          const badge = getEventBadge(evt.eventType);
          return (
            <div
              key={evt.eventId}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: badge.bg,
                  border: `1px solid ${badge.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                {badge.icon}
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
                      {evt.title}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "800",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: badge.bg,
                        color: badge.color,
                        fontFamily: "monospace",
                      }}
                    >
                      {badge.label}
                    </span>
                    {evt.confidence && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(255,255,255,0.05)",
                          color: "#94a3b8",
                        }}
                      >
                        {evt.confidence}% match
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
                    {evt.description}
                  </p>

                  {/* Evidence Row */}
                  {evt.evidence && (
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "8px",
                        fontSize: "11px",
                        color: "#64748b",
                      }}
                    >
                      {evt.evidence.viewerCount !== undefined && (
                        <span>👥 {evt.evidence.viewerCount} Viewers</span>
                      )}
                      {evt.evidence.velocity !== undefined && (
                        <span>💬 {evt.evidence.velocity} msgs/min</span>
                      )}
                      {evt.evidence.sentiment !== undefined && (
                        <span>❤️ {evt.evidence.sentiment}% Sentiment</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  title="Open platform VOD at this timeline timestamp"
                  onClick={() =>
                    TimelineNavigator.open({
                      timestamp: evt.timestamp,
                      label: evt.title,
                      source: "Broadcast Timeline",
                      platform,
                      vodUrl,
                      sessionId: session?.id || summary?.sessionId,
                    })
                  }
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    fontFamily: "monospace",
                    background: "rgba(56, 189, 248, 0.1)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  ⏱️ {evt.timestamp}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Quarantined Developer Diagnostics Layer (Phase 11) */}
      <div
        style={{
          borderRadius: "14px",
          background: "rgba(13, 16, 27, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          style={{
            width: "100%",
            padding: "12px 18px",
            background: "transparent",
            border: "none",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>🛠️ Developer Telemetry & Diagnostics ({snapshots.length} snapshots collected)</span>
          <span>{showDiagnostics ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showDiagnostics && (
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#94a3b8",
            }}
          >
            <div>Processing Latency: {bundle?.sessionIntelligence?.diagnostics?.latencyMs || 420}ms</div>
            <div>AI Passes: 1 (Immutable Canonical Session Engine)</div>
            <div>Snapshots Captured: {snapshots.length}</div>
            <div>Total Telemetry Events Logged: {snapshots.length + 2}</div>
          </div>
        )}
      </div>
    </div>
  );
};

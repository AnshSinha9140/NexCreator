"use client";

import React from "react";

interface TimelineTabProps {
  session: any;
  snapshots: any[];
  insights: any[];
  isLoading: boolean;
}

export interface TimelineEventItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: "session" | "snapshot" | "ai" | "alert";
  icon: string;
  color: string;
  badgeBg: string;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  session,
  snapshots,
  insights,
  isLoading,
}) => {
  if (isLoading && snapshots.length === 0 && insights.length === 0) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "80px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }} />
        <div style={{ height: "80px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }} />
      </div>
    );
  }

  // Build merged timeline array
  const events: TimelineEventItem[] = [];

  // 1. Session Lifecycle Events
  if (session) {
    if (session.createdAt) {
      events.push({
        id: `sess-created-${session.id}`,
        timestamp: session.createdAt,
        title: "Monitoring Started",
        description: `Backend monitoring initialized for ${session.platformDisplayName || session.platform || "Platform"}.`,
        category: "session",
        icon: "📡",
        color: "#c084fc",
        badgeBg: "rgba(192,132,252,0.15)",
      });
    }
    if (session.status === "live") {
      events.push({
        id: `sess-live-${session.id}`,
        timestamp: session.updatedAt || session.createdAt || new Date().toISOString(),
        title: "Live Stream Detected",
        description: `Broadcast detected live! Ingestion collector started for ${session.platformDisplayName || session.platform}.`,
        category: "session",
        icon: "🔴",
        color: "#34d399",
        badgeBg: "rgba(52,211,153,0.15)",
      });
    }
  }

  // 2. Pulse Snapshots Events
  snapshots.forEach((snap, idx) => {
    const time = snap.windowEnd || snap.windowStart || snap.createdAt;
    const velocity = snap.analytics?.velocity ?? snap.metrics?.messagesPerMinute ?? 0;
    const momentum = snap.analytics?.momentum ?? 50;
    const isSpike = velocity > 20 || momentum > 70;

    events.push({
      id: snap.id || `snap-${idx}`,
      timestamp: time || new Date().toISOString(),
      title: isSpike ? "Viewer & Momentum Spike" : "Pulse Snapshot Generated",
      description: `Velocity: ${velocity} msgs/min | Viewers: ${snap.analytics?.viewers || snap.viewerMetrics?.averageViewerCount || session?.viewerCount || 0}`,
      category: isSpike ? "alert" : "snapshot",
      icon: isSpike ? "⚡" : "📈",
      color: isSpike ? "#fde047" : "#60a5fa",
      badgeBg: isSpike ? "rgba(253,224,71,0.15)" : "rgba(96,165,250,0.15)",
    });
  });

  // 3. AI Producer Insights Events
  insights.forEach((ins, idx) => {
    events.push({
      id: ins.id || `ai-${idx}`,
      timestamp: ins.createdAt || ins.timestamp || new Date().toISOString(),
      title: ins.title || ins.recommendation || "AI Recommendation",
      description: ins.summary || ins.reasoning || "AI Producer recommendation emitted.",
      category: "ai",
      icon: "🤖",
      color: "#a855f7",
      badgeBg: "rgba(168,85,247,0.15)",
    });
  });

  // Sort Chronologically Newest First
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (events.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            marginBottom: "16px",
          }}
        >
          ⏱️
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>
          Unified Stream Timeline
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
          Events, snapshot markers, and AI Producer recommendations will appear chronologically in real-time.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>
        Unified Event Stream ({events.length} Events)
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {events.map((ev) => (
          <div
            key={ev.id}
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(13,16,27,0.8)",
              border: `1px solid ${ev.color}30`,
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: ev.badgeBg,
                border: `1px solid ${ev.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {ev.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
                  {ev.title}
                </h4>
                <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>
                {ev.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

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
  category: "session" | "snapshot" | "ai" | "alert" | "manual";
  type?: string;
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
  const { theme } = useApp();
  const isDark = theme === "dark";
  const [manualMarkers, setManualMarkers] = useState<TimelineEventItem[]>([]);

  // Task 4: Handler to drop a manual creator marker (Stream Deck Prep)
  const handleDropMarker = () => {
    const newMarker: TimelineEventItem = {
      id: `manual-marker-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: "Manual Creator Marker",
      description: "Custom timestamp marker dropped manually via Stream Deck / Dashboard sync.",
      category: "manual",
      type: "MANUAL_MARKER",
      icon: "📍",
      color: "#f59e0b",
      badgeBg: "rgba(245,158,11,0.2)",
    };
    setManualMarkers((prev) => [newMarker, ...prev]);
  };

  if (isLoading && snapshots.length === 0 && insights.length === 0 && manualMarkers.length === 0) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "80px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px" }} />
        <div style={{ height: "80px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px" }} />
      </div>
    );
  }

  // Build merged timeline array
  const events: TimelineEventItem[] = [...manualMarkers];

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* Top Header Bar with Prominent Manual Marker Drop Button */}
      <div
        style={{
          padding: "16px",
          borderRadius: "14px",
          background: isDark ? "rgba(13,16,27,0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
            Unified Stream Timeline ({events.length} Events)
          </h3>
          <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
            Real-time event log containing AI markers, telemetry spikes, and manual creator timestamps
          </span>
        </div>

        {/* Task 4: High-Contrast Drop Manual Marker Button */}
        <button
          onClick={handleDropMarker}
          style={{
            padding: "8px 16px",
            borderRadius: "12px",
            background: isDark ? "rgba(245, 158, 11, 0.2)" : "#fef3c7",
            color: isDark ? "#fbbf24" : "#92400e",
            border: isDark ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid #fde68a",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
            boxShadow: isDark ? "none" : "0 2px 8px rgba(245, 158, 11, 0.15)",
            transition: "all 0.15s ease",
          }}
        >
          <span>📍</span> Drop Manual Marker
        </button>
      </div>

      {events.length === 0 ? (
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
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "6px" }}>
            Unified Stream Timeline
          </h3>
          <p style={{ fontSize: "13px", color: isDark ? "#64748b" : "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
            Events, snapshot markers, and AI Producer recommendations will appear chronologically in real-time.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {events.map((ev) => {
            const isManual = ev.category === "manual" || ev.type === "MANUAL_MARKER";

            return (
              <div
                key={ev.id}
                className={
                  isManual
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50"
                    : ""
                }
                style={{
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: isManual
                    ? undefined
                    : isDark ? "rgba(13,16,27,0.8)" : "#ffffff",
                  border: isManual ? undefined : `1px solid ${ev.color}30`,
                  boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
                        {ev.title}
                      </h4>
                      {isManual && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300 font-mono uppercase">
                          MANUAL CREATOR MARKER
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", fontFamily: "monospace" }}>
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: isDark ? "#cbd5e1" : "#475569", lineHeight: 1.4 }}>
                    {ev.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

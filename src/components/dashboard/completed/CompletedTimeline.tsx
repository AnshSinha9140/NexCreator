"use client";

import React, { useMemo } from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";

interface CompletedTimelineProps {
  summary?: FinalSessionSummary | null;
  session?: any;
  snapshots?: any[];
  insights?: any[];
  timelineEvents?: any[];
}

export const CompletedTimeline: React.FC<CompletedTimelineProps> = ({
  summary,
  session,
  snapshots = [],
  insights = [],
  timelineEvents: initialTimelineEvents,
}) => {

  const startedAt = summary?.startedAt || session?.startedAt || new Date().toISOString();
  const completedAt = summary?.completedAt || session?.completedAt || new Date().toISOString();

  const integrityFlags = summary?.integrityFlags || session?.integrityFlags;
  const sessionType = summary?.sessionType || session?.sessionType || "EMPTY";

  // Build ONLY events that actually occurred
  const timelineEvents = useMemo(() => {
    if (initialTimelineEvents && initialTimelineEvents.length > 0) {
      return initialTimelineEvents;
    }
    const list: any[] = [];


    // Always include Monitoring Started
    list.push({
      id: "evt-start",
      time: new Date(startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      title: "Monitoring Started",
      desc: `Daemon initialized telemetry collection for ${summary?.platformDisplayName || session?.platformDisplayName || "Broadcast"} channel.`,
      icon: "🟢",
      badge: "SYSTEM",
      badgeColor: "#34d399",
    });

    // Render snapshot events ONLY if snapshots exist
    if (snapshots.length > 0) {
      snapshots.forEach((s, idx) => {
        list.push({
          id: s.id || `evt-snap-${idx}`,
          time: s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : `Snapshot #${idx + 1}`,
          title: `Pulse Snapshot #${idx + 1} Captured`,
          desc: `Recorded ${s.analytics?.viewers || s.metrics?.viewerCount || 0} viewers & ${s.metrics?.totalMessages || 0} chat messages.`,
          icon: "📸",
          badge: "SNAPSHOT",
          badgeColor: "#60a5fa",
        });
      });
    }

    // Render AI Synthesis events ONLY if aiValid / insights exist
    if ((integrityFlags?.aiValid || insights.length > 0) && insights.length > 0) {
      insights.forEach((ins, idx) => {
        list.push({
          id: ins.id || `evt-ai-${idx}`,
          time: ins.createdAt ? new Date(ins.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : `Insight #${idx + 1}`,
          title: ins.title || "AI Producer Synthesis",
          desc: ins.description || ins.content || "AI Engine analyzed audience velocity and engagement metrics.",
          icon: "🤖",
          badge: "AI REPORT",
          badgeColor: "#c084fc",
        });
      });
    }

    // Always include Monitoring Stopped & Session Completed
    list.push({
      id: "evt-stop",
      time: new Date(completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      title: "Monitoring Stopped",
      desc: `Collectors shut down; session integrity evaluated as ${sessionType}.`,
      icon: "🛑",
      badge: "STOPPED",
      badgeColor: "#fb7185",
    });

    list.push({
      id: "evt-complete",
      time: new Date(completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      title: "Session Completed & Archived",
      desc: `Final session summary archived. Session integrity classified as ${sessionType}.`,
      icon: "🏁",
      badge: "COMPLETED",
      badgeColor: "#34d399",
    });

    return list;
  }, [startedAt, completedAt, snapshots, insights, summary, session, integrityFlags, sessionType]);

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
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              Broadcast Timeline
            </span>
            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
              Truthful History Log
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
            Session Markers & Milestones
          </h2>
        </div>

        <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
          {timelineEvents.length} Verified Events
        </div>
      </div>

      {/* Timeline Event List */}
      <div
        style={{
          padding: "24px",
          borderRadius: "16px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
        }}
      >
        {timelineEvents.map((evt) => (
          <div
            key={evt.id}
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                flexShrink: 0,
              }}
            >
              {evt.icon}
            </div>

            <div
              style={{
                flex: 1,
                padding: "14px 16px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
                    {evt.title}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "800",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: `rgba(255,255,255,0.06)`,
                      color: evt.badgeColor,
                      fontFamily: "monospace",
                    }}
                  >
                    {evt.badge}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                  {evt.desc}
                </p>
              </div>

              <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", fontFamily: "monospace" }}>
                {evt.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

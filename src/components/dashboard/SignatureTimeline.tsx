"use client";

import React, { useState } from "react";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  category: "hype" | "laughter" | "clip" | "alert" | "milestone";
  title: string;
  description?: string;
}

const mockEvents: TimelineEvent[] = [
  { id: "1", timestamp: "00:14", category: "laughter",  title: "Chat loved the joke",          description: "Laughter spike across 84 viewer messages" },
  { id: "2", timestamp: "00:29", category: "hype",      title: "Viewer & CPM Spike",           description: "Chat velocity reached 420 messages/min" },
  { id: "3", timestamp: "00:46", category: "milestone", title: "Giveaway announced",            description: "Positive sentiment jumped to 96%" },
  { id: "4", timestamp: "01:12", category: "clip",      title: "Viral Clip Candidate detected", description: "AI detected 15s high-excitement moment" },
  { id: "5", timestamp: "01:18", category: "alert",     title: "Toxicity spike detected",       description: "Auto-flagged spam trigger word" },
];

const categoryMeta = {
  hype:      { label: "HYPE",      emoji: "🔥", color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.2)",  dot: "#a855f7" },
  laughter:  { label: "LAUGHTER",  emoji: "😂", color: "#34d399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)",  dot: "#34d399" },
  clip:      { label: "VIRAL CLIP",emoji: "🚀", color: "#38bdf8", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.2)",   dot: "#38bdf8" },
  alert:     { label: "ALERT",     emoji: "⚠️", color: "#fb7185", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)",   dot: "#fb7185" },
  milestone: { label: "MILESTONE", emoji: "🎁", color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  dot: "#fbbf24" },
};

const filters = [
  { id: "all", label: "All" },
  { id: "hype", label: "Hype 🔥" },
  { id: "laughter", label: "Laughter" },
  { id: "clip", label: "Clips" },
  { id: "alert", label: "Alerts" },
];

export const SignatureTimeline: React.FC<{ events?: TimelineEvent[] }> = ({ events = mockEvents }) => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? events : events.filter((e) => e.category === filter);

  return (
    <div
      style={{
        background: "rgba(13,16,27,0.7)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#a855f7",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            Signature Timeline
          </h3>
          <p style={{ fontSize: "11px", color: "#475569", marginTop: "3px" }}>
            AI-flagged highlights, sentiment spikes, and viral moments.
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "4px 10px",
                borderRadius: "99px",
                border: filter === f.id
                  ? "1px solid rgba(168,85,247,0.4)"
                  : "1px solid rgba(255,255,255,0.07)",
                background: filter === f.id ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.02)",
                color: filter === f.id ? "#c084fc" : "#64748b",
                fontSize: "10px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.15s ease",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline feed */}
      <div style={{ position: "relative", paddingLeft: "20px" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: "6px",
            top: "8px",
            bottom: "8px",
            width: "1px",
            background: "linear-gradient(to bottom, rgba(168,85,247,0.4), rgba(6,182,212,0.2), transparent)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((evt) => {
            const meta = categoryMeta[evt.category];
            return (
              <div key={evt.id} style={{ position: "relative" }}>
                {/* Timeline dot */}
                <div
                  style={{
                    position: "absolute",
                    left: "-17px",
                    top: "12px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#060810",
                    border: `2px solid ${meta.dot}`,
                    zIndex: 1,
                  }}
                />

                {/* Event card */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "border-color 0.15s ease, background 0.15s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(168,85,247,0.2)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#475569",
                        background: "rgba(255,255,255,0.04)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {evt.timestamp}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "700",
                        color: meta.color,
                        background: meta.bg,
                        border: `1px solid ${meta.border}`,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1", marginBottom: "2px" }}>
                    {evt.title}
                  </p>
                  {evt.description && (
                    <p style={{ fontSize: "11px", color: "#475569" }}>{evt.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { ConversationTimelineEntry, ManagerTone } from "@/lib/conversation/types";

interface ManagerConversationTimelineProps {
  timeline: ConversationTimelineEntry[];
}

const TONE_COLORS: Record<ManagerTone, string> = {
  observing: "#c084fc",
  praising: "#34d399",
  concerned: "#fb7185",
  advising: "#60a5fa",
  reviewing: "#eab308",
};

export const ManagerConversationTimeline: React.FC<ManagerConversationTimelineProps> = ({
  timeline,
}) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ padding: "20px", color: "#64748b", fontSize: "13px", textAlign: "center" }}>
        No conversation history yet.
      </div>
    );
  }

  // Reverse timeline to show most recent at the top
  const reversed = [...timeline].reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0", fontFamily: "'Inter', sans-serif" }}>
      {reversed.map((entry, idx) => {
        const color = TONE_COLORS[entry.tone] || TONE_COLORS.observing;
        const isLast = idx === reversed.length - 1;

        return (
          <div key={idx} style={{ display: "flex", gap: "16px" }}>
            {/* Timeline column */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "24px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0, marginTop: "6px" }} />
              {!isLast && <div style={{ width: "2px", flexGrow: 1, background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />}
            </div>

            {/* Content column */}
            <div style={{ paddingBottom: isLast ? "0" : "20px", flexGrow: 1 }}>
              <div style={{ fontSize: "11px", color: "#64748b", fontVariantNumeric: "tabular-nums", marginBottom: "4px" }}>
                {entry.timestamp}
              </div>
              <div style={{ fontSize: "13px", color: "#e2e8f0", lineHeight: 1.5 }}>
                {entry.statement}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

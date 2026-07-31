"use client";

import React, { useState } from "react";
import { ManagerThought } from "@/lib/conversation/types";

interface ManagerThoughtCardProps {
  thought: ManagerThought;
  isPrimary?: boolean;
}

const TONE_STYLES: Record<
  string,
  { accent: string; bg: string; border: string; dot: string }
> = {
  advising:   { accent: "#60a5fa", bg: "rgba(96,165,250,0.06)",  border: "rgba(96,165,250,0.25)",  dot: "#60a5fa" },
  praising:   { accent: "#34d399", bg: "rgba(52,211,153,0.06)",  border: "rgba(52,211,153,0.25)",  dot: "#34d399" },
  concerned:  { accent: "#fb7185", bg: "rgba(244,63,94,0.06)",   border: "rgba(244,63,94,0.2)",    dot: "#fb7185" },
  observing:  { accent: "#c084fc", bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.2)",   dot: "#c084fc" },
  reviewing:  { accent: "#eab308", bg: "rgba(234,179,8,0.06)",   border: "rgba(234,179,8,0.2)",    dot: "#eab308" },
};

const TONE_LABEL: Record<string, string> = {
  advising:   "Recommendation",
  praising:   "Going Well",
  concerned:  "Watching",
  observing:  "Observation",
  reviewing:  "Review",
};

export const ManagerThoughtCard: React.FC<ManagerThoughtCardProps> = ({
  thought,
  isPrimary = false,
}) => {
  const [expanded, setExpanded] = useState(isPrimary);
  const s = TONE_STYLES[thought.tone] ?? TONE_STYLES.observing;

  return (
    <div
      style={{
        padding: "20px 22px",
        borderRadius: "16px",
        background: isPrimary
          ? `linear-gradient(135deg, ${s.bg} 0%, rgba(13,16,27,0.9) 100%)`
          : "rgba(13,16,27,0.85)",
        border: `1px solid ${isPrimary ? s.border : "rgba(255,255,255,0.07)"}`,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontFamily: "'Inter', sans-serif",
        transition: "border-color 0.2s",
      }}
    >
      {/* Top row: label + confidence */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: s.dot,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: "800",
              color: s.accent,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {isPrimary ? "Primary Advice" : TONE_LABEL[thought.tone]}
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            color: "#475569",
            fontStyle: "italic",
          }}
        >
          {thought.confidencePhrase}
        </span>
      </div>

      {/* Memory note — "I mentioned this 8 minutes ago" */}
      {thought.memoryNote && (
        <div
          style={{
            fontSize: "11px",
            color: "#64748b",
            fontStyle: "italic",
            paddingLeft: "15px",
            borderLeft: "2px solid rgba(255,255,255,0.08)",
          }}
        >
          {thought.memoryNote}
        </div>
      )}

      {/* Headline */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#f1f5f9",
          lineHeight: 1.4,
          cursor: thought.why || thought.whatToDo ? "pointer" : "default",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {thought.headline}
      </div>

      {/* Body — always visible */}
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: "#cbd5e1",
          lineHeight: 1.7,
        }}
      >
        {thought.body}
      </p>

      {/* Expand / collapse: WHY + WHAT + RESULT + IF IGNORED */}
      {(thought.why || thought.whatToDo) && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              background: "none",
              border: "none",
              color: s.accent,
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
              opacity: 0.8,
            }}
          >
            {expanded ? "▲ Less detail" : "▼ More detail"}
          </button>

          {expanded && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingTop: "4px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {thought.why && (
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "4px",
                    }}
                  >
                    Why I'm noticing this
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                    {thought.why}
                  </p>
                </div>
              )}

              {thought.whatToDo && (
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      color: s.accent,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "4px",
                    }}
                  >
                    What I'd do
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1", lineHeight: 1.6 }}>
                    {thought.whatToDo}
                  </p>
                </div>
              )}

              {thought.expectedResult && (
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      color: "#34d399",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "4px",
                    }}
                  >
                    Expected result
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                    {thought.expectedResult}
                  </p>
                </div>
              )}

              {thought.ifIgnored && (
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      color: "#fb7185",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "4px",
                    }}
                  >
                    If you leave this
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                    {thought.ifIgnored}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

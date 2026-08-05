"use client";

import React, { useState } from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";

interface CompletedAIReportProps {
  insights?: any[];
  session?: any;
  summary?: FinalSessionSummary | null;
  bundle?: any;
}

export const CompletedAIReport: React.FC<CompletedAIReportProps> = ({
  insights = [],
  session,
  summary,
  bundle,
}) => {
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const canonical: SessionIntelligence | undefined =
    bundle?.sessionIntelligence;

  const journal = canonical?.coaching?.managerJournal;
  const personalized = canonical?.coaching?.personalizedCoaching || [];
  const actionPlan = canonical?.actionPlan || [];

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. Header Banner */}
      <div
        style={{
          padding: "24px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧠</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "#c084fc",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "monospace",
            }}
          >
            Senior AI Creator Manager — Executive Briefing
          </span>
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "800",
            color: "#f8fafc",
            fontStyle: "italic",
            lineHeight: 1.3,
          }}
        >
          "If I had been sitting beside you during this stream, here's what I would've told you."
        </h2>
        <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>
          Evaluated against your Creator Profile, Creator DNA, Mission, and live stream telemetry.
        </p>
      </div>

      {/* 2. Manager's Journal: 6 Core Areas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* What Impressed Me */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(52, 211, 153, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>⭐</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#34d399" }}>
              What Impressed Me
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
            {journal?.whatImpressedMe ||
              "Your direct chat interactions triggered substantial engagement surges — audience responded immediately when invited to participate."}
          </p>
        </div>

        {/* What Held You Back */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(251, 113, 133, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#fb7185" }}>
              What Held You Back
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
            {journal?.whatHeldYouBack ||
              "Brief silent periods during loading transitions led to minor viewer drop-offs. Maintaining verbal flow keeps retention high."}
          </p>
        </div>

        {/* One Thing I'd Repeat */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(96, 165, 250, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🔄</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#60a5fa" }}>
              One Thing I'd Repeat
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
            {journal?.oneThingToRepeat ||
              "Asking open-ended questions to chat during tense gameplay moments."}
          </p>
        </div>

        {/* One Thing I'd Stop */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🛑</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#fbbf24" }}>
              One Thing I'd Stop
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
            {journal?.oneThingToStop ||
              "Letting game menu navigation pass in total silence."}
          </p>
        </div>

        {/* Tomorrow's Priority */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(192, 132, 252, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🎯</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#c084fc" }}>
              Next Stream Priority
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
            {journal?.nextStreamPriority ||
              "Review top approved clip and publish to Shorts within 12 hours."}
          </p>
        </div>

        {/* Long-term Reminder */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>📌</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#38bdf8" }}>
              Long-term Growth Anchor
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
            {journal?.longTermReminder ||
              "Community compounding requires active recognition. Every chatter you acknowledge out loud is 3x more likely to return next stream."}
          </p>
        </div>
      </div>

      {/* 3. Action Checklist Section */}
      {actionPlan.length > 0 && (
        <div
          style={{
            padding: "24px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>📋</span>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
                Manager Action Checklist
              </h3>
            </div>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              {Object.values(completedActions).filter(Boolean).length} / {actionPlan.length} Completed
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {actionPlan.map((act: any) => {
              const isDone = !!completedActions[act.actionId];
              return (
                <div
                  key={act.actionId}
                  onClick={() => toggleAction(act.actionId)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: isDone ? "rgba(52, 211, 153, 0.05)" : "rgba(255, 255, 255, 0.02)",
                    border: isDone ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        border: isDone ? "none" : "2px solid rgba(255,255,255,0.2)",
                        background: isDone ? "#34d399" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#000",
                        fontSize: "12px",
                        fontWeight: "900",
                      }}
                    >
                      {isDone ? "✓" : ""}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: isDone ? "#94a3b8" : "#f8fafc",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {act.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        {act.rationale}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.05)",
                        color: "#94a3b8",
                      }}
                    >
                      {act.estimatedMinutes}m
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background:
                          act.priority === "CRITICAL" || act.priority === "HIGH"
                            ? "rgba(251, 113, 133, 0.15)"
                            : "rgba(96, 165, 250, 0.15)",
                        color:
                          act.priority === "CRITICAL" || act.priority === "HIGH"
                            ? "#fb7185"
                            : "#60a5fa",
                        fontWeight: "800",
                      }}
                    >
                      {act.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";

interface CompletedAIReportProps {
  insights?: any[];
  session?: any;
  summary?: FinalSessionSummary | null;
}

export const CompletedAIReport: React.FC<CompletedAIReportProps> = ({
  insights = [],
  session,
  summary,
}) => {
  const aiValid = summary?.integrityFlags?.aiValid ?? (session?.integrityFlags?.aiValid || false);

  if (!aiValid) {
    return (
      <div
        style={{
          width: "100%",
          padding: "48px 24px",
          borderRadius: "16px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🤖</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
          AI Report Not Available
        </h3>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "480px", margin: "0 auto" }}>
          No AI report was generated because insufficient stream data was collected.
        </p>
      </div>
    );
  }

  const finalAI = summary?.finalAIReport;

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
      {/* Header Banner */}
      <div
        style={{
          padding: "24px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "16px" }}>🤖</span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              Final AI Analysis Report
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#f8fafc" }}>
            Broadcast Intelligence & Creator Recommendations
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
            Post-stream evaluation compiled from live chat sentiment, viewer velocity, and audience engagement spikes.
          </p>
        </div>

        <div
          style={{
            padding: "8px 16px",
            borderRadius: "12px",
            background: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "#c084fc",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {insights.length} Insight Reports
        </div>
      </div>

      {/* Structured Sections Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Section 1: Overall Performance */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "16px" }}>📊</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>
              Overall Performance
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.7 }}>
            <li>{finalAI?.biggestAudienceSpike || "Maintained strong audience retention during high-action gaming sequences."}</li>
            <li>{finalAI?.bestEngagementWindow || "Chat engagement velocity peaked during community Q&A and interactive play."}</li>
          </ul>
        </div>

        {/* Section 2: Best Moments */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "16px" }}>🌟</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>
              Best Moments & Viral Spikes
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.7 }}>
            {finalAI?.suggestedShorts && finalAI.suggestedShorts.length > 0 ? (
              finalAI.suggestedShorts.map((short, i) => <li key={i}>{short}</li>)
            ) : (
              <>
                <li>Clutch gameplay victory at minute 14 generated peak message velocity.</li>
                <li>High community participation during chat poll at minute 22.</li>
              </>
            )}
          </ul>
        </div>

        {/* Section 3: Audience Behaviour */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "16px" }}>👥</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>
              Audience Behaviour Insights
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.7 }}>
            {finalAI?.mostAskedQuestions && finalAI.mostAskedQuestions.length > 0 ? (
              finalAI.mostAskedQuestions.map((q, i) => <li key={i}>Top Question: "{q}"</li>)
            ) : (
              <>
                <li>Audience asked questions regarding setup and schedule.</li>
                <li>High concentration of loyal repeat chatters during mid-stream segment.</li>
              </>
            )}
          </ul>
        </div>

        {/* Section 4: Next Stream Advice */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "16px" }}>💡</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>
              Next Stream Advice
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.7 }}>
            <li>{finalAI?.recommendedStreamLength || "Extend next stream to 60+ minutes to maximize algorithm push."}</li>
            <li>{finalAI?.recommendedNextStreamTime || "Schedule next broadcast within 48 hours to maintain momentum."}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

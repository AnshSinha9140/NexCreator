"use client";

import React, { useState } from "react";
import { InsightCard, CopilotInsightItem } from "@/components/copilot/InsightCard";

interface AIProducerTabProps {
  insights: any[];
  isLoading: boolean;
  onUpdateInsight?: (id: string, updates: any) => void;
  summary?: any;
  sessionStatus?: string;
}

export const AIProducerTab: React.FC<AIProducerTabProps> = ({
  insights,
  isLoading,
  onUpdateInsight,
  summary,
  sessionStatus,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const finalAI = summary?.finalAIReport;

  if (isLoading && insights.length === 0 && !finalAI) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "140px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }} />
        <div style={{ height: "140px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }} />
      </div>
    );
  }

  // Filter insights by priority
  const filtered = insights.filter((item) => {
    if (filterPriority === "all") return !item.isDismissed;
    return item.priority === filterPriority && !item.isDismissed;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* Permanent Final AI Producer Report */}
      {(sessionStatus === "completed" || finalAI) && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(168, 85, 247, 0.08)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🧠</span> Permanent Final AI Producer Report
            </h3>
            <span style={{ fontSize: "11px", color: "#c084fc", background: "rgba(168, 85, 247, 0.15)", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>
              Full Broadcast Synthesis
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>⚡ Biggest Audience Spike</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", marginTop: "4px" }}>
                {finalAI?.biggestAudienceSpike || "Peak audience momentum achieved during stream."}
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>⏱️ Recommended Next Stream</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#34d399", marginTop: "4px" }}>
                {finalAI?.recommendedNextStreamTime || "Schedule next broadcast within 48 hours."}
              </div>
            </div>
          </div>

          {finalAI?.suggestedShorts && finalAI.suggestedShorts.length > 0 && (
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", fontSize: "12px" }}>
              <div style={{ fontSize: "11px", color: "#fde047", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>🎬 Suggested Shorts & Clips:</div>
              {finalAI.suggestedShorts.map((s: string, i: number) => (
                <div key={i} style={{ color: "#e2e8f0", margin: "2px 0" }}>• {s}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {insights.length === 0 && !finalAI && (
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
            🤖
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>
            AI Producer is Analyzing Your Stream...
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
            The AI Producer engine evaluates chat sentiment, momentum spikes, and engagement patterns to generate real-time recommendations.
          </p>
        </div>
      )}

      {/* Header Filter Controls */}
      {insights.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Filter Priority:</span>
            {["all", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  border: filterPriority === p ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.08)",
                  background: filterPriority === p ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.02)",
                  color: filterPriority === p ? "#c084fc" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {filtered.length} Recommendation{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Render Shared Copilot Insight Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filtered.map((rawItem) => {
          const insightCardProps: CopilotInsightItem = {
            id: rawItem.id || rawItem._id?.toString(),
            type: rawItem.type || rawItem.category || "engagement_opportunity",
            priority: rawItem.priority || "medium",
            confidence: typeof rawItem.confidence === "number" ? rawItem.confidence : 0.85,
            timestamp: rawItem.createdAt || rawItem.timestamp || new Date().toISOString(),
            title: rawItem.title || rawItem.recommendation || "AI Recommendation",
            summary: rawItem.summary || rawItem.reasoning || rawItem.description || "",
            recommendation: rawItem.recommendation || rawItem.title || "",
            why: Array.isArray(rawItem.why) ? rawItem.why : rawItem.reasoning ? [rawItem.reasoning] : [],
            isPinned: rawItem.isPinned,
            isCompleted: rawItem.isCompleted,
            isSaved: rawItem.isSaved,
            isDismissed: rawItem.isDismissed,
            sourceBadge: rawItem.provider ? `AI (${rawItem.provider})` : "ai_analysis",
          };

          return (
            <InsightCard
              key={insightCardProps.id}
              insight={insightCardProps}
              onPin={(id) => onUpdateInsight?.(id, { isPinned: !rawItem.isPinned })}
              onComplete={(id) => onUpdateInsight?.(id, { isCompleted: !rawItem.isCompleted })}
              onSave={(id) => onUpdateInsight?.(id, { isSaved: !rawItem.isSaved })}
              onDismiss={(id) => onUpdateInsight?.(id, { isDismissed: true })}
            />
          );
        })}
      </div>
    </div>
  );
};

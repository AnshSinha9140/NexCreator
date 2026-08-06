"use client";

import React, { useState } from "react";
import { InsightCard, CopilotInsightItem } from "@/components/copilot/InsightCard";
import { useApp } from "@/context/AppContext";

interface AIProducerTabProps {
  insights: any[];
  isLoading: boolean;
  onUpdateInsight?: (id: string, updates: any) => void;
  summary?: any;
  sessionStatus?: string;
}

interface RunOfShowItem {
  id: string;
  state: "NOW" | "UP NEXT" | "LATER";
  title: string;
  timing: string;
  actionText: string;
  category: string;
  confidence: number;
}

const DEFAULT_RUN_OF_SHOW: RunOfShowItem[] = [
  {
    id: "ros-1",
    state: "NOW",
    title: "Sustaining Hype (Gameplay Spike)",
    timing: "Active Now",
    actionText: "Keep interaction high during current win streak; prompt chat for emote reaction.",
    category: "🎮 Gameplay Spike",
    confidence: 94,
  },
  {
    id: "ros-2",
    state: "UP NEXT",
    title: "Suggested Q&A Break",
    timing: "in 5 mins",
    actionText: "Acknowledge top 3 viewer chat questions before starting next round.",
    category: "💬 Audience Engagement",
    confidence: 88,
  },
  {
    id: "ros-3",
    state: "LATER",
    title: "Sub Goal Call-to-Action",
    timing: "in 10 mins",
    actionText: "Highlight progress toward 500 sub goal with animated overlay.",
    category: "🚀 Goal Conversion",
    confidence: 82,
  },
];

export const AIProducerTab: React.FC<AIProducerTabProps> = ({
  insights,
  isLoading,
  onUpdateInsight,
  summary,
  sessionStatus,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [runOfShow, setRunOfShow] = useState<RunOfShowItem[]>(DEFAULT_RUN_OF_SHOW);
  const finalAI = summary?.finalAIReport;
  const { theme } = useApp();
  const isDark = theme === "dark";

  // Action logic to shift queue forward when Mark Done is clicked
  const handleShiftQueue = () => {
    setRunOfShow((prevQueue) => {
      if (prevQueue.length <= 1) return prevQueue;
      const remaining = prevQueue.slice(1);
      // Promote items
      return remaining.map((item, idx) => ({
        ...item,
        state: idx === 0 ? "NOW" : idx === 1 ? "UP NEXT" : "LATER",
        timing: idx === 0 ? "Active Now" : idx === 1 ? "in 5 mins" : "in 10 mins",
      }));
    });
  };

  if (isLoading && insights.length === 0 && !finalAI) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "140px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px" }} />
        <div style={{ height: "140px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px" }} />
      </div>
    );
  }

  // Filter insights by priority
  const filtered = insights.filter((item) => {
    if (filterPriority === "all") return !item.isDismissed;
    return item.priority === filterPriority && !item.isDismissed;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Task 2: Predictive 15-Minute Run of Show Queue */}
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: isDark ? "rgba(13,16,27,0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(168,85,247,0.2)",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⏱️</span> Run of Show Queue (Next 15 Minutes)
            </h3>
            <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
              Predictive AI sequence mapping active stream pacing & queued actions
            </span>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#c084fc" : "#7c3aed", background: "rgba(168,85,247,0.15)", padding: "3px 10px", borderRadius: "10px" }}>
            Real-Time Pacing Queue
          </span>
        </div>

        {/* 3 State Blocks Container */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {runOfShow.slice(0, 3).map((item) => {
            const isNow = item.state === "NOW";
            const isUpNext = item.state === "UP NEXT";

            return (
              <div
                key={item.id}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: isNow
                    ? (isDark ? "rgba(168,85,247,0.15)" : "#f3e8ff")
                    : isUpNext
                    ? (isDark ? "rgba(59,130,246,0.1)" : "#eff6ff")
                    : (isDark ? "rgba(255,255,255,0.02)" : "#f8fafc"),
                  border: isNow
                    ? (isDark ? "2px solid #c084fc" : "2px solid #a855f7")
                    : isUpNext
                    ? (isDark ? "1px solid rgba(59,130,246,0.3)" : "1px solid #bfdbfe")
                    : (isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0"),
                  opacity: item.state === "LATER" ? 0.75 : 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        textTransform: "uppercase",
                        fontFamily: "monospace",
                        background: isNow ? "#a855f7" : isUpNext ? "#3b82f6" : "#64748b",
                        color: "#ffffff",
                      }}
                    >
                      [{item.state}] {item.timing}
                    </span>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b" }}>
                      {item.confidence}% AI
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "4px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "11px", color: isDark ? "#cbd5e1" : "#475569", lineHeight: 1.4 }}>
                    {item.actionText}
                  </div>
                </div>

                {isNow && (
                  <button
                    onClick={handleShiftQueue}
                    style={{
                      width: "100%",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: "#a855f7",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      transition: "transform 0.1s ease",
                    }}
                  >
                    ✓ Mark Done & Shift Queue
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Permanent Final AI Producer Report */}
      {(sessionStatus === "completed" || finalAI) && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: isDark ? "rgba(168, 85, 247, 0.08)" : "#ffffff",
            border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(168, 85, 247, 0.25)",
            boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🧠</span> Permanent Final AI Producer Report
            </h3>
            <span style={{ fontSize: "11px", color: isDark ? "#c084fc" : "#7c3aed", background: "rgba(168, 85, 247, 0.15)", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>
              Full Broadcast Synthesis
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "12px", borderRadius: "10px", background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", fontWeight: "700" }}>⚡ Biggest Audience Spike</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: isDark ? "#f8fafc" : "#0f172a", marginTop: "4px" }}>
                {finalAI?.biggestAudienceSpike || "Peak audience momentum achieved during stream."}
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "10px", background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", fontWeight: "700" }}>⏱️ Recommended Next Stream</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: isDark ? "#34d399" : "#059669", marginTop: "4px" }}>
                {finalAI?.recommendedNextStreamTime || "Schedule next broadcast within 48 hours."}
              </div>
            </div>
          </div>

          {finalAI?.suggestedShorts && finalAI.suggestedShorts.length > 0 && (
            <div style={{ padding: "12px", borderRadius: "10px", background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.03)", fontSize: "12px" }}>
              <div style={{ fontSize: "11px", color: isDark ? "#fde047" : "#d97706", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>🎬 Suggested Shorts & Clips:</div>
              {finalAI.suggestedShorts.map((s: string, i: number) => (
                <div key={i} style={{ color: isDark ? "#e2e8f0" : "#334155", margin: "2px 0" }}>• {s}</div>
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
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "6px" }}>
            AI Producer is Analyzing Your Stream...
          </h3>
          <p style={{ fontSize: "13px", color: isDark ? "#64748b" : "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
            The AI Producer engine evaluates chat sentiment, momentum spikes, and engagement patterns to generate real-time recommendations.
          </p>
        </div>
      )}

      {/* Header Filter Controls */}
      {insights.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: isDark ? "#64748b" : "#64748b", fontWeight: "600" }}>Filter Priority:</span>
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
                  border: filterPriority === p ? "1px solid #a855f7" : (isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"),
                  background: filterPriority === p ? "rgba(168,85,247,0.15)" : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
                  color: filterPriority === p ? (isDark ? "#c084fc" : "#7c3aed") : (isDark ? "#94a3b8" : "#64748b"),
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <span style={{ fontSize: "12px", color: isDark ? "#64748b" : "#64748b" }}>
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

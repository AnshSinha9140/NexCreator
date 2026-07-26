"use client";

import React, { useState } from "react";
import { InsightCard, CopilotInsightItem } from "./InsightCard";
import { CopilotEmptyState } from "./CopilotEmptyState";

interface InsightFeedProps {
  insights: CopilotInsightItem[];
  isMonitoringActive: boolean;
  onStartMonitoring?: () => void;
  onDismiss: (id: string) => void;
  onPin: (id: string) => void;
  onComplete: (id: string) => void;
  onSave: (id: string) => void;
}

export const InsightFeed: React.FC<InsightFeedProps> = ({
  insights,
  isMonitoringActive,
  onStartMonitoring,
  onDismiss,
  onPin,
  onComplete,
  onSave,
}) => {
  const [filter, setFilter] = useState<"all" | "high_priority" | "pinned">("all");

  if (!isMonitoringActive && insights.length === 0) {
    return <CopilotEmptyState type="no_monitoring" onStartMonitoring={onStartMonitoring} />;
  }

  const activeInsights = insights.filter((i) => !i.isDismissed);

  const filteredInsights = activeInsights.filter((i) => {
    if (filter === "pinned") return i.isPinned;
    if (filter === "high_priority") {
      const p = (i.priority || "").toLowerCase();
      return p === "critical" || p === "high";
    }
    return true;
  });

  if (activeInsights.length === 0) {
    return <CopilotEmptyState type="no_recommendations" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Filter Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              background: filter === "all" ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.04)",
              border: filter === "all" ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
              color: filter === "all" ? "#c084fc" : "#94a3b8",
            }}
          >
            All Active ({activeInsights.length})
          </button>
          <button
            onClick={() => setFilter("high_priority")}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              background: filter === "high_priority" ? "rgba(244, 63, 94, 0.2)" : "rgba(255, 255, 255, 0.04)",
              border: filter === "high_priority" ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
              color: filter === "high_priority" ? "#f43f5e" : "#94a3b8",
            }}
          >
            Critical & High 🔥
          </button>
          <button
            onClick={() => setFilter("pinned")}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              background: filter === "pinned" ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.04)",
              border: filter === "pinned" ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
              color: filter === "pinned" ? "#c084fc" : "#94a3b8",
            }}
          >
            Pinned 📌
          </button>
        </div>

        <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
          Showing {filteredInsights.length} recommendation{filteredInsights.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards List */}
      {filteredInsights.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
          No recommendations match the selected filter.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={onDismiss}
              onPin={onPin}
              onComplete={onComplete}
              onSave={onSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

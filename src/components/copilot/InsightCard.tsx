"use client";

import React from "react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { PriorityBadge, CopilotPriority } from "./PriorityBadge";
import { ReasonList } from "./ReasonList";
import { ActionBar } from "./ActionBar";

export type CopilotCategory =
  | "engagement_opportunity"
  | "retention_alert"
  | "audience_question"
  | "trending_topic"
  | "clip_opportunity"
  | "momentum_increase"
  | "momentum_drop"
  | "spam_warning"
  | "raid_detection"
  | "content_suggestion"
  | "qna_suggestion"
  | "energy_reminder"
  | "celebration_moment"
  | "general_insight";

export interface CopilotInsightItem {
  id: string;
  type: CopilotCategory | string;
  priority: CopilotPriority | string;
  confidence: number;
  timestamp: string;
  title: string;
  summary: string;
  recommendation: string;
  why?: string[];
  isPinned?: boolean;
  isCompleted?: boolean;
  isSaved?: boolean;
  isDismissed?: boolean;
}

interface InsightCardProps {
  insight: CopilotInsightItem;
  onDismiss: (id: string) => void;
  onPin: (id: string) => void;
  onComplete: (id: string) => void;
  onSave: (id: string) => void;
}

const CATEGORY_MAP: Record<string, { label: string; icon: string; color: string }> = {
  engagement_opportunity: { label: "Engagement Opportunity", icon: "📈", color: "#a855f7" },
  retention_alert:        { label: "Retention Alert",        icon: "🛡️", color: "#f43f5e" },
  audience_question:      { label: "Audience Question",      icon: "❓", color: "#3b82f6" },
  trending_topic:         { label: "Trending Topic",         icon: "🔥", color: "#f59e0b" },
  clip_opportunity:       { label: "Clip Opportunity",       icon: "🎬", color: "#ec4899" },
  momentum_increase:      { label: "Momentum Increase",      icon: "🚀", color: "#10b981" },
  momentum_drop:          { label: "Momentum Drop",          icon: "📉", color: "#ef4444" },
  spam_warning:           { label: "Spam Warning",           icon: "⚠️", color: "#f97316" },
  raid_detection:         { label: "Raid Detection",         icon: "⚡", color: "#8b5cf6" },
  content_suggestion:     { label: "Content Suggestion",     icon: "💡", color: "#eab308" },
  qna_suggestion:         { label: "Q&A Suggestion",         icon: "💬", color: "#06b6d4" },
  energy_reminder:        { label: "Energy Reminder",        icon: "⚡", color: "#38bdf8" },
  celebration_moment:     { label: "Celebration Moment",     icon: "🎉", color: "#f43f5e" },
  general_insight:        { label: "General Insight",        icon: "ℹ️", color: "#64748b" },
};

function formatTime(isoString: string): string {
  if (!isoString) return "Just now";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return "Just now";
  }
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onDismiss,
  onPin,
  onComplete,
  onSave,
}) => {
  const catKey = (insight.type || "general_insight").toLowerCase();
  const category = CATEGORY_MAP[catKey] || { label: insight.type || "General Insight", icon: "✨", color: "#a855f7" };

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "16px",
        background: insight.isPinned ? "rgba(168, 85, 247, 0.06)" : "rgba(11, 13, 22, 0.6)",
        border: insight.isPinned
          ? "1px solid rgba(168, 85, 247, 0.35)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(16px)",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        opacity: insight.isCompleted ? 0.75 : 1,
      }}
    >
      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Category Tag */}
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              background: `${category.color}18`,
              border: `1px solid ${category.color}35`,
              color: category.color,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </span>

          <PriorityBadge priority={insight.priority} size="sm" />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ConfidenceBadge confidence={insight.confidence} size="sm" />
          <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            {formatTime(insight.timestamp)}
          </span>
        </div>
      </div>

      {/* Title & Summary */}
      <div>
        <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 }}>
          {insight.title}
        </h4>
        <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
          {insight.summary}
        </p>
      </div>

      {/* Primary Recommendation Box */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.25)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#c084fc",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "block",
            marginBottom: "4px",
          }}
        >
          RECOMMENDATION
        </span>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#f8fafc", lineHeight: 1.4 }}>
          {insight.recommendation}
        </p>
      </div>

      {/* Why This Recommendation */}
      {insight.why && <ReasonList reasons={insight.why} />}

      {/* Action Bar */}
      <ActionBar
        isPinned={insight.isPinned}
        isCompleted={insight.isCompleted}
        isSaved={insight.isSaved}
        onDismiss={() => onDismiss(insight.id)}
        onPin={() => onPin(insight.id)}
        onComplete={() => onComplete(insight.id)}
        onSave={() => onSave(insight.id)}
      />
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { ConversationEngine } from "@/lib/conversation/engine";
import { ManagerBriefingCard } from "../conversation/ManagerBriefingCard";
import { ManagerThoughtCard } from "../conversation/ManagerThoughtCard";
import { ManagerConcernCard } from "../conversation/ManagerConcernCard";
import { ManagerPraiseCard } from "../conversation/ManagerPraiseCard";
import { ManagerConversationTimeline } from "../conversation/ManagerConversationTimeline";
import { useApp } from "@/context/AppContext";

interface CreatorIntelligenceTabProps {
  intelligence?: CreatorIntelligenceBundle | null;
  isLoading?: boolean;
}

export const CreatorIntelligenceTab: React.FC<CreatorIntelligenceTabProps> = ({
  intelligence,
  isLoading,
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { theme } = useApp();
  const isDark = theme === "dark";

  if (isLoading || !intelligence) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: isDark ? "#64748b" : "#64748b" }}>
        🧠 Synchronizing Explainable Creator Manager Layer...
      </div>
    );
  }

  const score = intelligence.score;
  const health = intelligence.health;
  const diagnostics = intelligence.diagnostics;

  // Generate the natural language conversation dynamically client-side
  // We use a mock snapshot for the conversation engine based on the latest metrics
  const mockSnapshot = {
    sessionId: "live-session",
    snapshotId: "latest",
    metrics: { totalMessages: 100, messagesPerMinute: 12, uniqueChattersCount: 50, questionCount: intelligence.mood?.contributingAnalytics.questionCount || 0 },
    analytics: { 
      sentiment: intelligence.mood?.contributingAnalytics.sentimentScore || 50, 
      velocity: 12, 
      engagement: 50, 
      momentum: intelligence.mood?.contributingAnalytics.momentumIndex || 50, 
      hypeScore: intelligence.mood?.contributingAnalytics.hypeScore || 0,
      viewers: 100 
    },
    createdAt: new Date().toISOString()
  } as any;

  const conversation = ConversationEngine.generate(intelligence, mockSnapshot);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. Opening Manager Briefing */}
      <ManagerBriefingCard briefing={conversation.briefing} snapshotTime={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />

      {/* 2. Top AI Health / Diagnostic Toggle (Kept for debug/dev view) */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          style={{
            padding: "6px 12px",
            borderRadius: "10px",
            background: showDiagnostics
              ? (isDark ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.15)")
              : (isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"),
            border: "1px solid rgba(168, 85, 247, 0.4)",
            color: isDark ? "#c084fc" : "#7c3aed",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {showDiagnostics ? "Hide AI Health Dashboard" : "🛠️ AI Health & Diagnostics"}
        </button>
      </div>
      {/* 3. Primary Advice */}
      {conversation.primaryAdvice && (
        <ManagerThoughtCard thought={conversation.primaryAdvice} isPrimary={true} />
      )}

      {/* 4. Active Thoughts (excluding primary) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {conversation.thoughts
          .filter(t => !conversation.primaryAdvice || t.id !== conversation.primaryAdvice.id)
          .map(thought => (
            <ManagerThoughtCard key={thought.id} thought={thought} />
          ))}
      </div>

      {/* 5. Praise & Concerns */}
      {(conversation.praise.length > 0 || conversation.concerns.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {conversation.praise.map(p => <ManagerPraiseCard key={p.id} praise={p} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {conversation.concerns.map(c => <ManagerConcernCard key={c.id} concern={c} />)}
          </div>
        </div>
      )}

      {/* 6. Conversation Timeline */}
      <div
        style={{
          padding: "24px",
          borderRadius: "20px",
          background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: isDark ? "none" : "0 4px 20px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
            Manager Conversation Timeline
          </div>
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b" }}>
            {conversation.entries?.length || 0} updates recorded
          </div>
        </div>
        <ManagerConversationTimeline entries={conversation.entries} timeline={conversation.timeline} />
      </div>


      {/* Part 11: Explainable AI Health Dashboard (Collapsible) */}
      {showDiagnostics && health && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: isDark ? "rgba(15, 23, 42, 0.95)" : "#ffffff",
            border: isDark ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(168, 85, 247, 0.25)",
            boxShadow: isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#c084fc" : "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📊 Explainable AI Health Dashboard (Overall Health: {health.overallQualityScore}/100)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            <div style={{ padding: "10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Evidence Quality</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", marginTop: "2px" }}>{health.evidenceCoverage}%</div>
              <div style={{ fontSize: "9px", color: isDark ? "#64748b" : "#64748b", marginTop: "2px" }}>Verified metrics</div>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Confidence Calibration</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: isDark ? "#60a5fa" : "#2563eb", marginTop: "2px" }}>{health.confidenceCalibrationScore}%</div>
              <div style={{ fontSize: "9px", color: isDark ? "#64748b" : "#64748b", marginTop: "2px" }}>Multi-snapshot score</div>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Prediction Stability</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: isDark ? "#c084fc" : "#7c3aed", marginTop: "2px" }}>{100 - health.contradictionRate}%</div>
              <div style={{ fontSize: "9px", color: isDark ? "#64748b" : "#64748b", marginTop: "2px" }}>Zero contradictions</div>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Deduplication Rate</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: isDark ? "#fb7185" : "#e11d48", marginTop: "2px" }}>{diagnostics?.duplicatesRemoved || 0} removed</div>
              <div style={{ fontSize: "9px", color: isDark ? "#64748b" : "#64748b", marginTop: "2px" }}>Intent merged</div>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700" }}>Recommendation Freshness</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: isDark ? "#eab308" : "#d97706", marginTop: "2px" }}>{health.freshnessScore}%</div>
              <div style={{ fontSize: "9px", color: isDark ? "#64748b" : "#64748b", marginTop: "2px" }}>Sub-3m age window</div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

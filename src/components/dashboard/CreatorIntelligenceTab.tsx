"use client";

import React, { useState } from "react";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { ConversationEngine } from "@/lib/conversation/engine";
import { ManagerBriefingCard } from "../conversation/ManagerBriefingCard";
import { ManagerThoughtCard } from "../conversation/ManagerThoughtCard";
import { ManagerConcernCard } from "../conversation/ManagerConcernCard";
import { ManagerPraiseCard } from "../conversation/ManagerPraiseCard";
import { ManagerConversationTimeline } from "../conversation/ManagerConversationTimeline";
interface CreatorIntelligenceTabProps {
  intelligence?: CreatorIntelligenceBundle | null;
  isLoading?: boolean;
}

export const CreatorIntelligenceTab: React.FC<CreatorIntelligenceTabProps> = ({
  intelligence,
  isLoading,
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);

  if (isLoading || !intelligence) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
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
            background: showDiagnostics ? "rgba(168, 85, 247, 0.3)" : "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            color: "#c084fc",
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
      <div style={{ padding: "24px", borderRadius: "20px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
          Conversation Timeline
        </div>
        <ManagerConversationTimeline timeline={conversation.timeline} />
      </div>


      {/* Part 11: Explainable AI Health Dashboard (Collapsible) */}
      {showDiagnostics && health && (
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(168, 85, 247, 0.4)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📊 Explainable AI Health Dashboard (Overall Health: {health.overallQualityScore}/100)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>Evidence Quality</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#34d399", marginTop: "2px" }}>{health.evidenceCoverage}%</div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>Verified metrics</div>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>Confidence Calibration</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#60a5fa", marginTop: "2px" }}>{health.confidenceCalibrationScore}%</div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>Multi-snapshot score</div>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>Prediction Stability</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#c084fc", marginTop: "2px" }}>{100 - health.contradictionRate}%</div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>Zero contradictions</div>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>Deduplication Rate</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#fb7185", marginTop: "2px" }}>{diagnostics?.duplicatesRemoved || 0} removed</div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>Intent merged</div>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>Recommendation Freshness</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#eab308", marginTop: "2px" }}>{health.freshnessScore}%</div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>Sub-3m age window</div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};



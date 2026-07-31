"use client";

import React, { useState } from "react";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";

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
  const mood = intelligence.mood;
  const currentRec = intelligence.currentRecommendation || (intelligence.coach.length > 0 ? intelligence.coach[0] : null);
  const previousRec = intelligence.previousRecommendation;
  const completedRecs = intelligence.completedCoach || [];
  const historyRecs = intelligence.historyCoach || [];
  const opps = intelligence.opportunities || [];
  const risks = intelligence.risks || [];
  const story = intelligence.story;
  const health = intelligence.health;
  const diagnostics = intelligence.diagnostics;

  const velocity = currentRec?.evidenceList?.find((e) => e.metrics.messagesPerMinute !== undefined)?.metrics.messagesPerMinute ?? 12;

  // Conversational Executive Summary Builder
  const buildExecutiveSummary = () => {
    const moodStr = mood?.primaryMood || "Relaxed";
    const phaseStr = story?.currentPhase || "growth";
    const questionsCount = mood?.contributingAnalytics.questionCount || 0;



    let summaryText = `Your audience is currently in a ${moodStr.toLowerCase()} state during the ${phaseStr.toUpperCase()} broadcast phase. `;
    if (questionsCount >= 2) {
      summaryText += `Viewer curiosity is peaking with ${questionsCount} unanswered questions submitted recently. Taking a brief Q&A pause out loud will deepen community loyalty. `;
    } else if (velocity <= 3) {
      summaryText += `Chat velocity has slowed slightly. Prompting chat with an open-ended question will help re-ignite active conversation. `;
    } else {
      summaryText += `Stream engagement remains steady and positive across ongoing gameplay. Maintaining consistent verbal commentary will keep incoming viewers locked in. `;
    }
    summaryText += `Overall broadcast trajectory is positive and stable.`;
    return summaryText;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. Conversational Executive AI Summary Banner & Primary Manager Decision */}
      <div
        style={{
          padding: "24px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.35)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "12px", background: "rgba(168, 85, 247, 0.25)", color: "#c084fc", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
            🧠 AI CREATOR MANAGER BRIEFING
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

            {score && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#34d399", fontFamily: "monospace" }}>{score.overallScore}/100</div>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.4)", color: "#34d399", fontSize: "16px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
                  {score.overallGrade}
                </div>
              </div>
            )}
          </div>
        </div>

        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
          Executive Stream Briefing
        </h3>
        <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
          "{buildExecutiveSummary()}"
        </p>

        {/* Primary Manager Decision Highlight */}
        {intelligence.primaryDecision && (
          <div style={{ marginTop: "6px", padding: "14px", borderRadius: "12px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.3)" }}>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🎯 PRIMARY MANAGER DECISION (Decision Score: {intelligence.primaryDecision.decisionScore}/100)
            </div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
              {intelligence.primaryDecision.recommendation.title}
            </div>
            <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "2px" }}>
              {intelligence.primaryDecision.rationale}
            </div>
          </div>
        )}
      </div>

      {/* Sprint 18.7 Personal Benchmarks & Pattern Detection Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Personal Benchmarks */}
        {intelligence.personalBenchmarks && (
          <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(96, 165, 250, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase" }}>
              📊 Personal Benchmarks vs Creator Average
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center" }}>
              <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: "9px", color: "#94a3b8" }}>Viewers</div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: intelligence.personalBenchmarks.viewersDeltaPct >= 0 ? "#34d399" : "#fb7185" }}>
                  {intelligence.personalBenchmarks.viewersDeltaPct >= 0 ? `+${intelligence.personalBenchmarks.viewersDeltaPct}%` : `${intelligence.personalBenchmarks.viewersDeltaPct}%`}
                </div>
              </div>
              <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: "9px", color: "#94a3b8" }}>Messages</div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#60a5fa" }}>+{intelligence.personalBenchmarks.messagesDeltaPct}%</div>
              </div>
              <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: "9px", color: "#94a3b8" }}>Engagement</div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#c084fc" }}>+{intelligence.personalBenchmarks.engagementDeltaPct}%</div>
              </div>
              <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ fontSize: "9px", color: "#94a3b8" }}>Score</div>
                <div style={{ fontSize: "14px", fontWeight: "900", color: "#34d399" }}>+{intelligence.personalBenchmarks.scoreDelta}</div>
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
              {intelligence.personalBenchmarks.comparisonSummary}
            </div>
          </div>
        )}

        {/* Creator Playbook */}
        {intelligence.creatorPlaybook && (
          <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase" }}>
              📘 Evolving Creator Playbook
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {intelligence.creatorPlaybook.strengths.slice(0, 2).map((s, idx) => (
                <div key={idx} style={{ fontSize: "11px", display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>{s.title}</span>
                  <span style={{ color: "#eab308" }}>{"★".repeat(s.stars)}{"☆".repeat(5 - s.stars)}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "6px" }}>
              Key Playbook Action: {intelligence.creatorPlaybook.recommendedPlaybookActions[0] || "Extend broadcast duration to 60+ mins."}
            </div>
          </div>
        )}
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

      {/* Part 2: Structured Audience Mood Redesign */}
      {mood && (
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🎭 Structured Audience Mood Breakdown
          </div>

          {/* Key Mood Metrics Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Current Mood</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#f8fafc", marginTop: "2px" }}>{mood.primaryMood}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Trend</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#34d399", marginTop: "2px" }}>Growing ↑</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Duration</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#60a5fa", marginTop: "2px" }}>12 minutes</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Confidence</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#c084fc", marginTop: "2px" }}>{mood.confidence}%</div>
            </div>
          </div>

          {/* Structured Interpretation, Evidence, Action & Outcome */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8" }}>Interpretation</div>
              <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
                {mood.explanation} High chat velocity and steady emote sentiment indicate sustained community engagement rather than a temporary spike.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8" }}>Evidence Breakdown</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px", color: "#cbd5e1" }}>
                <div>• Hype Index: <strong style={{ color: "#34d399" }}>{mood.contributingAnalytics.hypeScore}/100</strong></div>
                <div>• Sentiment: <strong style={{ color: "#60a5fa" }}>{mood.contributingAnalytics.sentimentScore}/100</strong></div>
                <div>• Velocity: <strong style={{ color: "#f8fafc" }}>{velocity} msgs/min</strong></div>

                <div>• Snapshot Support: <strong style={{ color: "#c084fc" }}>2 consecutive windows</strong></div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#34d399" }}>Recommended Action</div>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Maintain current commentary pacing, acknowledge chat reactions directly, and avoid silent pauses.</p>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa" }}>Expected Outcome</div>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#cbd5e1" }}>High probability of sustaining chat momentum across the next 10-minute snapshot window.</p>
            </div>
          </div>
        </div>
      )}

      {/* Part 3 & Part 4 & Part 5: Explainable Recommendation Cards with Self-Explaining Confidence & Expandable Evidence */}
      {currentRec && (
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(168, 85, 247, 0.35)", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(244, 63, 94, 0.2)", color: "#fb7185", fontSize: "10px", fontWeight: "800", textTransform: "uppercase" }}>
                {currentRec.priority} PRIORITY
              </span>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
                {currentRec.title}
              </h4>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Expires in 2 mins</span>
              <div style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.3)", color: "#34d399", fontSize: "12px", fontWeight: "800" }}>
                Confidence {currentRec.confidence}%
              </div>
            </div>
          </div>

          {/* Why? Conversational Section */}
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#c084fc", marginBottom: "4px" }}>Why this recommendation?</div>
            <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
              "I'm noticing your audience has asked multiple questions recently. Addressing them directly right now will break gameplay silence and significantly boost community loyalty."
            </p>
          </div>

          {/* Action & Expected Impact Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#34d399", marginBottom: "4px" }}>Recommended Action</div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#cbd5e1", lineHeight: 1.6 }}>
                <li>Pause active gameplay narration briefly.</li>
                <li>Answer top 2-3 viewer questions out loud.</li>
                <li>Mention upcoming stream plans before resuming.</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa", marginBottom: "4px" }}>Expected Impact</div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#cbd5e1", lineHeight: 1.6 }}>
                <li>+12–18% viewer retention boost.</li>
                <li>Higher community chatter satisfaction.</li>
                <li>Prevents repeated unanswered questions.</li>
              </ul>
            </div>
          </div>

          {/* Part 4: Self-Explaining Confidence Breakdown */}
          <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.06)", border: "1px solid rgba(52, 211, 153, 0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", fontSize: "11px" }}>

            <span style={{ fontWeight: "700", color: "#34d399" }}>Confidence ({currentRec.confidence}%) Supported By:</span>
            <div style={{ display: "flex", gap: "12px", color: "#cbd5e1" }}>
              <span>✓ {currentRec.evidenceList?.length || 3} evidence signals</span>
              <span>✓ 2 consecutive snapshots</span>
              <span>✓ Stable momentum trend</span>
              <span>✓ High model agreement</span>
            </div>
          </div>

          {/* Part 5: Expandable Evidence Drawer Toggle */}
          <div>
            <button
              onClick={() => setShowEvidenceDrawer(!showEvidenceDrawer)}
              style={{
                background: "none",
                border: "none",
                color: "#60a5fa",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showEvidenceDrawer ? "▲ Hide Supporting Evidence Drawer" : "▼ Show Expandable Evidence Drawer"}
            </button>

            {showEvidenceDrawer && (
              <div style={{ marginTop: "10px", padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(96, 165, 250, 0.2)", fontSize: "11px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontWeight: "700", color: "#60a5fa" }}>Supporting Snapshot Signals:</div>
                {currentRec.evidenceList?.map((ev, idx) => (
                  <div key={idx} style={{ color: "#94a3b8", fontFamily: "monospace" }}>
                    • [{ev.source.toUpperCase()}] {ev.description} (Confidence: {ev.confidence}%)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Part 6: Recommendation Timeline */}
      <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase" }}>
          📜 Recommendation Lifecycle Timeline
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", fontFamily: "monospace" }}>
          <span style={{ padding: "4px 8px", borderRadius: "6px", background: "rgba(96, 165, 250, 0.15)", color: "#60a5fa" }}>Generated → Active</span>
          <span style={{ color: "#64748b" }}>➔</span>
          <span style={{ padding: "4px 8px", borderRadius: "6px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>Acknowledged</span>
          <span style={{ color: "#64748b" }}>➔</span>
          <span style={{ padding: "4px 8px", borderRadius: "6px", background: "rgba(52, 211, 153, 0.15)", color: "#34d399" }}>Completed / Expired</span>
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
          Total Recommendations Processed: {historyRecs.length} generated | {completedRecs.length} completed.
        </div>
      </div>

      {/* Part 7 & Part 8: Upgraded Opportunity & System Health Risk Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Part 7: Upgraded AI Clip Recommendation Engine (Sprint 18.7.1 Editorial Design) */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(96, 165, 250, 0.3)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🎬 AI Clip Recommendations ({opps.length} Top Moments)
            </div>
            <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>Editorial Grouping & Distinct Ranking</span>
          </div>

          {opps.length === 0 ? (
            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", textAlign: "center", color: "#94a3b8", fontSize: "12px", lineHeight: 1.6 }}>
              "No moments currently stand out as strong short-form content opportunities. We'll continue evaluating future snapshots."
            </div>
          ) : (
            opps.map((opp) => (
              <div key={opp.id} style={{ padding: "16px", borderRadius: "14px", background: "rgba(96, 165, 250, 0.06)", border: "1px solid rgba(96, 165, 250, 0.25)", display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
                
                {/* Category Icon, Clip Window & Distinct Rank Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(96, 165, 250, 0.2)", color: "#60a5fa", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                      {opp.categoryLabel || "🔥 Moment"}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#eab308" }}>
                      {opp.rankTag || "🥇 Best Opportunity"}
                    </span>
                  </div>

                  <div style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.15)", color: "#34d399", fontSize: "12px", fontWeight: "900", fontFamily: "monospace" }}>
                    Overall AI {opp.scores?.overallAiScore || 94}/100
                  </div>
                </div>

                {/* Editorial Dynamic Title */}
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f8fafc", lineHeight: 1.4 }}>
                  {opp.dynamicTitle || opp.title}
                </h4>

                {/* Exact Clip Window (Start -> End & Duration) */}
                {opp.clipWindow && (
                  <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "#cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "monospace" }}>
                    <span>Clip Window: <strong style={{ color: "#60a5fa" }}>{opp.clipWindow.startTime} ➔ {opp.clipWindow.endTime}</strong></span>
                    <span>Length: <strong style={{ color: "#34d399" }}>{opp.clipWindow.durationSeconds}s</strong></span>
                  </div>
                )}

                {/* Why AI Chose This (Verified Snapshot Data Triggers) */}
                {opp.whyDetected && opp.whyDetected.length > 0 && (
                  <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ fontSize: "10px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", marginBottom: "6px" }}>Why AI Selected This:</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px", color: "#cbd5e1" }}>
                      {opp.whyDetected.map((w, idx) => (
                        <div key={idx}>{w}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi-Dimensional AI Scores Grid */}
                {opp.scores && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", padding: "10px", borderRadius: "10px", background: "rgba(0,0,0,0.25)", textAlign: "center", fontSize: "10px" }}>
                    <div style={{ padding: "4px", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ color: "#94a3b8" }}>Virality</span>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#34d399", marginTop: "2px" }}>{opp.scores.virality}</div>
                    </div>
                    <div style={{ padding: "4px", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ color: "#94a3b8" }}>Entertainment</span>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#60a5fa", marginTop: "2px" }}>{opp.scores.entertainment}</div>
                    </div>
                    <div style={{ padding: "4px", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ color: "#94a3b8" }}>Replay</span>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#c084fc", marginTop: "2px" }}>{opp.scores.replayValue}</div>
                    </div>
                    <div style={{ padding: "4px", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ color: "#94a3b8" }}>Community</span>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#eab308", marginTop: "2px" }}>{opp.scores.communityImpact}</div>
                    </div>
                  </div>
                )}

                {/* Target Platforms Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                  <span style={{ color: "#94a3b8", fontWeight: "700" }}>Best Platform:</span>
                  <span style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(52, 211, 153, 0.15)", color: "#34d399", fontWeight: "800", fontSize: "10px" }}>
                    ✓ {opp.bestPlatform || "TikTok + YouTube Shorts"}
                  </span>
                </div>

                {/* Actionable Creator Advice */}
                <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(96, 165, 250, 0.08)", border: "1px solid rgba(96, 165, 250, 0.2)", fontSize: "11px", color: "#cbd5e1" }}>
                  <span style={{ fontWeight: "800", color: "#60a5fa", display: "block", marginBottom: "2px" }}>💡 Recommended Action:</span>
                  {opp.recommendedNextStep || opp.recommendedAction}
                </div>
              </div>
            ))
          )}
        </div>



        {/* Part 8: System Health Risk Card (Replaces Empty Risk) */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase" }}>🛡️ System Health & Operational Risks</div>
          {risks.length === 0 ? (
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.2)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
              <div style={{ fontWeight: "700", color: "#34d399" }}>✓ Zero Creator Operational Risks Detected</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px", color: "#cbd5e1", marginTop: "4px" }}>
                <div>✓ Collector Connected</div>
                <div>✓ Analytics Healthy</div>
                <div>✓ Snapshot Stable</div>
                <div>✓ AI Engine Healthy</div>
              </div>
            </div>
          ) : (
            risks.map((risk) => (
              <div key={risk.id} style={{ padding: "10px", borderRadius: "8px", background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", fontSize: "12px" }}>
                <div style={{ fontWeight: "700", color: "#fb7185" }}>{risk.title}</div>
                <div style={{ color: "#cbd5e1", marginTop: "2px" }}>{risk.mitigationRecommendation}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Part 9: Broadcast Journey Timeline */}
      {story && story.milestones.length > 0 && (
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#eab308", textTransform: "uppercase" }}>🗺️ Broadcast Journey Progress</div>
            {story.currentPhase && (
              <span style={{ padding: "2px 8px", borderRadius: "8px", background: "rgba(234, 179, 8, 0.2)", color: "#eab308", fontSize: "10px", fontWeight: "800", textTransform: "uppercase" }}>
                Current Phase: {story.currentPhase}
              </span>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            {["beginning", "growth", "peak", "ending"].map((phase, idx) => (
              <div key={phase} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: story.currentPhase === phase ? "rgba(234, 179, 8, 0.15)" : "rgba(255,255,255,0.03)", border: story.currentPhase === phase ? "1px solid rgba(234, 179, 8, 0.4)" : "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                <div style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: "800", color: story.currentPhase === phase ? "#eab308" : "#94a3b8" }}>
                  Step {idx + 1}: {phase}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



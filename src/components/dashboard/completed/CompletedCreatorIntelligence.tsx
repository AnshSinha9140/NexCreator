"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { EvidenceCard } from "../chat/EvidenceCard";

interface CompletedCreatorIntelligenceProps {
  summary?: FinalSessionSummary | null;
  intelligence?: CreatorIntelligenceBundle | null;
}

export const CompletedCreatorIntelligence: React.FC<CompletedCreatorIntelligenceProps> = ({
  summary,
  intelligence,
}) => {
  const sessionType = summary?.sessionType || "EMPTY";
  const isValid = summary?.integrityFlags?.reportValid ?? (sessionType === "COMPLETE");

  if (!isValid || !intelligence || (intelligence.coach.length === 0 && !intelligence.score)) {
    return (
      <div
        style={{
          padding: "48px 24px",
          borderRadius: "20px",
          background: "rgba(13, 16, 27, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🧠</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
          Executive AI Report Not Available
        </h3>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "520px", margin: "0 auto" }}>
          Not enough verified broadcast data was collected to generate a Post-Broadcast Manager Briefing.
        </p>
      </div>
    );
  }

  const score = intelligence.score;
  const mood = intelligence.mood;
  const coach = intelligence.coach || [];
  const completedRecs = intelligence.completedCoach || [];
  const historyRecs = intelligence.historyCoach || [];
  const story = intelligence.story;
  const health = intelligence.health;

  const biggestSuccess = completedRecs.length > 0
    ? completedRecs[0]
    : (coach.length > 0 ? coach[0] : null);

  const missedOpportunity = historyRecs.find((r) => r.status === "EXPIRED" || r.status === "SUPERSEDED") || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Executive Post-Broadcast Briefing Header */}
      <div
        style={{
          padding: "28px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", gap: "6px", padding: "4px 10px", borderRadius: "12px", background: "rgba(168,85,247,0.2)", color: "#c084fc", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>
            ✓ EXECUTIVE MANAGER POST-BROADCAST BRIEFING
          </div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#f8fafc" }}>
            Creator Intelligence Post-Stream Review
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
            Comprehensive briefing on audience behavior, recommendation outcomes, and future stream focus
          </p>
        </div>

        {score && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>Final Score</div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#34d399", fontFamily: "monospace" }}>{score.overallScore}/100</div>
            </div>
            <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.4)", color: "#34d399", fontSize: "24px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
              {score.overallGrade}
            </div>
          </div>
        )}
      </div>

      {/* 2. Biggest Success vs Missed Opportunity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Biggest Success */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(52, 211, 153, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase" }}>
            🏆 Biggest Broadcast Success
          </div>
          {biggestSuccess ? (
            <>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f8fafc" }}>{biggestSuccess.title}</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1" }}>{biggestSuccess.description}</p>
              {biggestSuccess.evidenceList && <EvidenceCard evidence={biggestSuccess.evidenceList} />}
            </>
          ) : (
            <div style={{ fontSize: "12px", color: "#64748b" }}>Steady broadcast baseline maintained cleanly throughout session.</div>
          )}
        </div>

        {/* Missed Opportunity / Expired Action */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(244, 63, 94, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#fb7185", textTransform: "uppercase" }}>
            ⚠️ Missed Opportunity / Expired Action
          </div>
          {missedOpportunity ? (
            <>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f8fafc" }}>{missedOpportunity.title}</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1" }}>{missedOpportunity.description}</p>
              <div style={{ fontSize: "11px", color: "#fb7185" }}>Status: Recommendation expired before execution</div>
            </>
          ) : (
            <div style={{ fontSize: "12px", color: "#34d399" }}>✓ Zero missed opportunities recorded. Streamer acted on all active coaching cues!</div>
          )}
        </div>
      </div>

      {/* 3. Lessons Learned & Priority Improvements */}
      <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase" }}>
          🎓 Lessons Learned & Manager Priority Improvements
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa" }}>1. Audience Interaction</div>
            <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>
              Q&A segments yielded highest viewer retention. Continue hosting 60-second verbal pauses during chat spikes.
            </div>
          </div>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#34d399" }}>2. Commentary Pacing</div>
            <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>
              Verbal thought process narration kept incoming viewers engaged during gameplay transitions.
            </div>
          </div>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#eab308" }}>3. Next Stream Focus</div>
            <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>
              Prepare 2 community questions in advance to kickstart chat velocity during early stream warm-up phase.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mood Timeline & Broadcast Journey Narrative */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {mood && (
          <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase" }}>🎭 Audience Mood Evolution</div>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f8fafc" }}>Final Primary Mood: {mood.primaryMood}</h4>
            {mood.moodTimeline && mood.moodTimeline.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                {mood.moodTimeline.map((t, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", fontSize: "11px", fontFamily: "monospace" }}>
                    <span style={{ color: "#c084fc" }}>[{t.timestamp}]</span>
                    <span style={{ color: "#cbd5e1" }}>{t.fromMood} ➔ <strong style={{ color: "#34d399" }}>{t.toMood}</strong></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {story && (
          <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#eab308", textTransform: "uppercase" }}>📖 Broadcast Session Narrative</div>
            <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>{story.summaryNarrative}</p>
          </div>
        )}
      </div>
    </div>
  );
};




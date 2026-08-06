"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { ConversationEngine } from "@/lib/conversation/engine";
import { ExecutiveBriefingCard } from "../../conversation/ExecutiveBriefingCard";

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

  const hasCoach = Array.isArray(intelligence?.coach) && intelligence.coach.length > 0;
  const hasScore = Boolean(intelligence?.score);

  if (!isValid || !intelligence || (!hasCoach && !hasScore)) {
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

  const story = intelligence.story;

  // Derive total messages and duration for the review
  const totalMessages = summary?.totalMessagesCollected || 0;
  let durationMinutes = summary?.durationMinutes || 0;
  if (!durationMinutes && story?.milestones?.length) {
    durationMinutes = story.milestones.length * 10;
  }

  const review = ConversationEngine.generateEndOfStreamReview(intelligence, totalMessages, durationMinutes);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      <ExecutiveBriefingCard review={review} />

      {/* Single Focus Before Next Stream (Sprint 20.1 Part 13) */}
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.12))",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#fcd34d", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          🎯 Single Focus Before Your Next Stream
        </div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
          "{review.oneThingToImprove}"
        </div>
      </div>
    </div>
  );
};

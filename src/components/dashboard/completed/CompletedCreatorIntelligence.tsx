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
    </div>
  );
};

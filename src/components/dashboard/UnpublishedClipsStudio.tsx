"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Flame, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

export interface ClipCandidate {
  id: string;
  title: string;
  hookText?: string;
  platform?: string;
  viralityScore?: number;
  reason?: string;
}

export interface UnpublishedClipsStudioProps {
  clips?: ClipCandidate[];
}

export const UnpublishedClipsStudio: React.FC<UnpublishedClipsStudioProps> = ({ clips }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const defaultClips: ClipCandidate[] = [
    {
      id: "clip-1",
      title: "Emote & Reaction Surge — Chat Reacts Live",
      hookText: "Watch chat explode when this reaction happened! 😱 #kick #gaming",
      platform: "Shorts",
      viralityScore: 90,
      reason: "High Chat Velocity & Emote Spike",
    },
    {
      id: "clip-2",
      title: "Emote & Reaction Surge — Chat Reacts Live (KEKW Spam)",
      hookText: "They spammed KEKW endlessly during this play! ⚡ #clips",
      platform: "Shorts",
      viralityScore: 90,
      reason: "Peak Audience Emotion & Retention",
    },
    {
      id: "clip-3",
      title: "Viewer Q&A Surge: 7 Questions Asked in Chat",
      hookText: "Chat asked the ultimate question at the worst moment 😂",
      platform: "Shorts",
      viralityScore: 90,
      reason: "High Engagement & Audience Q&A Peak",
    },
  ];

  const clipList = clips && clips.length > 0 ? clips.slice(0, 3) : defaultClips;

  const handleCopy = (clip: ClipCandidate) => {
    const textToCopy = `${clip.title}\n\nHook: ${clip.hookText || clip.title}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "16px",
        background: isDark ? "rgba(13,16,27,0.7)" : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "auto",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: isDark ? "#c084fc" : "#9333ea", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px", fontFamily: "monospace" }}>
          <Sparkles style={{ width: "14px", height: "14px", color: isDark ? "#a855f7" : "#9333ea" }} />
          <span>Ready to Publish (Top Highlights)</span>
        </div>
        <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#64748b", fontFamily: "monospace" }}>
          {clipList.length} CLIP CANDIDATES
        </span>
      </div>

      {/* Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
        {clipList.map((clip, idx) => {
          const score = clip.viralityScore ?? 90;
          const clipId = clip.id || `clip-highlight-${idx}`;
          const isCopied = copiedId === clip.id || copiedId === clipId;

          return (
            <motion.div
              key={clipId}
              whileHover={{ y: -2 }}
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                justifyContent: "space-between",
              }}
            >
              {/* Header Badges */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.08)", color: isDark ? "#c084fc" : "#9333ea", fontFamily: "monospace", fontWeight: "bold" }}>
                  {(clip.platform || "SHORTS").toUpperCase()}
                </span>

                <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "6px", background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)", color: isDark ? "#34d399" : "#059669", border: isDark ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(16,185,129,0.2)", fontFamily: "monospace", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Flame style={{ width: "10px", height: "10px", color: isDark ? "#10b981" : "#059669" }} />
                  <span>Virality: {score}/100</span>
                </span>
              </div>

              {/* Title & Reason */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: isDark ? "#f8fafc" : "#0f172a", lineHeight: 1.4, minHeight: "36px" }}>
                  {clip.title}
                </div>
                {clip.reason && (
                  <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {clip.reason}
                  </div>
                )}
              </div>

              {/* Primary Copy Button */}
              <button
                onClick={() => handleCopy(clip)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "4px",
                  boxShadow: "0 4px 12px rgba(168,85,247,0.3)",
                }}
              >
                {isCopied ? (
                  <>
                    <Check style={{ width: "14px", height: "14px" }} />
                    <span>Copied Title & Hook!</span>
                  </>
                ) : (
                  <>
                    <Copy style={{ width: "14px", height: "14px" }} />
                    <span>Copy Title & Hook</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

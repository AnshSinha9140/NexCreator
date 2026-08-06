"use client";

import React from "react";
import { EndOfStreamReview } from "@/lib/conversation/types";
import { useApp } from "@/context/AppContext";

interface ExecutiveBriefingCardProps {
  review: EndOfStreamReview;
}

export const ExecutiveBriefingCard: React.FC<ExecutiveBriefingCardProps> = ({
  review,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        padding: "32px",
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, rgba(13,16,27,0.95) 0%, rgba(20,26,46,0.95) 100%)"
          : "#ffffff",
        border: isDark ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(168,85,247,0.4)",
        boxShadow: isDark ? "none" : "0 4px 24px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isDark ? "#c084fc" : "#7c3aed" }} />
        <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#c084fc" : "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          End of Stream Manager Review
        </div>
      </div>

      <div style={{ fontSize: "24px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", lineHeight: 1.3 }}>
        "{review.openingStatement}"
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "8px" }}>
        {/* What Impressed Me */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⭐</span> What stood out
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {review.whatImpressedMe.map((text, idx) => (
              <div key={idx} style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.6, paddingLeft: "12px", borderLeft: "2px solid rgba(52,211,153,0.3)" }}>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* What Hurt Performance */}
        {review.whatHurtPerformance.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: "800", color: isDark ? "#fb7185" : "#e11d48", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠️</span> What held the stream back
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {review.whatHurtPerformance.map((text, idx) => (
                <div key={idx} style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.6, paddingLeft: "12px", borderLeft: "2px solid rgba(244,63,94,0.3)" }}>
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", paddingTop: "20px", borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
        {/* Next Time: Repeat */}
        {review.whatToRepeat.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>
              Next time: Do this again
            </div>
            {review.whatToRepeat.map((text, idx) => (
              <div key={idx} style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.6 }}>
                • {text}
              </div>
            ))}
          </div>
        )}

        {/* Next Time: Avoid */}
        {review.whatToNeverRepeat.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>
              Next time: Avoid this
            </div>
            {review.whatToNeverRepeat.map((text, idx) => (
              <div key={idx} style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.6 }}>
                • {text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Highlights & Misses */}
      {(review.mostValuableClip || review.biggestMissedOpportunity) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px", borderRadius: "12px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
          {review.mostValuableClip && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#60a5fa" : "#2563eb", marginBottom: "4px" }}>Most valuable moment</div>
              <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#475569", lineHeight: 1.5 }}>{review.mostValuableClip}</div>
            </div>
          )}
          {review.biggestMissedOpportunity && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: isDark ? "#fb7185" : "#e11d48", marginBottom: "4px" }}>Biggest missed opportunity</div>
              <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#475569", lineHeight: 1.5 }}>{review.biggestMissedOpportunity}</div>
            </div>
          )}
        </div>
      )}

      {/* Closing Statement */}
      <div style={{ marginTop: "12px", padding: "20px", borderRadius: "16px", background: isDark ? "rgba(168,85,247,0.1)" : "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", textAlign: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", fontStyle: "italic", lineHeight: 1.4 }}>
          "{review.closingStatement}"
        </div>
      </div>
    </div>
  );
};

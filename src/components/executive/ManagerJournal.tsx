"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { ManagerJournalData } from "@/lib/ai/executiveTypes";

interface ManagerJournalProps {
  journal?: ManagerJournalData;
}

export const ManagerJournal: React.FC<ManagerJournalProps> = ({ journal }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const data = journal || {
    entryText: `Today surprised me. Your biggest engagement spike wasn't during gameplay — it happened when you laughed directly with chat. I'm becoming convinced your audience returns for your personality more than your mechanics. Next stream I'd like to test whether intentionally creating more conversational moments increases overall retention. Let's validate that.`,
    signedBy: "Your AI Creator Manager",
  };

  return (
    <div
      style={{
        padding: "28px",
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: isDark ? "1px solid rgba(168, 85, 247, 0.35)" : "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
        boxShadow: isDark ? "0 10px 30px rgba(168, 85, 247, 0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>✍️</span>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: isDark ? "#f8fafc" : "#0f172a" }}>
            Manager Journal
          </h3>
        </div>
        <span style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#a855f7" : "#9333ea", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>
          SENIOR CREATOR PARTNER NOTE
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "15px",
          color: isDark ? "#e2e8f0" : "#1e293b",
          lineHeight: "1.7",
          fontStyle: "italic",
          fontFamily: "'Georgia', serif",
        }}
      >
        "{data.entryText}"
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0", paddingTop: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: isDark ? "#c084fc" : "#9333ea", fontFamily: "monospace" }}>
          Signed — {data.signedBy}
        </span>
      </div>
    </div>
  );
};

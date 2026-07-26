"use client";

import React from "react";

interface ReasonListProps {
  reasons: string[];
}

export const ReasonList: React.FC<ReasonListProps> = ({ reasons }) => {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "12px 14px",
        borderRadius: "10px",
        background: "rgba(6, 8, 16, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          display: "block",
          marginBottom: "8px",
        }}
      >
        Why?
      </span>
      <ul
        style={{
          margin: 0,
          paddingLeft: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {reasons.map((reason, idx) => (
          <li
            key={idx}
            style={{
              fontSize: "12px",
              color: "#cbd5e1",
              lineHeight: 1.4,
            }}
          >
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
};

"use client";

import React from "react";

interface ActionBarProps {
  isPinned?: boolean;
  isCompleted?: boolean;
  isSaved?: boolean;
  onDismiss: () => void;
  onPin: () => void;
  onComplete: () => void;
  onSave: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  isPinned,
  isCompleted,
  isSaved,
  onDismiss,
  onPin,
  onComplete,
  onSave,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginTop: "16px",
        paddingTop: "12px",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Complete Button */}
        <button
          onClick={onComplete}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            background: isCompleted ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.1)",
            border: isCompleted ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(16, 185, 129, 0.25)",
            color: "#34d399",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s ease",
          }}
        >
          <span>{isCompleted ? "✓ Done" : "Mark Done"}</span>
        </button>

        {/* Pin Button */}
        <button
          onClick={onPin}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            background: isPinned ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.04)",
            border: isPinned ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
            color: isPinned ? "#c084fc" : "#cbd5e1",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s ease",
          }}
        >
          <span>📌</span>
          <span>{isPinned ? "Pinned" : "Pin"}</span>
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            background: isSaved ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.04)",
            border: isSaved ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
            color: isSaved ? "#60a5fa" : "#cbd5e1",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s ease",
          }}
        >
          <span>🔖</span>
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        style={{
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          background: "transparent",
          border: "1px solid transparent",
          color: "#64748b",
          transition: "all 0.15s ease",
        }}
      >
        Dismiss
      </button>
    </div>
  );
};

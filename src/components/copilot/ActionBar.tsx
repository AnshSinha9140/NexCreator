"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

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
  const { theme } = useApp();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginTop: "12px",
        paddingTop: "12px",
        borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Complete / Mark Done Button */}
        <button
          onClick={onComplete}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            background: isCompleted
              ? (isDark ? "rgba(16, 185, 129, 0.25)" : "#d1fae5")
              : (isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5"),
            border: isCompleted
              ? (isDark ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid #6ee7b7")
              : (isDark ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #a7f3d0"),
            color: isCompleted
              ? (isDark ? "#34d399" : "#047857")
              : (isDark ? "#34d399" : "#065f46"),
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>{isCompleted ? "✓ Done" : "Mark Done"}</span>
        </button>

        {/* Pin Button */}
        <button
          onClick={onPin}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            background: isPinned
              ? (isDark ? "rgba(168, 85, 247, 0.25)" : "#f3e8ff")
              : (isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9"),
            border: isPinned
              ? (isDark ? "1px solid rgba(168, 85, 247, 0.5)" : "1px solid #d8b4fe")
              : (isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e2e8f0"),
            color: isPinned
              ? (isDark ? "#c084fc" : "#7e22ce")
              : (isDark ? "#94a3b8" : "#475569"),
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>📌</span>
          <span>{isPinned ? "Pinned" : "Pin"}</span>
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            background: isSaved
              ? (isDark ? "rgba(59, 130, 246, 0.25)" : "#dbeafe")
              : (isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9"),
            border: isSaved
              ? (isDark ? "1px solid rgba(59, 130, 246, 0.5)" : "1px solid #93c5fd")
              : (isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e2e8f0"),
            color: isSaved
              ? (isDark ? "#60a5fa" : "#1d4ed8")
              : (isDark ? "#94a3b8" : "#475569"),
            display: "flex",
            alignItems: "center",
            gap: "6px",
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
          padding: "4px 8px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          background: "transparent",
          border: "none",
          color: isDark ? "#64748b" : "#64748b",
          transition: "all 0.15s ease",
        }}
      >
        Dismiss
      </button>
    </div>
  );
};

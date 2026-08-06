"use client";

import React from "react";
import { CanonicalChatMessage, ChatToken } from "@/lib/chat/types";
import { MessageNormalizer } from "@/lib/chat/normalizer";
import { useApp } from "@/context/AppContext";

interface RichChatMessageProps {
  message: CanonicalChatMessage | any;
}

export const RichChatMessage: React.FC<RichChatMessageProps> = ({ message }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  // Graceful Fallback for Legacy Stored Messages
  const canonical: CanonicalChatMessage = message.tokens
    ? (message as CanonicalChatMessage)
    : MessageNormalizer.normalize(message, message.sessionId || "legacy");

  const formattedTime = canonical.timestamp
    ? new Date(canonical.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

  return (
    <div
      style={{
        padding: "8px 12px",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
        background: "transparent",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        fontSize: "13px",
        lineHeight: "1.4",
        fontFamily: "'Inter', sans-serif",
        width: "100%",
        transition: "background 0.15s ease",
      }}
    >
      {/* Timestamp */}
      {formattedTime && (
        <span
          style={{
            fontSize: "11px",
            color: isDark ? "#64748b" : "#64748b",
            fontFamily: "monospace",
            marginTop: "2px",
            flexShrink: 0,
          }}
        >
          {formattedTime}
        </span>
      )}

      {/* Badges */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "2px", flexShrink: 0 }}>
        {canonical.author.badges.map((badge, idx) => (
          <span
            key={idx}
            style={{
              fontSize: "9px",
              fontWeight: 800,
              padding: "1px 5px",
              borderRadius: "4px",
              background: badge.color ? `${badge.color}20` : "rgba(168,85,247,0.15)",
              border: `1px solid ${badge.color || "#a855f7"}`,
              color: badge.color || (isDark ? "#c084fc" : "#7c3aed"),
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            {badge.label}
          </span>
        ))}
      </div>

      {/* Username */}
      <span
        style={{
          fontWeight: 700,
          color: isDark ? "#f8fafc" : "#0f172a",
          flexShrink: 0,
        }}
      >
        {canonical.author.displayName || canonical.author.username}:
      </span>

      {/* Tokens (Emotes, Emojis, Text) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px",
          color: isDark ? "#cbd5e1" : "#334155",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          maxWidth: "100%",
        }}
      >

        {canonical.tokens.map((token: ChatToken, idx: number) => {
          if (token.type === "emote" && token.emote) {
            return (
              <span key={idx} style={{ display: "inline-flex", alignItems: "center" }}>
                {token.emote.imageUrl ? (
                  <img
                    src={token.emote.imageUrl}
                    alt={token.emote.name}
                    title={token.emote.name}
                    style={{ height: "24px", verticalAlign: "middle", objectFit: "contain" }}
                    onError={(e) => {
                      // Fallback to text pill if image load fails
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "6px",
                      background: "rgba(96, 165, 250, 0.15)",
                      border: "1px solid rgba(96, 165, 250, 0.3)",
                      color: "#60a5fa",
                      fontSize: "11px",
                      fontWeight: "700",
                      fontFamily: "monospace",
                    }}
                  >
                    :{token.emote.name}:
                  </span>
                )}
              </span>
            );
          }

          if (token.type === "emoji" && token.emoji) {
            return (
              <span key={idx} style={{ fontSize: "16px", verticalAlign: "middle" }} title={token.emoji.meaning}>
                {token.emoji.char}
              </span>
            );
          }

          return <span key={idx}>{token.value}</span>;
        })}
      </div>
    </div>
  );
};

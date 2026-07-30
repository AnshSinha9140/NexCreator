"use client";

import React from "react";
import { CanonicalChatMessage, ChatToken } from "@/lib/chat/types";
import { MessageNormalizer } from "@/lib/chat/normalizer";

interface RichChatMessageProps {
  message: CanonicalChatMessage | any;
}

export const RichChatMessage: React.FC<RichChatMessageProps> = ({ message }) => {
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
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "8px 12px",
        borderRadius: "8px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        fontSize: "13px",
        lineHeight: "1.4",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Timestamp */}
      {formattedTime && (
        <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>
          {formattedTime}
        </span>
      )}

      {/* Badges */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "2px" }}>
        {canonical.author.badges.map((badge, idx) => (
          <span
            key={idx}
            style={{
              fontSize: "9px",
              fontWeight: "800",
              padding: "1px 5px",
              borderRadius: "4px",
              background: badge.color ? `${badge.color}25` : "rgba(168,85,247,0.2)",
              border: `1px solid ${badge.color || "#a855f7"}`,
              color: badge.color || "#c084fc",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            {badge.label}
          </span>
        ))}
      </div>

      {/* Username */}
      <span style={{ fontWeight: "700", color: "#f8fafc", flexShrink: 0 }}>
        {canonical.author.displayName || canonical.author.username}:
      </span>

      {/* Tokens (Emotes, Emojis, Text) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px",
          color: "#cbd5e1",
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

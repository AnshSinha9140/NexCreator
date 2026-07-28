"use client";

import React, { useRef, useEffect } from "react";

interface LiveChatTabProps {
  messages: any[];
  telemetry: any;
  isLoading: boolean;
}

export const LiveChatTab: React.FC<LiveChatTabProps> = ({
  messages,
  telemetry,
  isLoading,
}) => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (isLoading && messages.length === 0) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ height: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
        <div style={{ height: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
        <div style={{ height: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            marginBottom: "16px",
          }}
        >
          💬
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>
          Waiting for Chat Activity...
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
          Live chat messages from your connected Kick/YouTube broadcast will stream here automatically.
        </p>
      </div>
    );
  }

  const messagesPerMin = telemetry?.messagesPerMinute || telemetry?.stats?.messagesPerMinute || messages.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Header Info Bar */}
      <div
        style={{
          padding: "10px 16px",
          borderRadius: "10px",
          background: "rgba(13,16,27,0.8)",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
        }}
      >
        <span style={{ color: "#94a3b8", fontWeight: "600" }}>
          Streaming Messages ({messages.length} Cached)
        </span>
        <span style={{ color: "#34d399", fontWeight: "700", fontFamily: "monospace" }}>
          ⚡ {messagesPerMin} msgs/min
        </span>
      </div>

      {/* Auto-Scrolling Messages Feed */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          paddingRight: "6px",
          maxHeight: "420px",
        }}
      >
        {messages.map((msg, idx) => {
          const isKick = (msg.platform || "").toLowerCase() === "kick";
          const platformColor = isKick ? "#53FC18" : "#ff4d4d";
          const platformBg = isKick ? "rgba(83, 252, 24, 0.15)" : "rgba(255, 0, 0, 0.15)";
          const author = typeof msg.author === "string" ? msg.author : msg.author?.displayName || msg.author?.username || msg.username || "Viewer";
          const content = msg.message || msg.content || "";
          const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : "";

          return (
            <div
              key={msg.id || idx}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              {/* Avatar / Platform Dot */}
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: platformBg,
                  border: `1px solid ${platformColor}40`,
                  color: platformColor,
                  fontWeight: "800",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>

              {/* Message Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "700", fontSize: "13px", color: "#f8fafc" }}>
                    {author}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "700",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      background: platformBg,
                      color: platformColor,
                      textTransform: "uppercase",
                    }}
                  >
                    {msg.platform || "CHAT"}
                  </span>
                  {timeStr && (
                    <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "auto", fontFamily: "monospace" }}>
                      {timeStr}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "3px", lineHeight: 1.4, wordBreak: "break-word" }}>
                  {content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

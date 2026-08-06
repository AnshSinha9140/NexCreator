"use client";

import React, { useRef, useEffect } from "react";
import { RichChatMessage } from "./chat/RichChatMessage";
import { useApp } from "@/context/AppContext";

interface LiveChatTabProps {
  messages: any[];
  telemetry: any;
  isLoading: boolean;
  connectionState?: "connected" | "reconnecting" | "disconnected";
  reconnectAttempt?: number;
}

export const LiveChatTab: React.FC<LiveChatTabProps> = ({
  messages = [],
  telemetry,
  isLoading,
  connectionState = "connected",
  reconnectAttempt = 0,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Deduplicate and ensure strict sequence ordering by timestamp/id
  const cleanMessages = React.useMemo(() => {
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const msg of messages) {
      const idKey = msg.id || `${msg.username}-${msg.timestamp || msg.createdAt}-${msg.message}`;
      if (!seen.has(idKey)) {
        seen.add(idKey);
        unique.push(msg);
      }
    }
    return unique.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [messages]);

  // Auto-scroll inside chat container ONLY (never scroll the window/page)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [cleanMessages]);

  if (isLoading && cleanMessages.length === 0) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ height: "40px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "8px" }} />
        <div style={{ height: "40px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "8px" }} />
        <div style={{ height: "40px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "8px" }} />
      </div>
    );
  }

  if (cleanMessages.length === 0) {
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
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "6px" }}>
          {connectionState === "reconnecting" ? "Reconnecting Live Chat Pipe..." : "Waiting for Chat Activity..."}
        </h3>
        <p style={{ fontSize: "13px", color: isDark ? "#64748b" : "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
          Live chat messages from your connected broadcast stream continuously here with heartbeat recovery and deduplication protection.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Header Info & Connection Indicator Bar */}
      <div
        style={{
          padding: "10px 16px",
          borderRadius: "10px",
          background: isDark ? "rgba(13,16,27,0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Status Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 10px",
              borderRadius: "12px",
              background:
                connectionState === "connected"
                  ? "rgba(52,211,153,0.15)"
                  : connectionState === "reconnecting"
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(248,113,113,0.15)",
              border:
                connectionState === "connected"
                  ? "1px solid rgba(52,211,153,0.3)"
                  : connectionState === "reconnecting"
                  ? "1px solid rgba(245,158,11,0.3)"
                  : "1px solid rgba(248,113,113,0.3)",
              color:
                connectionState === "connected"
                  ? (isDark ? "#34d399" : "#059669")
                  : connectionState === "reconnecting"
                  ? (isDark ? "#fbbf24" : "#d97706")
                  : (isDark ? "#f87171" : "#dc2626"),
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            <span style={{ fontSize: "8px" }}>
              {connectionState === "connected" ? "🟢" : connectionState === "reconnecting" ? "🟡" : "🔴"}
            </span>
            <span>
              {connectionState === "connected"
                ? "Live Connected"
                : connectionState === "reconnecting"
                ? `Reconnecting (${reconnectAttempt})...`
                : "Disconnected"}
            </span>
          </div>

          <span style={{ color: isDark ? "#94a3b8" : "#475569", fontWeight: "600" }}>
            {cleanMessages.length} Messages Verified
          </span>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          background: isDark ? "rgba(13,16,27,0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {cleanMessages.map((msg, idx) => (
          <RichChatMessage key={msg.id || idx} message={msg} />
        ))}
      </div>
    </div>
  );
};




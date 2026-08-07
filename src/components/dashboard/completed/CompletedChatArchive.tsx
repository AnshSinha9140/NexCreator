"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { RichChatMessage } from "../chat/RichChatMessage";
import { TimelineNavigator } from "@/lib/timeline/navigator";
import { useApp } from "@/context/AppContext";

export type ChatFilterType =
  | "all"
  | "questions"
  | "vip"
  | "mods"
  | "subscribers"
  | "spam"
  | "funny"
  | "toxic"
  | "commands"
  | "highlighted"
  | "first_time";

interface CompletedChatArchiveProps {
  messages?: any[];
  session?: any;
}

export const CompletedChatArchive: React.FC<CompletedChatArchiveProps> = ({
  messages = [],
  session,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<ChatFilterType>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  const totalCollected = session?.summary?.totalMessagesCollected || messages.length;

  const cardBg = isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff";
  const cardBorder = isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)";
  const cardShadow = isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)";
  const textTitle = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const textBody = isDark ? "#cbd5e1" : "#475569";

  // Auto-scroll chat to target timestamp whenTimelineNavigator seeks or custom event fires
  useEffect(() => {
    const handleScrollTarget = (targetTimestamp: string) => {
      if (!containerRef.current) return;
      const targetElement = containerRef.current.querySelector(`[data-timestamp="${targetTimestamp}"]`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        (targetElement as HTMLElement).style.outline = "2px solid #38bdf8";
        setTimeout(() => {
          (targetElement as HTMLElement).style.outline = "none";
        }, 2000);
      }
    };

    const unsubscribe = TimelineNavigator.subscribe((target) => {
      if (target.timestamp) {
        handleScrollTarget(target.timestamp);
      }
    });

    const customListener = (e: any) => {
      if (e.detail?.timestamp) {
        handleScrollTarget(e.detail.timestamp);
      }
    };
    window.addEventListener("chatScrollToTimestamp", customListener);

    return () => {
      unsubscribe();
      window.removeEventListener("chatScrollToTimestamp", customListener);
    };
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const txt = (msg.message || "").toLowerCase();
      const user = (msg.username || "").toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = txt.includes(query) || user.includes(query);
      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "questions":
          return txt.includes("?") || msg.isQuestion;
        case "vip":
          return msg.isVip || msg.badges?.includes("vip");
        case "mods":
          return msg.isMod || msg.badges?.includes("moderator");
        case "subscribers":
          return msg.isSubscriber || msg.badges?.includes("subscriber");
        case "spam":
          return msg.isSpam;
        case "funny":
          return /lol|lmao|kekw|haha|funny|😂|🤣/.test(txt);
        case "toxic":
          return msg.sentiment < -0.3 || msg.isToxic;
        case "commands":
          return txt.startsWith("!");
        case "highlighted":
          return msg.isHighlighted;
        case "first_time":
          return msg.isFirstTimeChatter;
        default:
          return true;
      }
    });
  }, [messages, searchTerm, activeFilter]);

  if (!messages || messages.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          padding: "48px 24px",
          borderRadius: "16px",
          background: cardBg,
          border: isDark ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid #fecdd3",
          boxShadow: cardShadow,
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>💬</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: isDark ? "#fb7185" : "#e11d48" }}>
          No Persisted Chat Archive Found
        </h3>
        <div style={{ fontSize: "13px", color: textBody, maxWidth: "480px", margin: "0 auto", textAlign: "left", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", padding: "16px", borderRadius: "10px", fontFamily: "monospace", display: "flex", flexDirection: "column", gap: "6px", border: isDark ? "none" : "1px solid #e2e8f0" }}>
          <div>Expected: {totalCollected} messages</div>
          <div>Retrieved: 0 messages</div>
          <div style={{ color: isDark ? "#fb7185" : "#e11d48", fontWeight: "700", marginTop: "4px" }}>Session Integrity Check Failed.</div>
        </div>
      </div>
    );
  }

  const filtersList: { id: ChatFilterType; label: string; icon: string }[] = [
    { id: "all", label: "All", icon: "💬" },
    { id: "questions", label: "Questions", icon: "❓" },
    { id: "vip", label: "VIP", icon: "⭐" },
    { id: "mods", label: "Mods", icon: "🛡️" },
    { id: "subscribers", label: "Subscribers", icon: "💎" },
    { id: "spam", label: "Spam", icon: "⚠️" },
    { id: "funny", label: "Funny", icon: "🤣" },
    { id: "toxic", label: "Toxic", icon: "☣️" },
    { id: "commands", label: "Commands", icon: "🤖" },
    { id: "highlighted", label: "Highlighted", icon: "✨" },
    { id: "first_time", label: "First Time", icon: "🆕" },
  ];

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: "16px",
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "16px" }}>💬</span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              Session Chat Archive
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: textTitle }}>
            Broadcast Messages Record
          </h2>
        </div>

        <div style={{ fontSize: "12px", color: textMuted, fontFamily: "monospace" }}>
          {filteredMessages.length} / {messages.length} Messages Shown
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search by username or message content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            background: cardBg,
            border: cardBorder,
            color: textTitle,
            fontSize: "13px",
            outline: "none",
          }}
        />

        {/* Filter Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {filtersList.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: isActive ? (isDark ? "1px solid rgba(52,211,153,0.4)" : "1px solid #a7f3d0") : cardBorder,
                  background: isActive ? (isDark ? "rgba(52,211,153,0.15)" : "#d1fae5") : (isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9"),
                  color: isActive ? (isDark ? "#34d399" : "#065f46") : textMuted,
                  fontSize: "11px",
                  fontWeight: isActive ? "700" : "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message List */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "650px",
          overflowY: "auto",
          paddingRight: "6px",
        }}
      >
        {filteredMessages.map((msg, idx) => {
          const timestamp = msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            : msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            : "00:00:00";

          return (
            <div
              key={msg.id || idx}
              data-timestamp={timestamp}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "10px",
                background: isDark ? "rgba(13, 16, 27, 0.7)" : "#ffffff",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <RichChatMessage message={msg} />
              </div>
              <button
                title="Click to seek stream video to this message"
                onClick={() => TimelineNavigator.seek(timestamp, `Chat by @${msg.username}`, "Chat Archive")}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "rgba(56, 189, 248, 0.1)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  color: "#38bdf8",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginLeft: "12px",
                  flexShrink: 0,
                }}
              >
                ⏱️ {timestamp}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

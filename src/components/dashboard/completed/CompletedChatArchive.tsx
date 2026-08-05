"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { RichChatMessage } from "../chat/RichChatMessage";
import { TimelineNavigator } from "@/lib/timeline/navigator";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<ChatFilterType>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  const totalCollected = session?.summary?.totalMessagesCollected || messages.length;

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
      const text = (msg.message || "").toLowerCase();
      const username = (msg.username || "").toLowerCase();
      const matchText = text.includes(searchTerm.toLowerCase()) || username.includes(searchTerm.toLowerCase());
      if (!matchText) return false;

      switch (activeFilter) {
        case "questions":
          return msg.isQuestion || text.includes("?");
        case "vip":
          return msg.isVip || msg.isVipUser;
        case "mods":
          return msg.isMod || msg.isModerator;
        case "subscribers":
          return msg.isSubscriber || msg.badges?.some((b: any) => (typeof b === "string" ? b : b.type)?.includes("subscriber"));
        case "spam":
          return msg.isSpam;
        case "funny":
          return text.includes("lol") || text.includes("lmao") || text.includes("haha") || text.includes("kekw") || text.includes("😂") || text.includes("🤣");
        case "toxic":
          return msg.isToxic || msg.toxicityScore > 0.6;
        case "commands":
          return text.startsWith("!");
        case "highlighted":
          return msg.isHighlighted || msg.isFirstTimeChatter || msg.isQuestion || msg.isVip;
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
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>💬</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: "#fb7185" }}>
          No Persisted Chat Archive Found
        </h3>
        <div style={{ fontSize: "13px", color: "#cbd5e1", maxWidth: "480px", margin: "0 auto", textAlign: "left", background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "10px", fontFamily: "monospace", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div>Expected: {totalCollected} messages</div>
          <div>Retrieved: 0 messages</div>
          <div style={{ color: "#fb7185", fontWeight: "700", marginTop: "4px" }}>Session Integrity Check Failed.</div>
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
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "16px" }}>💬</span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              Session Chat Archive
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
            Broadcast Messages Record
          </h2>
        </div>

        <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
          {totalCollected} Messages Captured
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
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#f8fafc",
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
                  border: isActive ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  background: isActive ? "rgba(52,211,153,0.15)" : "rgba(0,0,0,0.3)",
                  color: isActive ? "#34d399" : "#94a3b8",
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
                background: "rgba(13, 16, 27, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
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

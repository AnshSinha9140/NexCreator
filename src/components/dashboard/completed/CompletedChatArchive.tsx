"use client";

import React, { useState, useMemo } from "react";
import { RichChatMessage } from "../chat/RichChatMessage";

interface CompletedChatArchiveProps {
  messages?: any[];
  session?: any;
}

export const CompletedChatArchive: React.FC<CompletedChatArchiveProps> = ({
  messages = [],
  session,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "questions" | "members" | "mods" | "spam">("all");

  const totalCollected = session?.summary?.totalMessagesCollected || messages.length;

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchText = (msg.message || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (msg.username || "").toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchText) return false;

      if (activeFilter === "questions") return msg.isQuestion || (msg.message && msg.message.includes("?"));
      if (activeFilter === "members") return msg.isSubscriber;
      if (activeFilter === "mods") return msg.isMod;
      if (activeFilter === "spam") return msg.isSpam;
      return true;
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
      <div
        style={{
          padding: "16px",
          borderRadius: "14px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
        }}
      >
        {/* Search Box */}
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="Search chat messages or usernames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#f8fafc",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "13px" }}>
            🔍
          </span>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "questions", "members", "mods", "spam"] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setActiveFilter(filterKey)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "capitalize",
                background: activeFilter === filterKey ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.03)",
                border: activeFilter === filterKey ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255,255,255,0.06)",
                color: activeFilter === filterKey ? "#34d399" : "#94a3b8",
                cursor: "pointer",
              }}
            >
              {filterKey}
            </button>
          ))}
        </div>

        {/* Export Button (Disabled) */}
        <button
          disabled
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#475569",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          📥 Export
          <span style={{ fontSize: "8px", padding: "1px 4px", borderRadius: "3px", background: "rgba(255,255,255,0.06)" }}>
            Soon
          </span>
        </button>
      </div>

      {/* Chat Log Feed */}
      <div
        style={{
          padding: "16px",
          borderRadius: "14px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxHeight: "480px",
          overflowY: "auto",
        }}
      >
        {filteredMessages.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
            No chat messages match your active filter.
          </div>
        ) : (
          filteredMessages.map((msg, idx) => (
            <RichChatMessage key={msg.id || idx} message={msg} />
          ))
        )}

      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";

interface InboxMessage {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  timestamp: string;
  group: "Today" | "Yesterday" | "Earlier";
  isRead: boolean;
  priority: "high" | "normal";
}

const INITIAL_MESSAGES: InboxMessage[] = [
  {
    id: "msg_1",
    sender: "AI Creator Manager",
    subject: "Your Post-Broadcast Executive Report is Ready",
    snippet: "Stream finalized with 92 Broadcast Score (A Grade). 3 short-form content assets generated.",
    timestamp: "10:14 AM",
    group: "Today",
    isRead: false,
    priority: "high",
  },
  {
    id: "msg_2",
    sender: "AI Content Strategist",
    subject: "Publishing Strategy Action Item: Short #1",
    snippet: "Recommended upload window: Publish Short #1 ('Community Emote Expression Wave') within 12 hours.",
    timestamp: "09:30 AM",
    group: "Today",
    isRead: false,
    priority: "high",
  },
  {
    id: "msg_3",
    sender: "Intelligence Calibration Engine",
    subject: "Recommendation Effectiveness Improved (+18%)",
    snippet: "Continuous session learning confirmed Q&A recommendation reduced unanswered questions by 43%.",
    timestamp: "Yesterday",
    group: "Yesterday",
    isRead: true,
    priority: "normal",
  },
  {
    id: "msg_4",
    sender: "Highlight Generator",
    subject: "Highlight Review Completed (4 Candidates)",
    snippet: "Auto-detected 4 viral moments including chat velocity peak and emote explosion.",
    timestamp: "July 28",
    group: "Earlier",
    isRead: true,
    priority: "normal",
  },
];

export const CreatorInbox: React.FC = () => {
  const [messages, setMessages] = useState<InboxMessage[]>(INITIAL_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(INITIAL_MESSAGES[0]);

  const markAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "20px", height: "calc(100vh - 180px)", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Inbox List View */}
      <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto" }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          📬 Creator Inbox ({messages.filter((m) => !m.isRead).length} Unread)
        </div>

        {["Today", "Yesterday", "Earlier"].map((group) => {
          const groupMsgs = messages.filter((m) => m.group === group);
          if (groupMsgs.length === 0) return null;

          return (
            <div key={group} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", paddingLeft: "4px" }}>
                {group}
              </div>

              {groupMsgs.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      markAsRead(msg.id);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: isSelected ? "rgba(52, 211, 153, 0.12)" : msg.isRead ? "rgba(255,255,255,0.02)" : "rgba(52, 211, 153, 0.05)",
                      border: isSelected ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                      <span style={{ fontWeight: msg.isRead ? "600" : "800", color: msg.isRead ? "#cbd5e1" : "#f8fafc" }}>
                        {!msg.isRead && "🟢 "} {msg.sender}
                      </span>
                      <span style={{ color: "#64748b" }}>{msg.timestamp}</span>
                    </div>

                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#f8fafc" }}>
                      {msg.subject}
                    </div>

                    <div style={{ fontSize: "11px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {msg.snippet}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Message Reader Pane */}
      <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "16px" }}>
        {selectedMessage ? (
          <>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "11px", color: "#34d399", fontWeight: "800" }}>
                FROM: {selectedMessage.sender}
              </div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#f8fafc" }}>
                {selectedMessage.subject}
              </h2>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Received: {selectedMessage.timestamp} ({selectedMessage.group})
              </div>
            </div>

            <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
              {selectedMessage.snippet}
            </div>

            <div style={{ marginTop: "auto", padding: "12px", borderRadius: "10px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.2)", fontSize: "12px", color: "#34d399", fontWeight: "700" }}>
              💡 Suggested Manager Action: Review and execute pending recommendation strategy.
            </div>
          </>
        ) : (
          <div style={{ color: "#64748b", textAlign: "center", marginTop: "40px" }}>
            Select a message to read.
          </div>
        )}
      </div>
    </div>
  );
};

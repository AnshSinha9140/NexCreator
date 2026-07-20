"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

export const CreatorChatView: React.FC = () => {
  const { currentUser, messages, fetchMessagesForCreator, sendChatMessage } = useApp();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Initial load
    fetchMessagesForCreator(currentUser.email);

    // Poll every 3 seconds to simulate real-time updates
    const interval = setInterval(() => {
      fetchMessagesForCreator(currentUser.email);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage("admin@creatormanager.com", inputText, "creator");
    setInputText("");
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 96px)", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Support Desk</h1>
        <p style={{ color: "var(--text-secondary)" }}>Direct messaging portal with the NexCreator admin team.</p>
      </div>

      <div className="glass-premium" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
        
        {/* Chat Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", borderBottom: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.01)" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 10px var(--accent-green)" }}></div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>NexCreator Admin Support</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Typically replies within minutes</span>
          </div>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg) => {
            const isMe = msg.senderRole === "creator";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                {!isMe && (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-pink) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "white" }}>
                    A
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", maxWidth: "70%" }}>
                  <div
                    style={{
                      padding: "12px 18px",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: isMe
                        ? "linear-gradient(135deg, var(--accent-purple) 0%, #a855f7 100%)"
                        : "var(--bg-input)",
                      color: "white",
                      fontSize: "0.95rem",
                      lineHeight: "1.4",
                      boxShadow: isMe ? "0 4px 12px rgba(189, 92, 255, 0.2)" : "none",
                      border: isMe ? "none" : "1px solid var(--border-color)",
                    }}
                  >
                    {msg.content}
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px", alignSelf: isMe ? "flex-end" : "flex-start" }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: "12px" }}>
              <span style={{ fontSize: "2rem" }}>💬</span>
              <p style={{ fontSize: "0.9rem" }}>No messages yet. Send a query below to start chatting with an admin!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Panel */}
        <form onSubmit={handleSend} style={{ display: "flex", padding: "16px 24px", borderTop: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.01)", gap: "12px" }}>
          <input
            type="text"
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px" }}>
            Send
          </button>
        </form>

      </div>
    </div>
  );
};

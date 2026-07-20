"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

export const AdminChatView: React.FC = () => {
  const { usersList, messages, fetchMessagesForCreator, sendChatMessage } = useApp();
  const [selectedCreatorEmail, setSelectedCreatorEmail] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter out other admin profiles
  const creators = usersList.filter((u) => !u.isAdmin);

  useEffect(() => {
    if (!selectedCreatorEmail) return;

    // Load initial messages
    fetchMessagesForCreator(selectedCreatorEmail);

    // Poll for messages
    const interval = setInterval(() => {
      fetchMessagesForCreator(selectedCreatorEmail);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedCreatorEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCreatorEmail) return;

    sendChatMessage(selectedCreatorEmail, inputText, "admin");
    setInputText("");
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 96px)", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Creator Chat Hub</h1>
        <p style={{ color: "var(--text-secondary)" }}>Direct messaging portal with your registered creators.</p>
      </div>

      <div style={{ display: "flex", flex: 1, gap: "24px", overflow: "hidden", height: "100%" }}>
        
        {/* Left Pane: Creator List */}
        <div className="glass-premium" style={{ width: "300px", display: "flex", flexDirection: "column", padding: "20px", gap: "16px", overflowY: "auto" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Creator DMs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {creators.map((c) => {
              const isSelected = selectedCreatorEmail === c.email;
              return (
                <button
                  key={c.email}
                  onClick={() => setSelectedCreatorEmail(c.email)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    background: isSelected ? "var(--bg-input)" : "rgba(255, 255, 255, 0.02)",
                    border: isSelected ? "1px solid var(--accent-purple)" : "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = "var(--text-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = "var(--border-color)";
                  }}
                >
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "white"
                  }}>
                    {c.email.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.email}
                    </p>
                    <span style={{ fontSize: "0.7rem", color: c.status === "verified" ? "var(--accent-green)" : "var(--accent-yellow)" }}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
            {creators.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>No registered creators yet.</p>
            )}
          </div>
        </div>

        {/* Right Pane: Active Thread */}
        <div className="glass-premium" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {selectedCreatorEmail ? (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", borderBottom: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.01)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  {selectedCreatorEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{selectedCreatorEmail}</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Support Thread</span>
                </div>
              </div>

              {/* Thread */}
              <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {messages.map((msg) => {
                  const isMe = msg.senderRole === "admin";
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
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "var(--text-primary)" }}>
                          {selectedCreatorEmail.charAt(0).toUpperCase()}
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
                  <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No conversation history. Send a hello message to the creator!</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} style={{ display: "flex", padding: "16px 24px", borderTop: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.01)", gap: "12px" }}>
                <input
                  type="text"
                  placeholder={`Reply to ${selectedCreatorEmail}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: "12px 24px" }}>
                  Reply
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: "12px" }}>
              <span style={{ fontSize: "3rem" }}>📬</span>
              <h3 style={{ color: "var(--text-primary)" }}>Select a Conversation</h3>
              <p style={{ fontSize: "0.9rem" }}>Choose a creator from the left pane to view their inquiry thread and chat.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

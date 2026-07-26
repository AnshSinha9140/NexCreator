"use client";

import { useState } from "react";
import HealthBadge from "./HealthBadge";

export interface CreatorVerificationItem {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  kickUrl?: string;
  kickFollowers?: number;
  youtubeUrl?: string;
  youtubeSubscribers?: number;
  status: "pending" | "verified" | "rejected" | "suspended" | "banned" | "changes_requested";
  createdAt: string;
  notes?: string;
  connectedPlatforms: string[];
}

interface VerificationCardProps {
  creator: CreatorVerificationItem;
  onAction: (id: string, action: "approve" | "reject" | "request_changes" | "suspend" | "ban", note?: string) => void;
}

export default function VerificationCard({ creator, onAction }: VerificationCardProps) {
  const [noteText, setNoteText] = useState(creator.notes || "");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActionClick = async (action: "approve" | "reject" | "request_changes" | "suspend" | "ban") => {
    setLoading(true);
    await onAction(creator.id, action, noteText);
    setLoading(false);
  };

  return (
    <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #9333ea, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "#fff", fontSize: "18px",
            border: "1px solid rgba(168,85,247,0.3)"
          }}>
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt={creator.displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
            ) : (
              creator.displayName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>{creator.displayName}</h3>
              <HealthBadge
                status={
                  creator.status === "verified" ? "healthy" :
                  creator.status === "pending" ? "warning" : "offline"
                }
                label={creator.status.toUpperCase()}
              />
            </div>
            <p style={{ margin: 0, fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>{creator.email}</p>
          </div>
        </div>

        <div style={{ textAlign: "right", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div>Applied: <span style={{ color: "#e2e8f0" }}>{new Date(creator.createdAt).toLocaleDateString()}</span></div>
          <div>ID: <span style={{ color: "#c084fc" }}>{creator.id}</span></div>
        </div>
      </div>

      {/* Connected Platforms Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(6,8,16,0.6)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></span>
            <span style={{ fontWeight: 600, color: "#e2e8f0" }}>Kick Channel</span>
          </div>
          {creator.kickUrl ? (
            <a href={creator.kickUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#c084fc", textDecoration: "none", fontFamily: "'JetBrains Mono', monospace", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {creator.kickUrl.replace("https://kick.com/", "@")}
            </a>
          ) : (
            <span style={{ color: "#64748b", fontStyle: "italic" }}>Not Connected</span>
          )}
        </div>

        <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(6,8,16,0.6)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f43f5e" }}></span>
            <span style={{ fontWeight: 600, color: "#e2e8f0" }}>YouTube Channel</span>
          </div>
          {creator.youtubeUrl ? (
            <a href={creator.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#c084fc", textDecoration: "none", fontFamily: "'JetBrains Mono', monospace" }}>
              Channel Link
            </a>
          ) : (
            <span style={{ color: "#64748b", fontStyle: "italic" }}>Not Connected</span>
          )}
        </div>
      </div>

      {/* Notes Input / Display */}
      {showNoteInput ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>Admin Review Notes:</label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add verification notes, missing details, or reason for action..."
            style={{ width: "100%", height: "80px", padding: "12px", background: "rgba(6,8,16,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", outline: "none", resize: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
      ) : (
        creator.notes && (
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#d8b4fe" }}>
            <span style={{ fontWeight: 600, color: "#c084fc" }}>Note: </span>
            {creator.notes}
          </div>
        )
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          style={{ background: "none", border: "none", color: "#64748b", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" }}
        >
          {showNoteInput ? "Hide Notes" : "+ Add Admin Note"}
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          <button
            disabled={loading}
            onClick={() => handleActionClick("request_changes")}
            className="admin-filter-btn"
            style={{ color: "#fbbf24", borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.1)" }}
          >
            Request Changes
          </button>
          <button
            disabled={loading}
            onClick={() => handleActionClick("reject")}
            className="admin-filter-btn"
            style={{ color: "#f87171", borderColor: "rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.1)" }}
          >
            Reject
          </button>
          <button
            disabled={loading}
            onClick={() => handleActionClick("suspend")}
            className="admin-filter-btn"
          >
            Suspend
          </button>
          <button
            disabled={loading}
            onClick={() => handleActionClick("approve")}
            className="btn btn-emerald"
            style={{ fontSize: "11px", padding: "6px 14px", borderRadius: "7px" }}
          >
            Approve Verification
          </button>
        </div>
      </div>
    </div>
  );
}

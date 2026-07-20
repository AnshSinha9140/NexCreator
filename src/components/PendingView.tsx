"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export const PendingView: React.FC = () => {
  const { currentUser, logout } = useApp();

  return (
    <div className="auth-container">
      <div className="auth-card glass-premium animate-fade-in" style={{ maxWidth: "540px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(234, 179, 8, 0.1)", color: "var(--accent-yellow)", marginBottom: "24px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>

        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)" }}>
          Verification Pending
        </h2>
        
        <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
          Thank you for joining Creator Hub! Your account <strong>{currentUser?.email}</strong> has been successfully registered. 
          To protect our platform and sponsors, we verify each channel manually.
        </p>

        <div style={{ background: "var(--bg-sidebar)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", textAlign: "left", marginBottom: "28px" }}>
          <h4 style={{ color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "12px", fontWeight: 600 }}>Submitted Channels:</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <li>
              <span style={{ fontWeight: 600, color: "var(--accent-purple)" }}>YouTube: </span>
              {currentUser?.youtubeLink ? <a href={currentUser.youtubeLink} target="_blank" rel="noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>{currentUser.youtubeLink}</a> : <span style={{ color: "var(--text-muted)" }}>Not Linked</span>}
            </li>
            <li>
              <span style={{ fontWeight: 600, color: "var(--accent-pink)" }}>Twitch: </span>
              {currentUser?.twitchLink ? <a href={currentUser.twitchLink} target="_blank" rel="noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>{currentUser.twitchLink}</a> : <span style={{ color: "var(--text-muted)" }}>Not Linked</span>}
            </li>
            <li>
              <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>Kick: </span>
              {currentUser?.kickLink ? <a href={currentUser.kickLink} target="_blank" rel="noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>{currentUser.kickLink}</a> : <span style={{ color: "var(--text-muted)" }}>Not Linked</span>}
            </li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn btn-secondary" onClick={logout}>
            Log Out
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
            style={{ paddingLeft: "16px", paddingRight: "16px" }}
          >
            Check Approval Status
          </button>
        </div>

        <div style={{ marginTop: "24px", fontSize: "0.85rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <p>
            💡 <strong>Quick Demo Tip:</strong> Log out and sign in using <strong>admin@creatormanager.com</strong> to manually verify this profile from the admin view.
          </p>
        </div>
      </div>
    </div>
  );
};

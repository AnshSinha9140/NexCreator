"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const PendingView: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [checking, setChecking] = useState(false);

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 30%, rgba(168, 85, 247, 0.12) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), #060810",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
        padding: "24px",
        boxSizing: "border-box",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(15, 18, 30, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "40px 36px",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          textAlign: "center",
        }}
      >
        {/* Animated Warning / Clock Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(234, 179, 8, 0.2)",
              color: "#fbbf24",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* Status Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px",
            borderRadius: "99px",
            background: "rgba(234, 179, 8, 0.1)",
            border: "1px solid rgba(234, 179, 8, 0.25)",
            color: "#fbbf24",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fbbf24", boxShadow: "0 0 8px #fbbf24" }} />
          Manual Verification Pending
        </div>

        <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: "12px" }}>
          Verification Pending
        </h2>

        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" }}>
          Thank you for registering with <strong style={{ color: "#f8fafc" }}>NexCreator</strong>! Account{" "}
          <strong style={{ color: "#a855f7" }}>{currentUser?.email}</strong> is under review. To protect our creator network and brand partners, accounts undergo manual channel verification.
        </p>

        {/* Submitted Channels Box */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            textAlign: "left",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Submitted Platform Links
            </span>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Status Check</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* YouTube */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#ef4444", fontWeight: "700" }}>YouTube</span>
              </div>
              {currentUser?.youtubeLink ? (
                <a href={currentUser.youtubeLink} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "12px" }}>
                  View Link ↗
                </a>
              ) : (
                <span style={{ color: "#64748b", fontSize: "12px" }}>Not Linked</span>
              )}
            </div>

            {/* Twitch */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#a855f7", fontWeight: "700" }}>Twitch</span>
              </div>
              {currentUser?.twitchLink ? (
                <a href={currentUser.twitchLink} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "12px" }}>
                  View Link ↗
                </a>
              ) : (
                <span style={{ color: "#64748b", fontSize: "12px" }}>Not Linked</span>
              )}
            </div>

            {/* Kick */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#53fc18", fontWeight: "700" }}>Kick</span>
              </div>
              {currentUser?.kickLink ? (
                <a href={currentUser.kickLink} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "12px" }}>
                  View Link ↗
                </a>
              ) : (
                <span style={{ color: "#64748b", fontSize: "12px" }}>Not Linked</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={logout}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#cbd5e1",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Log Out
          </button>
          <button
            onClick={handleRefresh}
            disabled={checking}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
              border: "none",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: checking ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(168, 85, 247, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {checking ? "Checking..." : "Check Approval Status 🔄"}
          </button>
        </div>

        {/* Admin Tip */}
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "12px", color: "#64748b" }}>
          💡 <strong>Admin Notice:</strong> Log in as an admin (e.g. <strong>admin@nexcreator.com</strong>) to review & approve pending accounts.
        </div>
      </div>
    </div>
  );
};

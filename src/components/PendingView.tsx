"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

export const PendingView: React.FC = () => {
  const { currentUser, setCurrentUser, logout } = useApp();
  const [checking, setChecking] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<"idle" | "polling" | "approved">("idle");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Canonical polling: check /api/auth/session every 8 seconds
  useEffect(() => {
    // Start polling immediately
    const poll = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.user && data.user.status === "verified") {
          // Stop polling immediately
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setPollingStatus("approved");
          // Sync canonical user state & localStorage
          const updatedUser = { ...data.user };
          setCurrentUser(updatedUser);
          localStorage.setItem("cm_current_user", JSON.stringify(updatedUser));
          // Auto-navigate to dashboard after brief celebration moment
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1800);
        }
      } catch (e) {
        // Silently retry
      }
    };

    setPollingStatus("polling");
    poll(); // Immediate first check
    intervalRef.current = setInterval(poll, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [setCurrentUser]);

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.user && data.user.status === "verified") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPollingStatus("approved");
        setCurrentUser(data.user);
        localStorage.setItem("cm_current_user", JSON.stringify(data.user));
        setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
      }
    } catch (e) {}
    finally { setChecking(false); }
  };

  const userPlatforms = (currentUser as any)?.connectedPlatforms || [];
  const ytUrl = currentUser?.youtubeLink || userPlatforms.find((p: any) => p.platform === "youtube")?.channelUrl || "";
  const twUrl = currentUser?.twitchLink || userPlatforms.find((p: any) => p.platform === "twitch")?.channelUrl || "";
  const kcUrl = currentUser?.kickLink || userPlatforms.find((p: any) => p.platform === "kick")?.channelUrl || "";

  // Approved state — show transition screen
  if (pollingStatus === "approved") {
    return (
      <div style={{
        minHeight: "100vh", width: "100vw", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#060810", color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif", position: "fixed", inset: 0, zIndex: 9999,
        flexDirection: "column", gap: "20px", textAlign: "center"
      }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(59,130,246,0.2) 100%)",
          border: "1px solid rgba(16,185,129,0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "32px", boxShadow: "0 12px 40px rgba(16,185,129,0.4)"
        }}>
          🧠
        </div>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", marginBottom: "8px" }}>
            Welcome back.
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.7" }}>
            I&apos;ve finished studying your content.<br />
            <span style={{ color: "#34d399" }}>Let&apos;s begin.</span>
          </div>
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", animation: "pulse 1.5s infinite" }}>
          Opening your workspace…
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", display: "flex", alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at 50% 30%, rgba(168, 85, 247, 0.12) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), #060810",
      color: "#e2e8f0", fontFamily: "'Inter', sans-serif", padding: "24px",
      boxSizing: "border-box", position: "fixed", inset: 0, zIndex: 9999, overflowY: "auto",
    }}>
      <div style={{
        width: "100%", maxWidth: "640px",
        background: "linear-gradient(135deg, rgba(18, 22, 40, 0.95) 0%, rgba(10, 13, 24, 0.98) 100%)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.09)", borderRadius: "28px",
        padding: "48px 40px", boxShadow: "0 32px 80px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        textAlign: "center",
      }}>
        {/* Brain icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)",
            border: "1px solid rgba(168, 85, 247, 0.35)", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 32px rgba(168, 85, 247, 0.25)", color: "#c084fc", fontSize: "28px",
          }}>
            🧠
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 16px", borderRadius: "99px", background: "rgba(168, 85, 247, 0.1)",
          border: "1px solid rgba(168, 85, 247, 0.3)", color: "#c084fc", fontSize: "11px",
          fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%", background: "#10b981",
            boxShadow: "0 0 8px #10b981",
            display: "inline-block"
          }} />
          {pollingStatus === "polling" ? "Watching for Approval…" : "Preparing Workspace"}
        </div>

        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: "12px" }}>
          Preparing Your Workspace
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.7", marginBottom: "24px" }}>
          Thanks. While your account is being verified by our team, I&apos;ll prepare your workspace.
          {pollingStatus === "polling" && (
            <span style={{ display: "block", marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
              Checking automatically every 8 seconds. No refresh needed.
            </span>
          )}
        </p>

        {/* Structured Grid Bullet List */}
        <div style={{
          background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "16px", padding: "20px", marginBottom: "28px", textAlign: "left",
        }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            When you come back, I&apos;ll already understand:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", color: "#e2e8f0" }}>
            {["Your Content Style", "Your Audience Culture", "Your Personal Goals", "Your Growth Direction"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "10px 14px", borderRadius: "10px" }}>
                <span style={{ color: "#38bdf8" }}>•</span>
                <span style={{ fontWeight: "600" }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "14px", fontSize: "13px", color: "#94a3b8", fontStyle: "italic", textAlign: "center" }}>
            See you soon!
          </div>
        </div>

        {/* Submitted Channels Box */}
        <div style={{
          background: "rgba(255, 255, 255, 0.02)", padding: "20px", borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.06)", textAlign: "left", marginBottom: "28px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Submitted Platform Links
            </span>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Status Check</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "YouTube", color: "#ef4444", url: ytUrl },
              { label: "Twitch", color: "#a855f7", url: twUrl },
              { label: "Kick", color: "#53fc18", url: kcUrl },
            ].map(({ label, color, url }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color, fontWeight: "700" }}>{label}</span>
                </div>
                {url ? (
                  <a href={url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "12px" }}>
                    View Link ↗
                  </a>
                ) : (
                  <span style={{ color: "#64748b", fontSize: "12px" }}>Not Linked</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={logout}
            style={{
              flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)", color: "#cbd5e1", fontSize: "13px",
              fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            Log Out
          </button>
          <button
            onClick={handleManualCheck}
            disabled={checking}
            style={{
              flex: 2, padding: "12px", borderRadius: "12px",
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", border: "none",
              color: "#ffffff", fontSize: "13px", fontWeight: "700",
              cursor: checking ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(168, 85, 247, 0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {checking ? "Checking…" : "Check Approval Status 🔄"}
          </button>
        </div>

        {/* Admin Tip */}
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "12px", color: "#64748b" }}>
          💡 <strong>Admin Notice:</strong> Log in as an admin (e.g. <strong>admin@nexcreator.com</strong>) to review &amp; approve pending accounts.
        </div>
      </div>
    </div>
  );
};

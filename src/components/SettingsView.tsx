"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { ConnectedPlatformAccount, VerifiedChannelMeta } from "@/types";
import { ConnectedPlatformManager } from "@/lib/connectedPlatformManager";

export const SettingsView: React.FC = () => {
  const { currentUser, theme } = useApp();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"connections" | "general">("connections");

  // State
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatformAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kick Input & Loading State
  const [kickInput, setKickInput] = useState("");
  const [kickLoading, setKickLoading] = useState(false);
  const [kickError, setKickError] = useState("");
  const [kickSuccess, setKickSuccess] = useState("");

  // YouTube Input & Loading State
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState("");
  const [youtubeSuccess, setYoutubeSuccess] = useState("");

  // Fetch Connected Platforms from Database
  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/platforms/connected");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.platforms)) {
          setConnectedPlatforms(data.platforms);
        }
      }
    } catch (err) {
      console.warn("Failed to load connected platforms:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const kickAccount = connectedPlatforms.find((p) => p.platform === "kick");
  const youtubeAccount = connectedPlatforms.find((p) => p.platform === "youtube");

  // Connect Channel Helper
  const handleConnect = async (platform: "kick" | "youtube", inputUrl: string) => {
    if (!inputUrl.trim()) return;

    if (platform === "kick") {
      setKickLoading(true);
      setKickError("");
      setKickSuccess("");
    } else {
      setYoutubeLoading(true);
      setYoutubeError("");
      setYoutubeSuccess("");
    }

    try {
      const vRes = await fetch("/api/platforms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, channelUrl: inputUrl }),
      });
      const vData = await vRes.json();
      if (!vRes.ok || !vData.success || !vData.verifiedMeta) {
        throw new Error(vData.error?.message || `Could not resolve channel details for ${platform}.`);
      }
      const verifiedMeta: VerifiedChannelMeta = vData.verifiedMeta;

      const res = await fetch("/api/platforms/connected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          platform,
          channelUrl: inputUrl,
          verifiedMeta,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || `Failed to connect ${platform} channel.`;
        throw new Error(errorMsg);
      }

      if (platform === "kick") {
        setKickSuccess(`Successfully connected @${verifiedMeta.username}!`);
        setKickInput("");
      } else {
        setYoutubeSuccess(`Successfully connected ${verifiedMeta.displayName}!`);
        setYoutubeInput("");
      }

      await fetchConnections();
    } catch (err: any) {
      if (platform === "kick") setKickError(err.message || "Verification failed.");
      else setYoutubeError(err.message || "Verification failed.");
    } finally {
      if (platform === "kick") setKickLoading(false);
      else setYoutubeLoading(false);
    }
  };

  // Disconnect Channel Helper
  const handleDisconnect = async (platform: "kick" | "youtube", accountId: string) => {
    if (platform === "kick") {
      setKickLoading(true);
      setKickError("");
      setKickSuccess("");
    } else {
      setYoutubeLoading(true);
      setYoutubeError("");
      setYoutubeSuccess("");
    }

    try {
      const res = await fetch("/api/platforms/connected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          targetId: accountId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || `Failed to disconnect ${platform} channel.`;
        throw new Error(errorMsg);
      }

      if (platform === "kick") setKickSuccess("Disconnected Kick channel.");
      else setYoutubeSuccess("Disconnected YouTube channel.");

      await fetchConnections();
    } catch (err: any) {
      if (platform === "kick") setKickError(err.message || "Failed to disconnect.");
      else setYoutubeError(err.message || "Failed to disconnect.");
    } finally {
      if (platform === "kick") setKickLoading(false);
      else setYoutubeLoading(false);
    }
  };

  // Re-verify / Sync Channel Helper
  const handleReverify = async (platform: "kick" | "youtube", username: string) => {
    if (platform === "kick") {
      setKickLoading(true);
      setKickError("");
      setKickSuccess("");
    } else {
      setYoutubeLoading(true);
      setYoutubeError("");
      setYoutubeSuccess("");
    }

    try {
      const channelUrl = platform === "kick" ? `https://kick.com/${username}` : username;
      const vRes = await fetch("/api/platforms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, channelUrl }),
      });
      const vData = await vRes.json();
      if (!vRes.ok || !vData.success || !vData.verifiedMeta) {
        throw new Error(vData.error?.message || `Could not re-verify channel details for ${platform}.`);
      }
      const verifiedMeta: VerifiedChannelMeta = vData.verifiedMeta;

      const res = await fetch("/api/platforms/connected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          platform,
          channelUrl,
          verifiedMeta,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to sync metadata.");

      if (platform === "kick") {
        setKickSuccess(`Re-synced metadata for @${username}! Chatroom ID: #${verifiedMeta.kickMetadata?.chatroomId || "N/A"}`);
      } else {
        setYoutubeSuccess(`Re-synced metadata for ${username}!`);
      }

      await fetchConnections();
    } catch (err: any) {
      if (platform === "kick") setKickError(err.message || "Failed to re-verify.");
      else setYoutubeError(err.message || "Failed to re-verify.");
    } finally {
      if (platform === "kick") setKickLoading(false);
      else setYoutubeLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "4px" }}>
          Workspace Settings
        </h1>
        <p style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#475569" }}>
          Manage your connected platform channels, verification badges, and monitoring preferences.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e2e8f0", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("connections")}
          className="btn"
          style={{
            padding: "8px 16px",
            fontSize: "12px",
            background: activeTab === "connections" ? (isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)") : "transparent",
            color: activeTab === "connections" ? (isDark ? "#c084fc" : "#9333ea") : (isDark ? "#64748b" : "#64748b"),
            border: activeTab === "connections" ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
          }}
        >
          🔌 Connected Platforms
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className="btn"
          style={{
            padding: "8px 16px",
            fontSize: "12px",
            background: activeTab === "general" ? (isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)") : "transparent",
            color: activeTab === "general" ? (isDark ? "#c084fc" : "#9333ea") : (isDark ? "#64748b" : "#64748b"),
            border: activeTab === "general" ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
          }}
        >
          👤 Account Profile
        </button>
      </div>

      {/* ─── 1. CONNECTED PLATFORMS TAB ──────────────────────────────────── */}
      {activeTab === "connections" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "24px", borderRadius: "16px", background: isDark ? "rgba(13,16,27,0.7)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e2e8f0", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "4px" }}>
              Active Channel Connections
            </h3>
            <p style={{ fontSize: "12px", color: isDark ? "#64748b" : "#64748b", marginBottom: "20px" }}>
              NexCreator connects to your streaming platforms to automatically resolve chat WebSocket bridges, stream status, and live telemetry.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* ─── KICK CARD ─────────────────────────────────────────── */}
              <div
                style={{
                  padding: "18px 22px",
                  borderRadius: "14px",
                  background: kickAccount
                    ? (isDark ? "linear-gradient(135deg, rgba(83, 252, 24, 0.05) 0%, rgba(13, 16, 27, 0.8) 100%)" : "linear-gradient(135deg, rgba(83, 252, 24, 0.04) 0%, #ffffff 100%)")
                    : (isDark ? "rgba(255,255,255,0.02)" : "#f8fafc"),
                  border: kickAccount ? "1px solid rgba(83, 252, 24, 0.3)" : (isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0"),
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(83, 252, 24, 0.15)",
                        border: "1px solid rgba(83, 252, 24, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#53fc18",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {kickAccount?.avatar ? (
                        <img src={kickAccount.avatar} alt={kickAccount.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        "K"
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#f8fafc" : "#0f172a" }}>
                          {kickAccount ? kickAccount.displayName : "Kick.com Connection"}
                        </span>
                        {kickAccount && (
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "rgba(83, 252, 24, 0.15)", color: isDark ? "#53fc18" : "#059669", fontFamily: "monospace" }}>
                            ● CONNECTED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: isDark ? "#64748b" : "#64748b", marginTop: "2px" }}>
                        {kickAccount
                          ? `@${kickAccount.username} · ${kickAccount.followersCount ? `${kickAccount.followersCount.toLocaleString()} followers` : "Connected"}`
                          : "Live Chat Bridge & Sentiment Analysis Enabled"}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Connected Kick Account */}
                  {kickAccount && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => handleReverify("kick", kickAccount.username)}
                        disabled={kickLoading}
                        className="btn btn-secondary"
                        style={{ fontSize: "11px", padding: "6px 12px", opacity: kickLoading ? 0.6 : 1 }}
                        title="Re-verify channel and update chatroomId metadata"
                      >
                        {kickLoading ? "Syncing..." : "🔄 Re-sync Metadata"}
                      </button>
                      <button
                        onClick={() => handleDisconnect("kick", kickAccount.id)}
                        disabled={kickLoading}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "rgba(244, 63, 94, 0.1)",
                          border: "1px solid rgba(244, 63, 94, 0.25)",
                          color: "#fb7185",
                          fontSize: "11px",
                          cursor: kickLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {/* Stored Metadata Details for Connected Kick Channel */}
                {kickAccount && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", background: isDark ? "rgba(0,0,0,0.3)" : "#f1f5f9", border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #e2e8f0", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: isDark ? "#94a3b8" : "#475569", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <span>
                      Chatroom ID:{" "}
                      <strong style={{ color: kickAccount.kickMetadata?.chatroomId ? (isDark ? "#53fc18" : "#059669") : "#fb7185" }}>
                        {kickAccount.kickMetadata?.chatroomId ? `#${kickAccount.kickMetadata.chatroomId}` : "Not stored (click Re-sync Metadata)"}
                      </strong>
                    </span>
                    <span>
                      Last verified: {kickAccount.lastVerifiedAt ? new Date(kickAccount.lastVerifiedAt).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                )}

                {/* Form Input to Connect Kick if NOT Connected */}
                {!kickAccount && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="https://kick.com/username or 8bit_rusherwow"
                        value={kickInput}
                        onChange={(e) => setKickInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: isDark ? "rgba(10,13,24,0.8)" : "#f1f5f9",
                          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                          color: isDark ? "#f8fafc" : "#0f172a",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => handleConnect("kick", kickInput)}
                        disabled={kickLoading || !kickInput.trim()}
                        className="btn btn-primary"
                        style={{ padding: "0 18px", fontSize: "12px", opacity: kickLoading || !kickInput.trim() ? 0.5 : 1 }}
                      >
                        {kickLoading ? "Verifying..." : "Verify & Connect"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {kickError && <span style={{ fontSize: "11px", color: "#fb7185" }}>⚠️ {kickError}</span>}
                {kickSuccess && <span style={{ fontSize: "11px", color: isDark ? "#34d399" : "#059669" }}>✓ {kickSuccess}</span>}
              </div>

              {/* ─── YOUTUBE CARD ──────────────────────────────────────── */}
              <div
                style={{
                  padding: "18px 22px",
                  borderRadius: "14px",
                  background: youtubeAccount
                    ? (isDark ? "linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(13, 16, 27, 0.8) 100%)" : "linear-gradient(135deg, rgba(255, 0, 0, 0.04) 0%, #ffffff 100%)")
                    : (isDark ? "rgba(255,255,255,0.02)" : "#f8fafc"),
                  border: youtubeAccount ? "1px solid rgba(255, 0, 0, 0.3)" : (isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0"),
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(255, 0, 0, 0.15)",
                        border: "1px solid rgba(255, 0, 0, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#ff0000",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {youtubeAccount?.avatar ? (
                        <img src={youtubeAccount.avatar} alt={youtubeAccount.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        "▶"
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#f8fafc" : "#0f172a" }}>
                          {youtubeAccount ? youtubeAccount.displayName : "YouTube Channel Connection"}
                        </span>
                        {youtubeAccount && (
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "rgba(255, 0, 0, 0.15)", color: "#ff4d4d", fontFamily: "monospace" }}>
                            ● CONNECTED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: isDark ? "#64748b" : "#64748b", marginTop: "2px" }}>
                        {youtubeAccount
                          ? `${youtubeAccount.username} · ${youtubeAccount.followersCount ? `${youtubeAccount.followersCount.toLocaleString()} subscribers` : "Connected"}`
                          : "Livestream & VOD Timeline Scraper Enabled"}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Connected YouTube Account */}
                  {youtubeAccount && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => handleDisconnect("youtube", youtubeAccount.id)}
                        disabled={youtubeLoading}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "rgba(244, 63, 94, 0.1)",
                          border: "1px solid rgba(244, 63, 94, 0.25)",
                          color: "#fb7185",
                          fontSize: "11px",
                          cursor: youtubeLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Input to Connect YouTube if NOT Connected */}
                {!youtubeAccount && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@channelname or channel URL"
                        value={youtubeInput}
                        onChange={(e) => setYoutubeInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: isDark ? "rgba(10,13,24,0.8)" : "#f1f5f9",
                          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                          color: isDark ? "#f8fafc" : "#0f172a",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={() => handleConnect("youtube", youtubeInput)}
                        disabled={youtubeLoading || !youtubeInput.trim()}
                        className="btn btn-primary"
                        style={{ padding: "0 18px", fontSize: "12px", opacity: youtubeLoading || !youtubeInput.trim() ? 0.5 : 1 }}
                      >
                        {youtubeLoading ? "Verifying..." : "Verify & Connect"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {youtubeError && <span style={{ fontSize: "11px", color: "#fb7185" }}>⚠️ {youtubeError}</span>}
                {youtubeSuccess && <span style={{ fontSize: "11px", color: isDark ? "#34d399" : "#059669" }}>✓ {youtubeSuccess}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. ACCOUNT PROFILE TAB ──────────────────────────────────────── */}
      {activeTab === "general" && (
        <div style={{ padding: "24px", borderRadius: "16px", background: isDark ? "rgba(13,16,27,0.7)" : "#ffffff", border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e2e8f0", boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "16px" }}>
            Account Details
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: isDark ? "#64748b" : "#64748b", width: "120px" }}>Email:</span>
              <strong style={{ color: isDark ? "#f8fafc" : "#0f172a" }}>{currentUser?.email}</strong>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: isDark ? "#64748b" : "#64748b", width: "120px" }}>Role:</span>
              <strong style={{ color: isDark ? "#c084fc" : "#9333ea", textTransform: "capitalize" }}>{(currentUser as any)?.role || "creator"}</strong>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: isDark ? "#64748b" : "#64748b", width: "120px" }}>Status:</span>
              <span style={{ color: isDark ? "#10b981" : "#059669", fontWeight: "700", fontFamily: "monospace" }}>● VERIFIED</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

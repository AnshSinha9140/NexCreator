"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { ConnectedPlatformAccount, VerifiedChannelMeta } from "@/types";
import { ConnectedPlatformManager } from "@/lib/connectedPlatformManager";

export const SettingsView: React.FC = () => {
  const { currentUser } = useApp();
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
      let clientChatroomId = "";
      if (platform === "kick") {
        try {
          const cleanUser = inputUrl.trim().replace(/^.*kick\.com\//, "").replace("@", "").split("/")[0];
          const chatroomRes = await fetch(`/api/kick/chatroom?slug=${encodeURIComponent(cleanUser.toLowerCase())}`);
          if (chatroomRes.ok) {
            const chatroomData = await chatroomRes.json();
            if (chatroomData?.chatroomId) clientChatroomId = String(chatroomData.chatroomId);
          }
        } catch (e) {}
      }

      // 1. Verify Channel Metadata & resolve chatroomId via Official API
      const verifyRes = await fetch(
        `/api/platforms/verify?platform=${platform}&url=${encodeURIComponent(inputUrl.trim())}${clientChatroomId ? `&chatroomId=${clientChatroomId}` : ""}`
      );
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        const errorMsg =
          typeof verifyData.error === "string"
            ? verifyData.error
            : verifyData.error?.message || `Could not verify ${platform} channel.`;
        throw new Error(errorMsg);
      }

      const verifiedMeta: VerifiedChannelMeta = verifyData.channel;
      const newAccount = ConnectedPlatformManager.createAccountFromVerification(verifiedMeta);

      // 2. Add / Save to Database via Connected Platforms API
      const saveRes = await fetch("/api/platforms/connected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          account: newAccount,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        const saveError =
          typeof saveData.error === "string"
            ? saveData.error
            : saveData.error?.message || "Failed to save connected platform.";
        throw new Error(saveError);
      }

      if (platform === "kick") {
        setKickSuccess(`Successfully connected @${newAccount.username}!`);
        setKickInput("");
      } else {
        setYoutubeSuccess(`Successfully connected ${newAccount.displayName}!`);
        setYoutubeInput("");
      }

      await fetchConnections();
    } catch (err: any) {
      if (platform === "kick") setKickError(err.message || "Failed to connect Kick channel.");
      else setYoutubeError(err.message || "Failed to connect YouTube channel.");
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

  // Re-verify / Sync Channel Helper (Populates/Updates chatroomId without disconnecting)
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
      let clientChatroomId = "";
      if (platform === "kick") {
        try {
          const cleanUser = username.trim().replace(/^.*kick\.com\//, "").replace("@", "").split("/")[0];
          const chatroomRes = await fetch(`/api/kick/chatroom?slug=${encodeURIComponent(cleanUser.toLowerCase())}`);
          if (chatroomRes.ok) {
            const chatroomData = await chatroomRes.json();
            if (chatroomData?.chatroomId) clientChatroomId = String(chatroomData.chatroomId);
          }
        } catch (e) {}
      }

      const verifyRes = await fetch(
        `/api/platforms/verify?platform=${platform}&username=${encodeURIComponent(username)}${clientChatroomId ? `&chatroomId=${clientChatroomId}` : ""}`
      );
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        const errorMsg =
          typeof verifyData.error === "string"
            ? verifyData.error
            : verifyData.error?.message || `Could not re-verify ${platform} channel.`;
        throw new Error(errorMsg);
      }

      const verifiedMeta: VerifiedChannelMeta = verifyData.channel;
      const updatedAccount = ConnectedPlatformManager.createAccountFromVerification(verifiedMeta);

      const saveRes = await fetch("/api/platforms/connected", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          platform,
          account: updatedAccount,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        const saveError =
          typeof saveData.error === "string"
            ? saveData.error
            : saveData.error?.message || "Failed to update platform verification.";
        throw new Error(saveError);
      }

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
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", marginBottom: "4px" }}>
          Workspace Settings
        </h1>
        <p style={{ fontSize: "13px", color: "#94a3b8" }}>
          Manage your connected platform channels, verification badges, and monitoring preferences.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("connections")}
          className="btn"
          style={{
            padding: "8px 16px",
            fontSize: "12px",
            background: activeTab === "connections" ? "rgba(168,85,247,0.15)" : "transparent",
            color: activeTab === "connections" ? "#c084fc" : "#64748b",
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
            background: activeTab === "general" ? "rgba(168,85,247,0.15)" : "transparent",
            color: activeTab === "general" ? "#c084fc" : "#64748b",
            border: activeTab === "general" ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
          }}
        >
          👤 Account Profile
        </button>
      </div>

      {/* ─── 1. CONNECTED PLATFORMS TAB ──────────────────────────────────── */}
      {activeTab === "connections" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(13,16,27,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>
              Active Channel Connections
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
              NexCreator connects to your streaming platforms to automatically resolve chat WebSocket bridges, stream status, and live telemetry.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* ─── KICK CARD ─────────────────────────────────────────── */}
              <div
                style={{
                  padding: "18px 22px",
                  borderRadius: "14px",
                  background: kickAccount ? "linear-gradient(135deg, rgba(83, 252, 24, 0.05) 0%, rgba(13, 16, 27, 0.8) 100%)" : "rgba(255,255,255,0.02)",
                  border: kickAccount ? "1px solid rgba(83, 252, 24, 0.3)" : "1px solid rgba(255,255,255,0.06)",
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
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
                          {kickAccount ? kickAccount.displayName : "Kick.com Connection"}
                        </span>
                        {kickAccount && (
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "rgba(83, 252, 24, 0.15)", color: "#53fc18", fontFamily: "monospace" }}>
                            ● CONNECTED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
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
                  <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <span>
                      Chatroom ID:{" "}
                      <strong style={{ color: kickAccount.kickMetadata?.chatroomId ? "#53fc18" : "#fb7185" }}>
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
                        style={{ flex: 1 }}
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
                {kickSuccess && <span style={{ fontSize: "11px", color: "#34d399" }}>✓ {kickSuccess}</span>}
              </div>

              {/* ─── YOUTUBE CARD ──────────────────────────────────────── */}
              <div
                style={{
                  padding: "18px 22px",
                  borderRadius: "14px",
                  background: youtubeAccount ? "linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(13, 16, 27, 0.8) 100%)" : "rgba(255,255,255,0.02)",
                  border: youtubeAccount ? "1px solid rgba(255, 0, 0, 0.3)" : "1px solid rgba(255,255,255,0.06)",
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
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
                          {youtubeAccount ? youtubeAccount.displayName : "YouTube Channel Connection"}
                        </span>
                        {youtubeAccount && (
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "rgba(255, 0, 0, 0.15)", color: "#ff4d4d", fontFamily: "monospace" }}>
                            ● CONNECTED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
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
                        style={{ flex: 1 }}
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
                {youtubeSuccess && <span style={{ fontSize: "11px", color: "#34d399" }}>✓ {youtubeSuccess}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. ACCOUNT PROFILE TAB ──────────────────────────────────────── */}
      {activeTab === "general" && (
        <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(13,16,27,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
            Account Details
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: "#64748b", width: "120px" }}>Email:</span>
              <strong style={{ color: "#f8fafc" }}>{currentUser?.email}</strong>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: "#64748b", width: "120px" }}>Role:</span>
              <strong style={{ color: "#c084fc", textTransform: "capitalize" }}>{(currentUser as any)?.role || "creator"}</strong>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <span style={{ color: "#64748b", width: "120px" }}>Status:</span>
              <span style={{ color: "#10b981", fontWeight: "700", fontFamily: "monospace" }}>● VERIFIED</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

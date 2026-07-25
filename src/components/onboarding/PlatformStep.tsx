"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";
import { VerifiedChannelMeta, ConnectedPlatformAccount } from "@/types";
import { ConnectedPlatformManager } from "@/lib/connectedPlatformManager";

export const PlatformStep: React.FC = () => {
  const { state, updateConnectedPlatforms } = useOnboarding();
  const platforms = state.connectedPlatforms;
  const selectedPlatforms = state.platformSelection.selectedPlatforms;

  const verifiedKick = platforms.verifiedChannels?.kick;
  const verifiedYoutube = platforms.verifiedChannels?.youtube;

  // Local state for input fields and verification statuses
  const [kickInput, setKickInput] = useState(platforms.kickUrl || "");
  const [youtubeInput, setYoutubeInput] = useState(platforms.youtubeUrl || "");

  const [kickLoading, setKickLoading] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  const [kickError, setKickError] = useState("");
  const [youtubeError, setYoutubeError] = useState("");

  // Verification Helper via ConnectedPlatformManager
  const verifyChannel = async (platform: "kick" | "youtube", inputUrl: string) => {
    if (!inputUrl.trim()) return;

    if (platform === "kick") {
      setKickLoading(true);
      setKickError("");
    } else {
      setYoutubeLoading(true);
      setYoutubeError("");
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

      const res = await fetch(`/api/platforms/verify?platform=${platform}&url=${encodeURIComponent(inputUrl.trim())}${clientChatroomId ? `&chatroomId=${clientChatroomId}` : ""}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = typeof data.error === "string" ? data.error : data.error?.message || `Could not verify ${platform} channel.`;
        throw new Error(errorMsg);
      }

      const verifiedMeta: VerifiedChannelMeta = {
        ...data.channel,
        // Ensure kickMetadata (chatroomId, channelId, slug) is included from the API response
        kickMetadata: data.channel.kickMetadata,
      };

      // 1. Transform verified metadata into ConnectedPlatformAccount model entity
      const newAccount = ConnectedPlatformManager.createAccountFromVerification(verifiedMeta);

      // 2. Validate and add to platformsList using ConnectedPlatformManager logic
      const currentList = platforms.platformsList || [];
      const updatedList = ConnectedPlatformManager.addPlatform(currentList, newAccount);

      // 3. Update onboarding context state
      updateConnectedPlatforms({
        [platform === "kick" ? "kickUrl" : "youtubeUrl"]: verifiedMeta.channelUrl,
        platformsList: updatedList,
        verifiedChannels: {
          ...platforms.verifiedChannels,
          [platform]: verifiedMeta,
        },
      });
    } catch (err: any) {
      if (platform === "kick") setKickError(err.message || "Failed to verify Kick channel.");
      else setYoutubeError(err.message || "Failed to verify YouTube channel.");
    } finally {
      if (platform === "kick") setKickLoading(false);
      else setYoutubeLoading(false);
    }
  };

  const disconnectChannel = (platform: "kick" | "youtube") => {
    if (platform === "kick") {
      setKickInput("");
      setKickError("");
    } else {
      setYoutubeInput("");
      setYoutubeError("");
    }

    const currentList = platforms.platformsList || [];
    const updatedList = ConnectedPlatformManager.removePlatform(currentList, platform);

    updateConnectedPlatforms({
      [platform === "kick" ? "kickUrl" : "youtubeUrl"]: "",
      platformsList: updatedList,
      verifiedChannels: {
        ...platforms.verifiedChannels,
        [platform]: null,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* Informational Banner */}
      <div
        style={{
          padding: "14px 18px",
          borderRadius: "12px",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#34d399",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>⚡</span>
        <span>Enter your channel URL or username to verify public metadata and link your stream.</span>
      </div>

      {/* ─── KICK SECTION ─────────────────────────────────────────────── */}
      {selectedPlatforms.includes("kick") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>
            <span style={{ color: "#53fc18", fontWeight: "900" }}>K</span> Kick.com Channel
          </label>

          <AnimatePresence mode="wait">
            {verifiedKick ? (
              /* Verified Success Card */
              <motion.div
                key="verified-kick"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                style={{
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(83, 252, 24, 0.08) 0%, rgba(13, 16, 27, 0.8) 100%)",
                  border: "1px solid rgba(83, 252, 24, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(83, 252, 24, 0.15)",
                      border: "1px solid rgba(83, 252, 24, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#53fc18",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {verifiedKick.avatar ? (
                      <img src={verifiedKick.avatar} alt={verifiedKick.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "K"
                    )}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>{verifiedKick.displayName}</span>
                      <span style={{ fontSize: "11px", color: "#53fc18", fontWeight: "bold" }}>✓ Connected</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                      @{verifiedKick.username}
                      {verifiedKick.followersCount !== undefined && verifiedKick.followersCount > 0 && (
                        <span> · {verifiedKick.followersCount.toLocaleString()} followers</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => disconnectChannel("kick")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#94a3b8",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => disconnectChannel("kick")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.25)",
                      color: "#fb7185",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Verification Input Card */
              <motion.div key="input-kick" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="https://kick.com/username or 8bit_goldy"
                    value={kickInput}
                    onChange={(e) => setKickInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => verifyChannel("kick", kickInput)}
                    disabled={kickLoading || !kickInput.trim()}
                    className="btn btn-primary"
                    style={{
                      padding: "0 20px",
                      fontSize: "12px",
                      opacity: kickLoading || !kickInput.trim() ? 0.5 : 1,
                    }}
                  >
                    {kickLoading ? "Verifying..." : "Verify Channel"}
                  </button>
                </div>
                {kickError && (
                  <span style={{ fontSize: "11px", color: "#fb7185", display: "block" }}>
                    ⚠️ {kickError}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ─── YOUTUBE SECTION ───────────────────────────────────────────── */}
      {selectedPlatforms.includes("youtube") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>
            <span style={{ color: "#ff0000" }}>▶</span> YouTube Channel
          </label>

          <AnimatePresence mode="wait">
            {verifiedYoutube ? (
              /* Verified Success Card */
              <motion.div
                key="verified-yt"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                style={{
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(255, 0, 0, 0.08) 0%, rgba(13, 16, 27, 0.8) 100%)",
                  border: "1px solid rgba(255, 0, 0, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(255, 0, 0, 0.15)",
                      border: "1px solid rgba(255, 0, 0, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#ff0000",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {verifiedYoutube.avatar ? (
                      <img src={verifiedYoutube.avatar} alt={verifiedYoutube.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "▶"
                    )}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>{verifiedYoutube.displayName}</span>
                      <span style={{ fontSize: "11px", color: "#ff4d4d", fontWeight: "bold" }}>✓ Connected</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                      {verifiedYoutube.username}
                      {verifiedYoutube.followersCount !== undefined && verifiedYoutube.followersCount > 0 && (
                        <span> · {verifiedYoutube.followersCount.toLocaleString()} subscribers</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => disconnectChannel("youtube")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#94a3b8",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => disconnectChannel("youtube")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.25)",
                      color: "#fb7185",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Verification Input Card */
              <motion.div key="input-yt" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@channelname"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => verifyChannel("youtube", youtubeInput)}
                    disabled={youtubeLoading || !youtubeInput.trim()}
                    className="btn btn-primary"
                    style={{
                      padding: "0 20px",
                      fontSize: "12px",
                      opacity: youtubeLoading || !youtubeInput.trim() ? 0.5 : 1,
                    }}
                  >
                    {youtubeLoading ? "Verifying..." : "Verify Channel"}
                  </button>
                </div>
                {youtubeError && (
                  <span style={{ fontSize: "11px", color: "#fb7185", display: "block" }}>
                    ⚠️ {youtubeError}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

interface Highlight {
  time: string;
  reason: string;
}

interface AnalysisReport {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  vibe: string;
  questions: string[];
  highlights: Highlight[];
  strategicTips: string[];
}

interface AnalysisJob {
  id: string;
  creatorEmail: string;
  platform: "youtube" | "kick" | "kick_live";
  videoId: string;
  videoUrl: string;
  title: string;
  thumbnailUrl: string;
  status: "QUEUED" | "SCRAPING" | "ANALYZING" | "COMPLETED" | "FAILED";
  progressMessage: string;
  error?: string;
  analysis?: AnalysisReport;
  createdAt: string;
}

export const VideoAnalyzerView: React.FC = () => {
  const { currentUser, activeLiveJob, latestCompletedJobId, startLiveKickMonitoring, stopLiveKickMonitoring } = useApp();
  const creatorEmail = currentUser?.email || "guest@creator.com";

  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<AnalysisJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<{ used: number; max: number; remaining: number }>({ used: 0, max: 2, remaining: 2 });
  const [history, setHistory] = useState<AnalysisJob[]>([]);

  // 1. Fetch Creator Quota and History on mount
  const fetchQuotaAndHistory = async () => {
    try {
      const res = await fetch(`/api/analysis?creatorEmail=${encodeURIComponent(creatorEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setQuotaInfo({
          used: data.quotaUsed || 0,
          max: data.maxDailyQuota || 2,
          remaining: data.remainingQuota ?? 2
        });
        setHistory(data.history || []);
      }
    } catch (err) {
      console.warn("Failed to fetch quota history:", err);
    }
  };

  // Immediate Job Fetcher
  const fetchJobImmediate = async (jobId: string) => {
    try {
      const res = await fetch(`/api/analysis?jobId=${jobId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.job) {
          setActiveJob(data.job);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch job immediately:", err);
    }
  };

  useEffect(() => {
    fetchQuotaAndHistory();
  }, [creatorEmail]);

  // Listen to latestCompletedJobId from global context and fetch IMMEDIATELY
  useEffect(() => {
    if (latestCompletedJobId) {
      setActiveJobId(latestCompletedJobId);
      fetchJobImmediate(latestCompletedJobId);
      fetchQuotaAndHistory();
    }
  }, [latestCompletedJobId]);

  // Dev Reset Quota helper
  const handleResetQuota = async () => {
    try {
      const res = await fetch(`/api/analysis?creatorEmail=${encodeURIComponent(creatorEmail)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        if (activeLiveJob) {
          await stopLiveKickMonitoring();
        }
        setActiveJob(null);
        setActiveJobId(null);
        setError(null);
        fetchQuotaAndHistory();
      }
    } catch (err) {
      console.error("Failed to reset quota:", err);
    }
  };

  // Manual Stop & Generate Report handler for Live Kick Monitoring
  const handleStopAndGenerateReport = async () => {
    setLoading(true);
    setError(null);
    const result = await stopLiveKickMonitoring();
    if (result?.error) {
      setError(result.error);
    } else if (result?.jobId) {
      setActiveJobId(result.jobId);
      await fetchJobImmediate(result.jobId);
    }
    setLoading(false);
    fetchQuotaAndHistory();
  };

  // 2. Poll Active Job Status (Every 5 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeJobId && activeJob?.status !== "COMPLETED" && activeJob?.status !== "FAILED") {
      interval = setInterval(async () => {
        await fetchJobImmediate(activeJobId);
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [activeJobId, activeJob?.status]);

  // Parse Kick Channel or Video ID
  const parseKickUrl = (url: string): { type: "video" | "channel" | "numeric_id"; value: string } | null => {
    const trimmed = url.trim().replace(/\/$/, "");
    if (/^\d+$/.test(trimmed)) {
      return { type: "numeric_id", value: trimmed };
    }
    if (trimmed.includes("kick.com/video/") || trimmed.includes("kick.com/videos/")) {
      const parts = trimmed.split("/video");
      const videoId = parts[1]?.replace(/^\s*s?\//, "")?.split("/")[0]?.split("?")[0];
      if (videoId) return { type: "video", value: videoId };
    } else if (trimmed.includes("kick.com/")) {
      const username = trimmed.split("kick.com/")[1]?.split("/")[0]?.split("?")[0];
      if (username && !["video", "videos", "categories", "search"].includes(username.toLowerCase())) {
        return { type: "channel", value: username };
      }
    }
    return null;
  };

  // Multi-proxy resilient fetch helper
  const fetchWithCorsProxy = async (targetUrl: string) => {
    try {
      const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) {
        const wrapper = await res.json();
        return JSON.parse(wrapper.contents);
      }
    } catch (e) {}

    return null;
  };

  const handleQueueAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setLoading(true);
    setError(null);

    const isKick = videoUrl.toLowerCase().includes("kick.com") || /^\d+$/.test(videoUrl.trim());

    try {
      if (isKick) {
        const parsedKick = parseKickUrl(videoUrl);
        if (!parsedKick) {
          throw new Error("Invalid Kick link. Enter a channel ('kick.com/username'), video ('kick.com/video/UUID'), or Chatroom ID.");
        }

        if (parsedKick.type === "channel") {
          // Global Live Stream Listener (Persistent across tabs!)
          await startLiveKickMonitoring(parsedKick.value);
          setLoading(false);
        } else if (parsedKick.type === "numeric_id") {
          await startLiveKickMonitoring(`chatroom_${parsedKick.value}`, parsedKick.value);
          setLoading(false);
        } else {
          // Kick VOD Flow
          const detailsData = await fetchWithCorsProxy(`https://kick.com/api/v2/video/${parsedKick.value}`);
          const commentsData = await fetchWithCorsProxy(`https://kick.com/api/v2/video/${parsedKick.value}/comments`);

          const rawComments = commentsData?.comments || commentsData?.data || [];
          if (rawComments.length === 0) {
            throw new Error("🛡️ Kick's Cloudflare firewall restricts automated VOD chat crawling. Paste a LIVE channel link ('kick.com/username') or YouTube link for Deep AI Analysis.");
          }

          const formattedComments = rawComments.map((c: any) => {
            const totalMs = c.video_timestamp || 0;
            const totalSeconds = Math.floor(totalMs / 1000);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            const timeStr = `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            return `${c.user?.username || "user"} [${timeStr}]: ${c.content}`;
          });

          const title = detailsData?.title || detailsData?.session?.title || `Kick Stream VOD (${parsedKick.value.substring(0, 8)})`;
          const thumbnailUrl = detailsData?.thumbnail?.url || "";

          const res = await fetch("/api/analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform: "kick",
              creatorEmail,
              videoId: parsedKick.value,
              videoUrl: videoUrl.trim(),
              title,
              thumbnailUrl,
              comments: formattedComments
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to queue Kick analysis");

          setActiveJobId(data.jobId);
          setActiveJob({
            id: data.jobId,
            creatorEmail,
            platform: "kick",
            videoId: parsedKick.value,
            videoUrl,
            title,
            thumbnailUrl,
            status: "ANALYZING",
            progressMessage: "Processing Kick chat replay with Gemini 3.5 Flash...",
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // YouTube Flow
        const res = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoUrl: videoUrl.trim(),
            creatorEmail
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to queue YouTube analysis");

        setActiveJobId(data.jobId);
        setActiveJob({
          id: data.jobId,
          creatorEmail,
          platform: "youtube",
          videoId: "",
          videoUrl,
          title: "YouTube Video Analysis",
          thumbnailUrl: "",
          status: "QUEUED",
          progressMessage: "Job queued! Starting 11-hour Map-Reduce timeline pipeline...",
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to queue analysis. Please try again.");
      setLoading(false);
    }
  };

  const parseTimeToSeconds = (timeStr: string) => {
    const cleanTime = timeStr.replace(/[\[\]]/g, "").trim();
    const parts = cleanTime.split(":").map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const getPlayLink = (platform: "youtube" | "kick" | "kick_live", videoId: string, timeStr: string) => {
    const seconds = parseTimeToSeconds(timeStr);
    if (platform === "kick" || platform === "kick_live") {
      return `https://kick.com/${videoId}`;
    }
    return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
  };

  // Determine current active job (Global Live Job or Local Async Job)
  const currentDisplayJob = activeLiveJob || activeJob;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header with Quota Counter Badge & Reset Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Deep AI Stream Analyzer</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Full timeline analysis for YouTube & 2-minute live WebSocket heartbeat for Kick streams.
          </p>
        </div>

        {/* Daily Quota Counter Badge & Reset Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="glass-premium" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "1.2rem" }}>🎯</span>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                Daily Creator Quota
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: quotaInfo.remaining > 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                {quotaInfo.used} / {quotaInfo.max} Videos Used Today
              </div>
            </div>
          </div>

          <button
            onClick={handleResetQuota}
            title="Reset your daily testing quota"
            className="btn btn-secondary"
            style={{ padding: "12px 16px", fontSize: "0.85rem", borderRadius: "var(--radius-md)" }}
          >
            🔄 Reset Quota
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-premium" style={{ padding: "28px" }}>
        <form onSubmit={handleQueueAnalysis} style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Paste YouTube Video URL or Live Kick Channel (e.g., https://kick.com/8bitheadflicker)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={loading || !!activeLiveJob || quotaInfo.remaining <= 0}
            required
            style={{
              flex: 1,
              minWidth: "280px",
              padding: "14px 20px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              outline: "none"
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !!activeLiveJob || quotaInfo.remaining <= 0}
            style={{ minWidth: "180px" }}
          >
            {loading ? "⏳ Monitoring..." : activeLiveJob ? "🔴 Live Session Active" : quotaInfo.remaining <= 0 ? "🚫 Quota Reached" : "🚀 Queue Deep Scan"}
          </button>
        </form>
        {error && (
          <div style={{ color: "var(--accent-red)", marginTop: "12px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>⚠️</span> {error}
          </div>
        )}
      </div>

      {/* Persistent Active Stream Card */}
      {currentDisplayJob && currentDisplayJob.status !== "COMPLETED" && (
        <div className="glass-premium animate-pulse" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px", borderLeft: "4px solid var(--accent-purple)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span className="badge badge-verified" style={{ background: "rgba(189, 92, 255, 0.15)", color: "var(--accent-purple)", borderColor: "rgba(189, 92, 255, 0.25)" }}>
              {activeLiveJob ? "🔴 Live Stream WebSocket Active (Multi-Tasking Supported)" : "⚙️ Async Background Worker Active"}
            </span>

            {activeLiveJob && (
              <button
                onClick={handleStopAndGenerateReport}
                className="btn btn-secondary"
                disabled={loading}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(255, 75, 75, 0.15)",
                  color: "var(--accent-red)",
                  borderColor: "rgba(255, 75, 75, 0.3)",
                  fontWeight: 700
                }}
              >
                🛑 Stop Listening & Generate Report
              </button>
            )}

            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {activeLiveJob ? "Evaluating live chat every 2 mins" : "Auto-polling status every 5s"}
            </span>
          </div>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {currentDisplayJob.title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "8px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "var(--accent-purple)", animation: "spin 1s linear infinite" }}></div>
            <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-purple)" }}>
              {currentDisplayJob.progressMessage || "Processing stream..."}
            </p>
          </div>
          
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            ✨ Multi-tasking active! You can navigate to Support Desk, Tasks, Campaigns, or CRM—the live listener will keep running in the background!
          </p>
        </div>
      )}

      {/* Completed Report Display */}
      {activeJob && activeJob.status === "COMPLETED" && activeJob.analysis && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Metadata Header Card */}
          <div className="glass-premium" style={{ padding: "28px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
            {activeJob.thumbnailUrl ? (
              <div style={{ width: "220px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                <img src={activeJob.thumbnailUrl} alt="Video Preview" style={{ width: "100%", height: "124px", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: "220px", height: "124px", borderRadius: "var(--radius-md)", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)", fontSize: "2rem" }}>
                {activeJob.platform.includes("kick") ? "🎮" : "📹"}
              </div>
            )}
            <div style={{ flex: 1, minWidth: "260px" }}>
              <span className="badge badge-verified" style={{ marginBottom: "12px", background: "rgba(189, 92, 255, 0.15)", color: "var(--accent-purple)", borderColor: "rgba(189, 92, 255, 0.25)" }}>
                ✅ Gemini 3.5 Flash Live Stream Report
              </span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "10px" }}>
                {activeJob.title}
              </h2>
              <a
                href={activeJob.platform.includes("kick") ? `https://kick.com/${activeJob.videoId}` : `https://www.youtube.com/watch?v=${activeJob.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.85rem", color: "var(--accent-blue)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <span>🔗</span> Open Channel / VOD
              </a>
            </div>
          </div>

          {/* Vibe and Sentiment Split */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            
            {/* Sentiment Meter Card */}
            <div className="glass-premium" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>
                📊 Audience Sentiment Split
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                    <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>Positive / Hype</span>
                    <strong style={{ color: "var(--text-primary)" }}>{activeJob.analysis.sentiment.positive}%</strong>
                  </div>
                  <div style={{ height: "8px", background: "var(--bg-input)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ width: `${activeJob.analysis.sentiment.positive}%`, height: "100%", background: "var(--accent-green)", borderRadius: "var(--radius-full)" }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                    <span style={{ color: "var(--accent-yellow)", fontWeight: 600 }}>Neutral</span>
                    <strong style={{ color: "var(--text-primary)" }}>{activeJob.analysis.sentiment.neutral}%</strong>
                  </div>
                  <div style={{ height: "8px", background: "var(--bg-input)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ width: `${activeJob.analysis.sentiment.neutral}%`, height: "100%", background: "var(--accent-yellow)", borderRadius: "var(--radius-full)" }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                    <span style={{ color: "var(--accent-red)", fontWeight: 600 }}>Critical / Negative</span>
                    <strong style={{ color: "var(--text-primary)" }}>{activeJob.analysis.sentiment.negative}%</strong>
                  </div>
                  <div style={{ height: "8px", background: "var(--bg-input)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ width: `${activeJob.analysis.sentiment.negative}%`, height: "100%", background: "var(--accent-red)", borderRadius: "var(--radius-full)" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Vibe Card */}
            <div className="glass-premium" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
                💬 Chat / Viewer Vibe
              </h3>
              <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--accent-purple)", lineHeight: "1.4" }}>
                "{activeJob.analysis.vibe}"
              </p>
            </div>

          </div>

          {/* Highlights Timeline & Top Questions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
            
            {/* Highlights Timeline */}
            <div className="glass-premium" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>
                🎬 Full Stream Timeline Highlights (Click to Jump)
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {activeJob.analysis.highlights && activeJob.analysis.highlights.length > 0 ? (
                  activeJob.analysis.highlights.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                      <a
                        href={getPlayLink(activeJob.platform, activeJob.videoId, h.time)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          borderRadius: "8px",
                          color: "var(--accent-purple)",
                          borderColor: "rgba(189, 92, 255, 0.2)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontWeight: 700
                        }}
                      >
                        ⏱️ {h.time}
                      </a>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4", paddingTop: "4px" }}>
                        {h.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No highlights detected in stream.</p>
                )}
              </div>
            </div>

            {/* Viewer Q&A Drawer */}
            <div className="glass-premium" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>
                🤔 Top Audience Questions
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activeJob.analysis.questions && activeJob.analysis.questions.length > 0 ? (
                  activeJob.analysis.questions.map((q, i) => (
                    <div key={i} style={{ padding: "12px 16px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", display: "flex", gap: "10px" }}>
                      <span style={{ fontSize: "1.1rem" }}>❓</span>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, lineHeight: "1.4" }}>
                        {q}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No questions detected in stream.</p>
                )}
              </div>
            </div>

          </div>

          {/* AI Strategic Actionable Tips */}
          {activeJob.analysis.strategicTips && activeJob.analysis.strategicTips.length > 0 && (
            <div className="glass-premium" style={{ padding: "28px", borderLeft: "4px solid var(--accent-pink)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>💡</span> Actionable AI Strategic Tips
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {activeJob.analysis.strategicTips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255, 94, 180, 0.15)", color: "var(--accent-pink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0, marginTop: "2px" }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Creator Past Reports History Drawer */}
      {history.length > 0 && (
        <div className="glass-premium" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>
            📜 Your Past Stream Analysis Reports
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {history.map((pastJob) => (
              <div
                key={pastJob.id}
                onClick={() => {
                  setActiveJobId(pastJob.id);
                  fetchJobImmediate(pastJob.id);
                }}
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  background: activeJobId === pastJob.id ? "rgba(189, 92, 255, 0.1)" : "var(--bg-input)",
                  border: "1px solid " + (activeJobId === pastJob.id ? "var(--accent-purple)" : "var(--border-color)"),
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px"
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                    {pastJob.title}
                  </h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Analyzed on {new Date(pastJob.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                  View Report
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

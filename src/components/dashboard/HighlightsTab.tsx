"use client";

import React, { useState, useEffect } from "react";
import { HighlightCandidate } from "@/lib/highlights/generator";

interface HighlightsTabProps {
  sessionId?: string | null;
}

export const HighlightsTab: React.FC<HighlightsTabProps> = ({ sessionId }) => {
  const [highlights, setHighlights] = useState<HighlightCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchHighlights = async () => {
      try {
        const res = await fetch(`/api/highlights?sessionId=${encodeURIComponent(sessionId)}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success && Array.isArray(data.highlights)) {
            setHighlights(data.highlights);
          }
        }
      } catch (e) {
        console.warn("[HighlightsTab] Fetch error:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHighlights();
    const timer = setInterval(fetchHighlights, 10000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontFamily: "'Inter', sans-serif" }}>
        No active monitoring session selected.
      </div>
    );
  }

  if (isLoading && highlights.length === 0) {
    return (
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "80px", borderRadius: "12px", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ height: "80px", borderRadius: "12px", background: "rgba(255,255,255,0.03)" }} />
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚀</div>
        <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
          Waiting for Engagement Spikes...
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "360px", margin: "0 auto" }}>
          Highlight candidates are automatically generated when chat velocity, hype scores, or viewer spikes occur.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🌟</span> Stream Highlight Candidates ({highlights.length})
        </h3>
        <span style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "12px" }}>
          Auto-Detected Spikes
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {highlights.map((hl) => (
          <div
            key={hl.id}
            style={{
              padding: "16px",
              borderRadius: "14px",
              background: "rgba(13,16,27,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontWeight: "800", fontSize: "14px", color: "#f8fafc" }}>{hl.title}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: "rgba(52,211,153,0.15)",
                    color: "#34d399",
                    border: "1px solid rgba(52,211,153,0.3)",
                  }}
                >
                  Score: {hl.score}/100
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                {new Date(hl.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: "13px", color: "#c084fc", fontWeight: "600" }}>
              ⚡ Trigger: {hl.triggerReason}
            </p>

            {hl.sampleMessages && hl.sampleMessages.length > 0 && (
              <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", fontSize: "12px", color: "#94a3b8" }}>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Sample Chat Messages:</div>
                {hl.sampleMessages.map((msg, i) => (
                  <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    • "{msg}"
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

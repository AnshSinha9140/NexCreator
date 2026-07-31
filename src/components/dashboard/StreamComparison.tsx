"use client";

import React, { useState } from "react";

interface StreamComparisonProps {
  onOpenReport?: (sessionId: string) => void;
}

export const StreamComparison: React.FC<StreamComparisonProps> = () => {
  const [selectedGame, setSelectedGame] = useState<string>("GTA V");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header & Filter Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#f8fafc" }}>
            📊 Stream Comparison Workspace
          </h2>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
            Benchmark current broadcast metrics against your historical average and best session.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["GTA V", "Valorant", "All Games"].map((game) => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                background: selectedGame === game ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.04)",
                color: selectedGame === game ? "#34d399" : "#94a3b8",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {game}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid (Current vs Previous vs Best Session) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        
        {/* Current Session Card */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(52, 211, 153, 0.3)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.2)", color: "#34d399", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
              Current Broadcast
            </span>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#34d399", fontFamily: "monospace" }}>92/100 (A)</span>
          </div>

          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            GTA V RP Stream #4
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Average Viewers:</span>
              <strong style={{ color: "#34d399" }}>24 (+14% vs Avg)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Chat Velocity:</span>
              <strong style={{ color: "#60a5fa" }}>18 msgs/min (+22%)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Sentiment Score:</span>
              <strong style={{ color: "#c084fc" }}>94/100 (+17%)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Clip Opportunities:</span>
              <strong style={{ color: "#eab308" }}>3 Clips (+1)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Recommendations:</span>
              <strong style={{ color: "#34d399" }}>3 Completed</strong>
            </div>
          </div>
        </div>

        {/* Previous Session Card */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(96, 165, 250, 0.2)", color: "#60a5fa", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
              Previous Broadcast
            </span>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#60a5fa", fontFamily: "monospace" }}>84/100 (B+)</span>
          </div>

          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            GTA V RP Stream #3
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Average Viewers:</span>
              <strong>21 viewers</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Chat Velocity:</span>
              <strong>14 msgs/min</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Sentiment Score:</span>
              <strong>80/100</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Clip Opportunities:</span>
              <strong>2 Clips</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Recommendations:</span>
              <strong>2 Completed</strong>
            </div>
          </div>
        </div>

        {/* Best Session Card */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.2)", color: "#c084fc", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
              👑 Best Session Baseline
            </span>
            <span style={{ fontSize: "16px", fontWeight: "900", color: "#c084fc", fontFamily: "monospace" }}>96/100 (A+)</span>
          </div>

          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            GTA V Finale Stream
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Average Viewers:</span>
              <strong style={{ color: "#c084fc" }}>32 viewers</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Chat Velocity:</span>
              <strong style={{ color: "#c084fc" }}>24 msgs/min</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Sentiment Score:</span>
              <strong style={{ color: "#c084fc" }}>98/100</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Clip Opportunities:</span>
              <strong style={{ color: "#c084fc" }}>5 Clips</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
              <span>Recommendations:</span>
              <strong style={{ color: "#c084fc" }}>4 Completed</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

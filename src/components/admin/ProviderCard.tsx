"use client";

import HealthBadge from "./HealthBadge";
import { AIProviderHealth } from "@/types/aiOperations";

export default function ProviderCard({ provider }: { provider: AIProviderHealth }) {
  const cacheHitRate =
    provider.cacheHits + provider.cacheMisses > 0
      ? ((provider.cacheHits / (provider.cacheHits + provider.cacheMisses)) * 100).toFixed(0)
      : "0";

  const isQuotaExhausted = provider.status === "Quota Exhausted";
  const statusColor =
    provider.status === "Healthy"
      ? "healthy"
      : provider.status === "Quota Exhausted" || provider.status === "Offline"
      ? "critical"
      : "degraded";

  return (
    <div
      className="admin-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        borderColor: isQuotaExhausted ? "rgba(244, 63, 94, 0.4)" : undefined,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: isQuotaExhausted ? "rgba(244, 63, 94, 0.12)" : "rgba(168, 85, 247, 0.12)",
              border: isQuotaExhausted ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid rgba(168, 85, 247, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: isQuotaExhausted ? "#fb7185" : "#c084fc",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {provider.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>{provider.name}</h3>
            <p style={{ margin: "2px 0 0", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
              Model: <span style={{ color: "#cbd5e1" }}>{provider.model}</span>
            </p>
          </div>
        </div>

        <HealthBadge status={statusColor} label={provider.status.toUpperCase()} />
      </div>

      {/* Grid Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Requests Today</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fff", marginTop: "4px", display: "block" }}>
            {provider.requestsToday.toLocaleString()}
          </span>
        </div>

        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Avg Latency</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "4px", display: "block" }}>
            {provider.avgLatencyMs} ms
          </span>
        </div>

        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Tokens Today</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#38bdf8", marginTop: "4px", display: "block" }}>
            {provider.tokensToday > 1000 ? `${(provider.tokensToday / 1000).toFixed(1)}k` : provider.tokensToday}
          </span>
        </div>

        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Cache Hit Rate</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", marginTop: "4px", display: "block" }}>
            {cacheHitRate}%
          </span>
        </div>
      </div>

      {/* Footer stats */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span>Est Cost Today: <strong style={{ color: "#34d399" }}>${provider.costTodayUsd.toFixed(4)}</strong></span>
        <span>Failures: <strong style={{ color: provider.failuresToday > 0 ? "#f87171" : "#94a3b8" }}>{provider.failuresToday}</strong></span>
      </div>
    </div>
  );
}

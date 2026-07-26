"use client";

import HealthBadge, { HealthStatus } from "./HealthBadge";

export interface AIProviderStats {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  requestsToday: number;
  failures: number;
  timeouts: number;
  rateLimits429: number;
  avgResponseTimeMs: number;
  tokensEstimated: number;
  cacheHits: number;
  cacheMisses: number;
  fallbackCount: number;
}

export default function ProviderCard({ provider }: { provider: AIProviderStats }) {
  const cacheHitRate = provider.cacheHits + provider.cacheMisses > 0
    ? ((provider.cacheHits / (provider.cacheHits + provider.cacheMisses)) * 100).toFixed(0)
    : "100";

  return (
    <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "#c084fc", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace"
          }}>
            {provider.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>{provider.name}</h3>
            <p style={{ margin: "2px 0 0", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
              Avg Latency: <span style={{ color: "#c084fc", fontWeight: 600 }}>{provider.latencyMs} ms</span>
            </p>
          </div>
        </div>

        <HealthBadge status={provider.status || "healthy"} />
      </div>

      {/* Grid Stats (2x2 grid so tiles have enough breathing room) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Requests Today</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fff", marginTop: "4px", display: "block" }}>
            {provider.requestsToday?.toLocaleString() || 0}
          </span>
        </div>

        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Failures / 429</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f87171", marginTop: "4px", display: "block" }}>
            {provider.failures || 0} / {provider.rateLimits429 || 0}
          </span>
        </div>

        <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Est. Tokens</span>
          <span style={{ fontSize: "15px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "4px", display: "block" }}>
            {((provider.tokensEstimated || 0) / 1000).toFixed(1)}k
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
        <span>Fallbacks Triggered: <strong style={{ color: "#fbbf24" }}>{provider.fallbackCount || 0}</strong></span>
        <span>Timeouts: <strong style={{ color: "#f87171" }}>{provider.timeouts || 0}</strong></span>
      </div>
    </div>
  );
}

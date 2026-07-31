"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { QuotaPlannerBundle } from "@/lib/admin/quota/quotaPlannerBuilder";
import { useAdmin } from "@/context/AdminContext";

export const QuotaDashboardView: React.FC = () => {
  const { refresh } = useAdmin();
  const [data, setData] = useState<QuotaPlannerBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simIndex, setSimIndex] = useState<number>(1);

  const fetchQuotaData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/quota");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load quota telemetry.");
      }
    } catch (e: any) {
      console.error("[QuotaDashboardView] Fetch error:", e);
      setError(e.message || "Failed to load quota telemetry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotaData();
  }, [fetchQuotaData]);

  if (loading && !data) {
    return (
      <div style={{ padding: "40px 24px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
        Loading Canonical YouTube Quota Telemetry & Capacity Planner...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: "32px", color: "#f87171", fontFamily: "'JetBrains Mono', monospace" }}>
        Telemetry Warning: {error}
      </div>
    );
  }

  const ov = data?.overview;
  const fc = data?.forecast;
  const sim = data?.simulations || [];
  const selectedSim = sim[simIndex] || sim[0];
  const rec = data?.recommendation;
  const hasData = ov?.hasTelemetryToday ?? false;

  const riskColor =
    fc?.riskLevel === "Low"
      ? "#34d399"
      : fc?.riskLevel === "Moderate"
      ? "#fbbf24"
      : fc?.riskLevel === "High"
      ? "#f97316"
      : "#f87171";

  return (
    <>
      <AdminHeader
        title="YouTube Quota & Capacity Planner"
        subtitle="Canonical API Telemetry, Mathematical Capacity Forecasting & Multi-Creator Admission Control"
        onRefresh={() => { fetchQuotaData(); refresh(); }}
      />

      <div className="admin-page">
        {/* Truthful Zero State Banner */}
        {!hasData && (
          <div style={{
            padding: "16px 20px", borderRadius: "12px",
            background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)",
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>⚡</span>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>Zero YouTube API Quota Usage Today</h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                  Not enough telemetry collected today. All quota units, burn rates, and forecasts reflect truthful zero states.
                </p>
              </div>
            </div>
            <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", background: "rgba(168,85,247,0.15)", padding: "4px 10px", borderRadius: "6px" }}>
              10,000 / 10,000 Remaining
            </span>
          </div>
        )}

        {/* Top 4 Telemetry Metrics */}
        <div className="admin-grid-4" style={{ marginBottom: "24px" }}>
          <div className="admin-card" style={{ padding: "20px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>DAILY QUOTA USED</span>
            <div style={{ fontSize: "26px", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9", marginTop: "6px" }}>
              {ov?.dailyUnitsUsed.toLocaleString()} <span style={{ fontSize: "13px", color: "#64748b" }}>/ {ov?.dailyQuotaLimit.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: "12px", color: riskColor, marginTop: "6px", fontWeight: 700 }}>
              {ov?.usagePercentage}% Used Today
            </div>
          </div>

          <div className="admin-card" style={{ padding: "20px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>REMAINING MONITORING TIME</span>
            <div style={{ fontSize: "26px", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", marginTop: "6px" }}>
              {hasData ? `${fc?.safeMonitoringHours} hrs` : "∞ hrs"}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
              {ov?.remainingUnits.toLocaleString()} units remaining
            </div>
          </div>

          <div className="admin-card" style={{ padding: "20px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>SAFE CONCURRENT STREAMS</span>
            <div style={{ fontSize: "26px", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "6px" }}>
              {fc?.safeConcurrentStreams} Streams
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
              Risk Level: <strong style={{ color: riskColor }}>{fc?.riskLevel}</strong>
            </div>
          </div>

          <div className="admin-card" style={{ padding: "20px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>RECOMMENDED POLL INTERVAL</span>
            <div style={{ fontSize: "26px", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", marginTop: "6px" }}>
              {(fc?.recommendedPollIntervalMs || 10000) / 1000}s
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
              Burn Rate: {ov?.hourlyBurnRate} units/hr
            </div>
          </div>
        </div>

        {/* MULTI-CREATOR SIMULATOR */}
        <div className="admin-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔮</span> Multi-Creator Capacity Simulator ("What If...")
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                Simulate quota exhaustion and monitoring hours if additional creators start streaming simultaneously.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {sim.map((s, idx) => (
                <button
                  key={s.addedStreams}
                  onClick={() => setSimIndex(idx)}
                  style={{
                    padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
                    border: simIndex === idx ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.08)",
                    background: simIndex === idx ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.02)",
                    color: simIndex === idx ? "#c084fc" : "#94a3b8",
                  }}
                >
                  +{s.addedStreams} Streams
                </button>
              ))}
            </div>
          </div>

          {selectedSim && (
            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(6,8,16,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Projected Burn Rate:</span>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                    {selectedSim.projectedHourlyBurnRate} units/hr
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Monitoring Time Left:</span>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#34d399", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                    {selectedSim.estimatedRemainingHours} hrs
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Failure Risk Level:</span>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: selectedSim.riskLevel === "Low" ? "#34d399" : selectedSim.riskLevel === "Moderate" ? "#fbbf24" : "#f87171", fontFamily: "'JetBrains Mono', monospace", marginTop: "2px" }}>
                    {selectedSim.riskLevel}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>Admission Decision:</span>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: selectedSim.admissionDecision ? "#34d399" : "#f87171", marginTop: "2px" }}>
                    {selectedSim.admissionDecision ? "✓ SAFE TO PROCEED" : "✕ REJECT NEW STREAMS"}
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "4px" }}>
                {selectedSim.equationsUsed.map((eq, i) => (
                  <div key={i}>• {eq}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EVIDENCE-BACKED AI RECOMMENDATION */}
        <div className="admin-card" style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 800, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🤖</span> Telemetry-Driven AI Recommendations & Reasoning Chain
          </h3>

          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>{rec?.title}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{rec?.summary}</div>
            <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 600, marginTop: "8px" }}>👉 Actionable Advice: {rec?.actionableAdvice}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
            <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>REASONING CHAIN</span>
            {rec?.reasoningChain.map((step, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#c084fc", fontWeight: 700 }}>[{idx + 1}]</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

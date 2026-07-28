"use client";

import React, { useState, useEffect } from "react";
import { CapacityForecast, MultiCreatorSimulation } from "@/lib/collectors/base/capacityTypes";

export const QuotaDashboardView: React.FC = () => {
  const [forecastData, setForecastData] = useState<CapacityForecast | null>(null);
  const [activeStreams, setActiveStreams] = useState<number>(1);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simulator State
  const [simCount, setSimCount] = useState<number>(3);
  const [simResult, setSimResult] = useState<MultiCreatorSimulation | null>(null);

  const fetchQuotaData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/quota");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.forecast) {
        setForecastData(data.forecast);
        setActiveStreams(data.activeStreamsCount || 1);
        setHistoryData(data.history || []);
        setSimResult(data.forecast.simulations.plus3Streams);
      }
    } catch (e: any) {
      console.error("[QuotaDashboard] Fetch error:", e);
      setErrorMsg(e.message || "Failed to load quota telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotaData();
    const timer = setInterval(fetchQuotaData, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulate = (count: number) => {
    setSimCount(count);
    if (!forecastData) return;
    if (count === 1) setSimResult(forecastData.simulations.plus1Stream);
    else if (count === 3) setSimResult(forecastData.simulations.plus3Streams);
    else if (count === 5) setSimResult(forecastData.simulations.plus5Streams);
    else if (count === 10) setSimResult(forecastData.simulations.plus10Streams);
  };

  if (isLoading && !forecastData) {
    return (
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ height: "100px", background: "rgba(255,255,255,0.03)", borderRadius: "16px" }} />
        <div style={{ height: "300px", background: "rgba(255,255,255,0.03)", borderRadius: "16px" }} />
      </div>
    );
  }

  if (errorMsg && !forecastData) {
    return (
      <div style={{ padding: "32px", color: "#fb7185", fontFamily: "'Inter', sans-serif" }}>
        Failed to load Quota Capacity Planner: {errorMsg}
      </div>
    );
  }

  const forecast = forecastData!;
  const stateColor =
    forecast.capacityState === "SAFE"
      ? "#34d399"
      : forecast.capacityState === "WARNING"
      ? "#fde047"
      : forecast.capacityState === "CRITICAL"
      ? "#fb923c"
      : "#f43f5e";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px", fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header & Alert Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>⚡</span> YouTube Quota & Capacity Planner
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
            Real-time telemetry forecasting, multi-creator admission control, and adaptive quota protection.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "800",
              background: `${stateColor}15`,
              border: `1px solid ${stateColor}40`,
              color: stateColor,
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            ● State: {forecast.capacityState}
          </span>
          <button
            onClick={fetchQuotaData}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f8fafc",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ↻ Refresh Forecast
          </button>
        </div>
      </div>

      {/* 4 Top Telemetry Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13,16,27,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Daily Quota Used</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#f8fafc", marginTop: "6px" }}>
            {forecast.dailyQuotaUsed.toLocaleString()} <span style={{ fontSize: "14px", color: "#64748b" }}>/ {forecast.dailyQuotaLimit.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: "12px", color: stateColor, marginTop: "6px", fontWeight: "700" }}>
            {forecast.quotaUsagePct}% Used
          </div>
        </div>

        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13,16,27,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Remaining Monitoring Time</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#34d399", marginTop: "6px" }}>
            {forecast.estimatedRemainingMonitoringHours} hrs
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
            {forecast.estimatedRemainingRequests.toLocaleString()} requests left
          </div>
        </div>

        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13,16,27,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Safe Concurrent Streams</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#c084fc", marginTop: "6px" }}>
            {forecast.safeConcurrentStreams} Streams
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
            ~{forecast.safeNewStreamsToday} new streams today
          </div>
        </div>

        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13,16,27,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Recommended Interval</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#60a5fa", marginTop: "6px" }}>
            {forecast.recommendedPollIntervalMs / 1000}s
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
            Adaptive clamping active
          </div>
        </div>
      </div>

      {/* PART 8 — MULTI-CREATOR SIMULATOR ("What If...") */}
      <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(13,16,27,0.8)", border: "1px solid rgba(168,85,247,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🔮</span> Multi-Creator Capacity Simulator ("What If...")
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
              Simulate quota exhaustion and monitoring hours if additional creators start streaming simultaneously.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 3, 5, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleSimulate(num)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: simCount === num ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.08)",
                  background: simCount === num ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.02)",
                  color: simCount === num ? "#c084fc" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                +{num} Streams
              </button>
            ))}
          </div>
        </div>

        {simResult && (
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Projected Quota Used:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc", marginTop: "2px" }}>
                {simResult.projectedDailyQuotaUsed.toLocaleString()} ({simResult.projectedQuotaUsagePct}%)
              </div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Monitoring Time Left:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#34d399", marginTop: "2px" }}>
                {simResult.estimatedMonitoringHoursRemaining} hrs
              </div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Failure Risk Level:</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: simResult.riskLevel === "low" ? "#34d399" : simResult.riskLevel === "medium" ? "#fde047" : "#f43f5e", marginTop: "2px", textTransform: "uppercase" }}>
                {simResult.riskLevel}
              </div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Admission Recommendation:</span>
              <div style={{ fontSize: "12px", fontWeight: "700", color: simResult.isSafeToProceed ? "#34d399" : "#fb7185", marginTop: "2px" }}>
                {simResult.isSafeToProceed ? "✓ Safe to Proceed" : "✕ Exceeds Quota"}
              </div>
            </div>
            <div style={{ gridColumn: "span 4", fontSize: "12px", color: "#cbd5e1", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              💡 {simResult.recommendation}
            </div>
          </div>
        )}
      </div>

      {/* PART 9 — AI OPERATIONAL RECOMMENDATIONS */}
      <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(13,16,27,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🤖</span> AI Quota Operational Recommendations
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {forecast.aiRecommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: "800", fontSize: "14px", color: "#f8fafc" }}>{rec.title}</span>
                  <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "8px", background: "rgba(168,85,247,0.15)", color: "#c084fc", textTransform: "uppercase" }}>
                    Confidence: {rec.confidencePct}%
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>{rec.reason}</p>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#34d399", fontWeight: "600" }}>
                  👉 Step: {rec.actionableStep} ({rec.expectedSavings})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

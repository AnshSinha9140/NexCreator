"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import ChartCard from "@/components/admin/ChartCard";

export default function AICostIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-cost");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
  }, []);

  if (loading) {
    return (
      <>
        <AdminHeader
          title="AI Cost & Token Intelligence"
          subtitle="Token Usage Estimation, Cache Efficiency & Free Tier Monitor"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading AI Cost & Token Intelligence...
          </div>
        </div>
      </>
    );
  }

  const m = data?.metrics || {};

  return (
    <>
      <AdminHeader
        title="AI Cost & Token Intelligence"
        subtitle="Token Usage Estimation, Cache Efficiency & Free Tier Monitor"
        onRefresh={fetchCostData}
      />

      <div className="admin-page">
        {/* Row 1: Key Cost & Token Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Est. Monthly Cost" value={`$${m.estimatedMonthlyCostUsd || 0}`} subtitle="Base API Rate Projections" statusColor="emerald" />
          <MetricCard
            title="Total Tokens Today"
            value={
              (m.totalTokens || 0) >= 100000
                ? `${((m.totalTokens || 0) / 1000000).toFixed(2)}M`
                : `${((m.totalTokens || 0) / 1000).toFixed(1)}k`
            }
            subtitle="Prompt + Completion"
            statusColor="purple"
          />
          <MetricCard title="Cache Hit %" value={m.cacheHitPercentage || "0%"} subtitle="Zero-Latency Prompt Re-use" statusColor="blue" />
          <MetricCard
            title="Cost Saved by Cache"
            value={`$${m.costSavedByCacheUsd || 0}`}
            subtitle={
              (m.tokensSavedByCache || 0) >= 100000
                ? `${((m.tokensSavedByCache || 0) / 1000000).toFixed(2)}M Tokens Saved`
                : `${((m.tokensSavedByCache || 0) / 1000).toFixed(1)}k Tokens Saved`
            }
            statusColor="amber"
          />
        </div>

        {/* Row 2: Secondary Token Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Prompt Tokens</span>
            <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "6px", display: "block" }}>
              {(m.promptTokens || 0) >= 100000
                ? `${((m.promptTokens || 0) / 1000000).toFixed(2)}M`
                : `${((m.promptTokens || 0) / 1000).toFixed(1)}k`}
            </span>
          </div>

          <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Completion Tokens</span>
            <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", marginTop: "6px", display: "block" }}>
              {(m.completionTokens || 0) >= 100000
                ? `${((m.completionTokens || 0) / 1000000).toFixed(2)}M`
                : `${((m.completionTokens || 0) / 1000).toFixed(1)}k`}
            </span>
          </div>

          <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Free Tier Status</span>
            <span style={{ fontSize: "16px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", marginTop: "6px", display: "block" }}>
              {m.currentFreeTierUsage || "0%"}
            </span>
          </div>

          <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Rule Engine Runs</span>
            <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24", marginTop: "6px", display: "block" }}>
              {m.ruleEngineRuns?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        {/* Row 3: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Tokens Consumed per Hour"
            subtitle="Hourly AI model payload volume"
            data={data?.charts?.tokensPerHour || []}
            color="purple"
          />

          <ChartCard
            title="Cache Savings ($ Savings)"
            subtitle="Daily dollar savings generated by local caching"
            data={data?.charts?.cacheSavingsTimeline || []}
            color="emerald"
          />
        </div>
      </div>
    </>
  );
}

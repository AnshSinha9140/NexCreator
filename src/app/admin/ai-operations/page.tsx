"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import ProviderCard from "@/components/admin/ProviderCard";
import ChartCard from "@/components/admin/ChartCard";
import MetricCard from "@/components/admin/MetricCard";
import { AIOperationsProvider, useAIOperations } from "@/context/AIOperationsContext";

function AIOperationsContent() {
  const { bundle, loading, error, refresh } = useAIOperations();

  if (loading && !bundle) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", color: "#94a3b8" }}>
        Loading AI Operations Telemetry...
      </div>
    );
  }

  const overview = bundle?.overview;
  const providers = bundle?.providers || [];
  const charts = bundle?.charts;
  const hasDataToday = bundle?.hasDataToday ?? false;
  const costAnalytics = bundle?.costAnalytics;
  const cacheAnalytics = bundle?.cacheAnalytics;

  // Format chart data for ChartCard ({ label, value })
  const requestsPerHourChart = (charts?.requestsPerHour || []).map((h) => ({
    label: h.hour,
    value: h.requests,
  }));

  const providerUsageChart = (charts?.providerUsage || []).map((p) => ({
    label: p.name.split(" ")[0],
    value: p.percentage,
  }));

  const latencyTimelineChart = (charts?.latencyTimeline || []).map((l) => ({
    label: l.hour,
    value: l.p50,
  }));

  const fallbackTimelineChart = (charts?.fallbackTimeline || []).map((f) => ({
    label: f.hour,
    value: f.count,
  }));

  return (
    <>
      <AdminHeader
        title="AI Operations Dashboard"
        subtitle="Canonical Provider Telemetry, Token Metrics, Fallback Chains & Verified Latency Benchmarks"
        onRefresh={refresh}
      />

      <div className="admin-page">
        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", padding: "12px 16px", borderRadius: "8px", color: "#f87171", marginBottom: "16px", fontSize: "0.85rem" }}>
            Telemetry Warning: {error}
          </div>
        )}

        {/* Truthful Empty State Banner if no AI calls recorded today */}
        {!hasDataToday && (
          <div
            style={{
              padding: "20px 24px",
              borderRadius: "14px",
              background: "rgba(168, 85, 247, 0.06)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ fontSize: "24px" }}>🤖</div>
              <div>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>No AI Requests Today</h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                  Zero LLM inference dispatches recorded for current UTC date. Provider cards and charts reflect canonical zero telemetry.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Summary Metric Cards */}
        <div className="admin-grid-4" style={{ marginBottom: "24px" }}>
          <MetricCard
            title="Requests Today"
            value={hasDataToday ? overview?.requestsToday ?? 0 : 0}
            subtitle="Verified LLM Calls"
            change={hasDataToday ? "Live Log Stream" : "No Activity"}
            statusColor={hasDataToday ? "emerald" : "purple"}
          />
          <MetricCard
            title="Tokens Today"
            value={hasDataToday ? (overview?.tokensToday ?? 0).toLocaleString() : 0}
            subtitle="Total Tokens Consumed"
            change={hasDataToday ? `${((overview?.tokensToday || 0) / 1000).toFixed(1)}k Tokens` : "0 Tokens"}
            statusColor="purple"
          />
          <MetricCard
            title="Today's Est. Cost"
            value={`$${(overview?.costTodayUsd ?? 0).toFixed(4)}`}
            subtitle={`Week: $${(costAnalytics?.costThisWeekUsd ?? 0).toFixed(4)}`}
            change="Canonical Log Tariff"
            statusColor="emerald"
          />
          <MetricCard
            title="Avg Latency (P50 / P95)"
            value={hasDataToday ? `${overview?.latency.avgLatencyMs || 0} ms` : "0 ms"}
            subtitle={hasDataToday ? `P50: ${overview?.latency.p50LatencyMs}ms | P95: ${overview?.latency.p95LatencyMs}ms` : "No Samples"}
            change={hasDataToday ? `Max: ${overview?.latency.maxLatencyMs}ms` : "—"}
            statusColor="amber"
          />
        </div>

        {/* Provider Cards Grid */}
        <div className="admin-grid-3" style={{ marginBottom: "24px" }}>
          {providers.map((prov) => (
            <ProviderCard key={prov.providerKey} provider={prov} />
          ))}
        </div>

        {/* AI Analytics Secondary Tiles */}
        <div className="admin-grid-4" style={{ marginBottom: "24px" }}>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Cache Hit Rate</span>
            <span className="admin-tele-tile-value" style={{ color: "#34d399" }}>
              {cacheAnalytics?.hitRatePct ?? 0}%
            </span>
          </div>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Saved Tokens (Cache)</span>
            <span className="admin-tele-tile-value" style={{ color: "#a855f7" }}>
              {cacheAnalytics?.savedTokens ?? 0}
            </span>
          </div>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Saved Cost (Cache)</span>
            <span className="admin-tele-tile-value" style={{ color: "#60a5fa" }}>
              ${(cacheAnalytics?.savedCostUsd ?? 0).toFixed(4)}
            </span>
          </div>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Failures / Fallbacks</span>
            <span className="admin-tele-tile-value" style={{ color: overview?.failuresToday ? "#f87171" : "#94a3b8" }}>
              {overview?.failuresToday || 0} / {overview?.fallbacksToday || 0}
            </span>
          </div>
        </div>

        {/* AI Charts Grid */}
        <div className="admin-grid-2">
          <ChartCard
            title="Requests per Hour"
            subtitle={hasDataToday ? "Hourly AI request volume" : "No AI requests recorded today."}
            data={requestsPerHourChart}
            color="purple"
          />

          <ChartCard
            title="Provider Distribution"
            subtitle={hasDataToday ? "Share of total LLM dispatches today" : "No provider activity today."}
            data={providerUsageChart}
            color="emerald"
          />

          <ChartCard
            title="Latency Percentiles (ms)"
            subtitle={hasDataToday ? "P50 response times" : "No latency samples today."}
            data={latencyTimelineChart}
            color="amber"
          />

          <ChartCard
            title="Fallback Timeline"
            subtitle={hasDataToday ? "Automated provider failovers" : "No failover events today."}
            data={fallbackTimelineChart}
            color="rose"
          />
        </div>
      </div>
    </>
  );
}

export default function AIOperationsPage() {
  return (
    <AIOperationsProvider>
      <AIOperationsContent />
    </AIOperationsProvider>
  );
}

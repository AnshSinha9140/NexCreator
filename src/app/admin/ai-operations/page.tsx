"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ProviderCard, { AIProviderStats } from "@/components/admin/ProviderCard";
import ChartCard from "@/components/admin/ChartCard";

export default function AIOperationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAIOps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-ops");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIOps();
  }, []);

  return (
    <>
      <AdminHeader
        title="AI Operations Dashboard"
        subtitle="Provider Telemetry, Token Metrics, Fallback Chains & Latency Benchmarks"
        onRefresh={fetchAIOps}
      />

      <div className="admin-page">
        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(data?.providers || []).map((prov: AIProviderStats, idx: number) => (
            <ProviderCard key={idx} provider={prov} />
          ))}
        </div>

        {/* AI Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Requests per Hour"
            subtitle="Combined AI inference request volume"
            data={data?.charts?.requestsPerHour || []}
            color="purple"
          />

          <ChartCard
            title="Provider Distribution"
            subtitle="Percentage share of total LLM dispatches"
            data={data?.charts?.providerUsage || []}
            color="emerald"
          />

          <ChartCard
            title="Latency Percentiles (ms)"
            subtitle="P50, P90, and P99 AI response times"
            data={data?.charts?.latencyTimeline || []}
            color="amber"
          />

          <ChartCard
            title="Fallback Timeline"
            subtitle="Automated provider failovers triggered"
            data={data?.charts?.fallbackTimeline || []}
            color="rose"
          />
        </div>
      </div>
    </>
  );
}

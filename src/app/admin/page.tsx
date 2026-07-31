"use client";

import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import ChartCard from "@/components/admin/ChartCard";
import HealthBadge from "@/components/admin/HealthBadge";
import { useAdmin } from "@/context/AdminContext";

export default function AdminDashboardPage() {
  const { bundle, loading, error, refresh } = useAdmin();

  if (loading && !bundle) {
    return (
      <>
        <AdminHeader title="Admin Operations Dashboard" subtitle="Loading Operations Bundle..." />
        <div className="admin-page" style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>Initializing Platform Operations Mesh...</div>
        </div>
      </>
    );
  }

  const overview = bundle?.overview;
  const health = bundle?.systemHealth;
  const aiOps = bundle?.aiOperations;
  const queues = bundle?.queues;
  const auditFeed = bundle?.audit?.recentActivity || [];

  const pendingVerifications = overview?.pendingVerifications ?? "—";
  const todaysNewCreators = overview?.todaysNewCreators ?? "—";
  const approvedCreators = overview?.approvedCreators ?? 0;
  const currentlyLive = overview?.currentlyLive ?? "—";
  const aiRequestsToday = overview?.aiRequestsToday ?? "—";
  const systemUptime = overview?.systemUptime || "—";
  const healthScore = health?.overallScore ?? "—";
  const aiLoadPercentage = aiOps?.loadPercentage || "0%";
  const queueLoad = queues ? `${queues.activeJobs} Jobs` : "0 Jobs";
  const unreadAlerts = bundle?.notifications?.unreadCount ?? 0;
  const fallbackCount = aiOps?.fallbackCount ?? 0;
  const avgAiLatencyMs = aiOps?.avgLatencyMs ?? 0;
  const errorsToday = overview?.errorsToday ?? 0;

  const aiChartData = aiOps?.hourlyThroughput || [];
  const sessChartData = [
    { label: "Active", value: typeof currentlyLive === "number" ? currentlyLive : 0 },
    { label: "Today Total", value: bundle?.liveSessions?.totalToday || 0 },
    { label: "Collectors", value: bundle?.collectors?.activeCount || 0 },
  ];

  return (
    <>
      <AdminHeader
        title="Admin Operations Dashboard"
        subtitle="Operations Center — Realtime Telemetry, Queue Health & Platform Mesh Score"
        onRefresh={refresh}
      />

      <div className="admin-page">
        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", padding: "12px 16px", borderRadius: "8px", color: "#f87171", marginBottom: "16px", fontSize: "0.85rem" }}>
            Operational Degraded Mode: {error}
          </div>
        )}

        {/* Hero Banner */}
        <div className="admin-hero-banner">
          <div className="admin-hero-banner-left">
            <div className="admin-hero-banner-tag">
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: health?.overallStatus === "Healthy" ? "#10b981" : "#f59e0b",
                  display: "inline-block",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              OPS CENTER {health?.overallStatus?.toUpperCase() || "ACTIVE"}
            </div>
            <div className="admin-hero-banner-title">Platform Operations Mesh</div>
            <div className="admin-hero-banner-desc">
              {health?.explanations?.[0] || "All primary components, collectors, AI workers, and databases responding."}
            </div>
          </div>
          <div className="admin-hero-banner-right">
            <div className="admin-hero-stat">
              <span className="admin-hero-stat-value" style={{ color: "#10b981" }}>
                {systemUptime}
              </span>
              <span className="admin-hero-stat-label">System Uptime</span>
            </div>
            <div className="admin-hero-stat">
              <span className="admin-hero-stat-value" style={{ color: "#a855f7" }}>
                {healthScore}{typeof healthScore === "number" ? "%" : ""}
              </span>
              <span className="admin-hero-stat-label">Health Score</span>
            </div>
          </div>
        </div>

        {/* Service Mesh Status */}
        <div className="admin-mesh-bar">
          <span className="admin-mesh-bar-label">Service Mesh Status:</span>
          <div className="admin-mesh-bar-items">
            {health?.components?.map((c) => (
              <div key={c.name} className="admin-mesh-bar-item">
                <span className="admin-mesh-bar-item-label">{c.name}:</span>
                <HealthBadge
                  status={c.status === "Healthy" ? "healthy" : c.status === "Warning" ? "degraded" : "critical"}
                  label={c.status.toUpperCase()}
                />
              </div>
            )) || (
              <div className="admin-mesh-bar-item">
                <HealthBadge status="healthy" label="MESH OK" />
              </div>
            )}
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="admin-grid-4">
          <MetricCard
            href="/admin/verification"
            title="Verification Queue"
            value={pendingVerifications}
            subtitle="Pending Applications"
            change={typeof pendingVerifications === "number" && pendingVerifications > 0 ? "Action Needed" : "Queue Clean"}
            statusColor={typeof pendingVerifications === "number" && pendingVerifications > 0 ? "amber" : "emerald"}
            icon={(props) => (
              <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          />
          <MetricCard
            href="/admin/creators"
            title="Today's New Creators"
            value={todaysNewCreators}
            subtitle={`${approvedCreators} Approved Total`}
            change="MongoDB Canonical"
            trend="up"
            statusColor="emerald"
            icon={(props) => (
              <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          />
          <MetricCard
            href="/admin/live-sessions"
            title="Currently Live"
            value={currentlyLive}
            subtitle="Active Collector Sessions"
            change={typeof currentlyLive === "number" && currentlyLive > 0 ? "LIVE" : "No Active Sessions"}
            statusColor={typeof currentlyLive === "number" && currentlyLive > 0 ? "rose" : "purple"}
            icon={(props) => (
              <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          />
          <MetricCard
            href="/admin/ai-operations"
            title="AI Requests Today"
            value={aiRequestsToday}
            subtitle="Gemini + Groq Total"
            change={`LOAD: ${aiLoadPercentage}`}
            statusColor="purple"
            icon={(props) => (
              <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          />
        </div>

        {/* Secondary Telemetry Tiles */}
        <div className="admin-grid-6">
          <Link href="/admin/ai-cost" className="admin-tele-tile" style={{ textDecoration: "none" }}>
            <span className="admin-tele-tile-label">Current AI Load</span>
            <span className="admin-tele-tile-value" style={{ color: "#a855f7" }}>
              {aiLoadPercentage}
            </span>
          </Link>
          <Link href="/admin/queues" className="admin-tele-tile" style={{ textDecoration: "none" }}>
            <span className="admin-tele-tile-label">Queue Load</span>
            <span className="admin-tele-tile-value" style={{ color: "#60a5fa" }}>
              {queueLoad}
            </span>
          </Link>
          <Link href="/admin/notifications" className="admin-tele-tile" style={{ textDecoration: "none" }}>
            <span className="admin-tele-tile-label">Unread Alerts</span>
            <span className="admin-tele-tile-value" style={{ color: "#f87171" }}>
              {unreadAlerts} Alerts
            </span>
          </Link>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Fallbacks Today</span>
            <span className="admin-tele-tile-value" style={{ color: "#fbbf24" }}>
              {fallbackCount}
            </span>
          </div>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Avg AI Latency</span>
            <span className="admin-tele-tile-value" style={{ color: "#34d399" }}>
              {avgAiLatencyMs} ms
            </span>
          </div>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Errors Today</span>
            <span className="admin-tele-tile-value" style={{ color: "#e2e8f0" }}>
              {errorsToday}
            </span>
          </div>
        </div>

        {/* Charts */}
        <div className="admin-grid-2">
          <ChartCard
            title="AI Requests Hourly Throughput"
            subtitle="Combined Gemini & Groq request volume"
            data={aiChartData}
            color="purple"
          />
          <ChartCard
            title="Live Operations Breakdown"
            subtitle="Active sessions, daily totals, and collectors"
            data={sessChartData}
            color="emerald"
          />
        </div>

        {/* Activity Feed */}
        <div className="admin-card">
          <div className="admin-section-header">
            <h3 className="admin-section-title">Recent Operations Audit & Activity Feed</h3>
            <Link href="/admin/audit-log" className="admin-section-link">
              View Audit Log →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {auditFeed.length > 0 ? (
              auditFeed.map((act) => (
                <div key={act.id} className="admin-feed-item">
                  <div className="admin-feed-item-content">
                    <span className="admin-feed-item-dot" />
                    <span className="admin-feed-item-message">{act.message}</span>
                  </div>
                  <span className="admin-feed-item-time" suppressHydrationWarning>
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: "#64748b", fontSize: "0.85rem", padding: "12px 0" }}>
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

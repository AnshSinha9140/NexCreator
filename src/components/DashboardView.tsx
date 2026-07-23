"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { LivePulseScore } from "./dashboard/LivePulseScore";
import { MetricCard } from "./dashboard/MetricCard";
import { SignatureTimeline } from "./dashboard/SignatureTimeline";
import { AICreatorCoach } from "./dashboard/AICreatorCoach";

const IconSentiment = () => (
  <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconBolt = () => (
  <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconCoin = () => (
  <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconShield = () => (
  <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export const DashboardView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { brandDeals, calendarEvents, activeLiveJob } = useApp();

  const totalPayout = brandDeals
    .filter((d) => d.status !== "completed")
    .reduce((sum, d) => sum + d.payout, 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        animation: "fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {/* Hero: Live Pulse Score */}
      <LivePulseScore
        score={92}
        isLive={!!activeLiveJob}
        messagesCount={activeLiveJob?.messagesCount ?? 0}
        statusText="Top 2% Creator · Community Hype Active"
      />

      {/* Metric Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <MetricCard
          title="Audience Sentiment"
          value="88% Positive"
          change="+14%"
          isPositive
          accentColor="emerald"
          subtitle="88% Positive · 8% Neutral · 4% Negative"
          icon={<IconSentiment />}
        />
        <MetricCard
          title="Chat Velocity"
          value="420 CPM"
          change="+32%"
          isPositive
          accentColor="blue"
          subtitle="420 messages per minute peak"
          icon={<IconBolt />}
        />
        <MetricCard
          title="Sponsor Pipeline"
          value={`$${totalPayout.toLocaleString()}`}
          change="+25%"
          isPositive
          accentColor="purple"
          subtitle="3 active brand campaigns"
          icon={<IconCoin />}
        />
        <MetricCard
          title="Toxicity Shield"
          value="SECURE"
          change="0 Alerts"
          isPositive
          accentColor="emerald"
          subtitle="Auto-moderation 100% active"
          icon={<IconShield />}
        />
      </div>

      {/* Split: Timeline + Coach */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "14px",
          alignItems: "start",
        }}
      >
        <SignatureTimeline />
        <AICreatorCoach progressMessage={activeLiveJob?.progressMessage} />
      </div>

      {/* Bottom: Content + Sponsors */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        {/* Calendar events */}
        <div
          style={{
            background: "rgba(13,16,27,0.7)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>Upcoming Content</h3>
            <button
              onClick={() => setActiveTab("calendar")}
              style={{
                fontSize: "11px",
                color: "#64748b",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Calendar →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {calendarEvents.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "18px" }}>
                  {evt.type === "video" ? "📹" : evt.type === "stream" ? "🎮" : "🤝"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {evt.title}
                  </div>
                  <div style={{ fontSize: "10px", color: "#475569" }}>{evt.description}</div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#a855f7", fontFamily: "monospace", flexShrink: 0 }}>
                  {evt.date}
                </span>
              </div>
            ))}
            {calendarEvents.length === 0 && (
              <p style={{ fontSize: "12px", color: "#334155", textAlign: "center", padding: "20px 0" }}>
                No upcoming content scheduled.
              </p>
            )}
          </div>
        </div>

        {/* Brand deals */}
        <div
          style={{
            background: "rgba(13,16,27,0.7)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>Brand Pipeline</h3>
            <button
              onClick={() => setActiveTab("crm")}
              style={{
                fontSize: "11px",
                color: "#64748b",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              CRM →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {brandDeals.slice(0, 3).map((deal) => (
              <div
                key={deal.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {deal.title}
                  </div>
                  <div style={{ fontSize: "10px", color: "#475569" }}>
                    {deal.brand} · {deal.platform}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#34d399", fontFamily: "monospace" }}>
                    ${deal.payout}
                  </div>
                  <div style={{ fontSize: "9px", color: "#a855f7", textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    {deal.status}
                  </div>
                </div>
              </div>
            ))}
            {brandDeals.length === 0 && (
              <p style={{ fontSize: "12px", color: "#334155", textAlign: "center", padding: "20px 0" }}>
                No active brand deals.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

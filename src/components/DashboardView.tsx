"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export const DashboardView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { brandDeals, calendarEvents, tasks, currentUser } = useApp();

  // Compute stats
  const totalPayout = brandDeals
    .filter((d) => d.status !== "completed")
    .reduce((sum, d) => sum + d.payout, 0);

  const upcomingReleasesCount = calendarEvents.filter(
    (e) => new Date(e.date) >= new Date()
  ).length;

  const activeTasksCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Welcome back, Creator!
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Here is a quick snapshot of your active production, brand deals, and team tasks.
        </p>
      </div>

      {/* Grid: Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        
        {/* Card 1 */}
        <div className="glass" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", backgroundColor: "var(--accent-purple)" }}></div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Active Sponsors Value</p>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>${totalPayout.toLocaleString()}</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-purple)", cursor: "pointer", display: "inline-block", marginTop: "8px" }} onClick={() => setActiveTab("crm")}>View Brand Deals ➔</span>
        </div>

        {/* Card 2 */}
        <div className="glass" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", backgroundColor: "var(--accent-blue)" }}></div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Upcoming Releases</p>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{upcomingReleasesCount}</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-blue)", cursor: "pointer", display: "inline-block", marginTop: "8px" }} onClick={() => setActiveTab("calendar")}>View Content Calendar ➔</span>
        </div>

        {/* Card 3 */}
        <div className="glass" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", backgroundColor: "var(--accent-pink)" }}></div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Pending Team Tasks</p>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{activeTasksCount}</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-pink)", cursor: "pointer", display: "inline-block", marginTop: "8px" }} onClick={() => setActiveTab("tasks")}>View Collaborators ➔</span>
        </div>

        {/* Card 4 */}
        <div className="glass" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", backgroundColor: "var(--accent-green)" }}></div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Channel Status</p>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-green)", display: "flex", alignItems: "center", gap: "6px", height: "40px" }}>
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--accent-green)" }}></span>
            VERIFIED
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "inline-block", marginTop: "8px" }}>Approved by admin</span>
        </div>

      </div>

      {/* Split Section: Recent Activity & Sponsor CRM */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "28px" }}>
        
        {/* Left Widget: Upcoming Content */}
        <div className="glass-premium" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Upcoming Content</h3>
            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => setActiveTab("calendar")}>Calendar</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {calendarEvents.slice(0, 3).map((event) => (
              <div key={event.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", background: "var(--bg-input)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "1.5rem" }}>
                  {event.type === "video" ? "📹" : event.type === "stream" ? "🎮" : "🤝"}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{event.title}</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{event.description}</p>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-purple)", fontWeight: 600 }}>{event.date}</span>
              </div>
            ))}
            {calendarEvents.length === 0 && (
              <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.9rem", padding: "20px 0" }}>No content planned yet.</p>
            )}
          </div>
        </div>

        {/* Right Widget: High Value Active Brand Deals */}
        <div className="glass-premium" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>Top Sponsors Pipeline</h3>
            <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => setActiveTab("crm")}>Manage CRM</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {brandDeals.slice(0, 3).map((deal) => (
              <div key={deal.id} style={{ display: "flex", alignItems: "center", justifyItems: "center", padding: "12px", background: "var(--bg-input)", borderRadius: "var(--radius-md)" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{deal.title}</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Brand: <strong style={{ color: "var(--text-primary)" }}>{deal.brand}</strong> | {deal.platform}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-green)", display: "block" }}>
                    ${deal.payout}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: deal.status === "signed" ? "var(--accent-blue)" : "var(--accent-yellow)", textTransform: "capitalize" }}>
                    {deal.status}
                  </span>
                </div>
              </div>
            ))}
            {brandDeals.length === 0 && (
              <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.9rem", padding: "20px 0" }}>No active brand deals.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

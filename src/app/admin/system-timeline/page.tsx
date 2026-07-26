"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

export default function SystemTimelinePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system-timeline");
      const json = await res.json();
      if (json.success) setEvents(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Chronological System Event Timeline"
          subtitle="Platform Incident Telemetry, Stream Lifecycle & System Events Stream"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading System Event Timeline...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Chronological System Event Timeline"
        subtitle="Platform Incident Telemetry, Stream Lifecycle & System Events Stream"
        onRefresh={fetchTimeline}
      />

      <div className="admin-page">
        {events.length === 0 ? (
          <div className="admin-card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", color: "#c084fc", fontSize: "24px"
            }}>
              ⏱️
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>
              No System Events Available
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: "1.5" }}>
              There are currently no chronological events or platform incident logs recorded in the system.
            </p>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: "28px" }}>
            {/* Vertical Timeline Container */}
            <div style={{
              position: "relative",
              borderLeft: "2px solid rgba(255, 255, 255, 0.08)",
              paddingLeft: "24px", marginLeft: "12px",
              display: "flex", flexDirection: "column", gap: "20px"
            }}>
              {events.map((ev) => {
                const dotBg = ev.status === "WARNING" ? "#f59e0b" : ev.status === "ERROR" ? "#f43f5e" : "#34d399";
                return (
                  <div key={ev.id} style={{ position: "relative" }}>
                    {/* Glowing Node Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-31px",
                        top: "16px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: dotBg,
                        border: "3px solid #0e1120",
                        boxShadow: `0 0 10px ${dotBg}80`
                      }}
                    />

                    {/* Card Item */}
                    <div style={{
                      padding: "16px 20px", borderRadius: "14px",
                      background: "rgba(6, 8, 16, 0.6)", border: "1px solid rgba(255, 255, 255, 0.06)",
                      display: "flex", flexDirection: "column", gap: "8px",
                      transition: "border-color 0.15s ease"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9" }}>
                            {ev.event}
                          </span>
                          <span style={{
                            padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
                            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                            background: "rgba(168, 85, 247, 0.12)", color: "#c084fc",
                            border: "1px solid rgba(168, 85, 247, 0.25)", textTransform: "uppercase"
                          }}>
                            {ev.category}
                          </span>
                        </div>
                        <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }} suppressHydrationWarning>
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", lineHeight: "1.4" }}>
                        {ev.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

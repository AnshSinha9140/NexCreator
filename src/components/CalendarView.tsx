"use client";

import React, { useState } from "react";
import { useApp, CalendarEvent } from "../context/AppContext";

export const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalendarEvent["type"]>("video");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    
    addCalendarEvent({
      title,
      type,
      date,
      description,
    });

    setTitle("");
    setDate("");
    setDescription("");
    setShowAddForm(false);
  };

  const getEventBadge = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "video":
        return <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", background: "rgba(168, 85, 247, 0.15)", color: "var(--accent-purple)", fontWeight: 600 }}>📹 Video</span>;
      case "stream":
        return <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", background: "rgba(236, 72, 153, 0.15)", color: "var(--accent-pink)", fontWeight: 600 }}>🎮 Stream</span>;
      case "collab":
        return <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", background: "rgba(59, 130, 246, 0.15)", color: "var(--accent-blue)", fontWeight: 600 }}>🤝 Collab</span>;
      default:
        return <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", background: "rgba(34, 197, 94, 0.15)", color: "var(--accent-green)", fontWeight: 600 }}>⭐ Milestone</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Content Calendar</h1>
          <p style={{ color: "var(--text-secondary)" }}>Plan publishing schedules and live streaming timelines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Close Form" : "➕ Schedule Content"}
        </button>
      </div>

      {/* Add Event Form Modal-like panel */}
      {showAddForm && (
        <div className="glass-premium animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Schedule Content Event</h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Content Title</label>
              <input type="text" placeholder="e.g. My Channel Q&A Vlog" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Content Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as CalendarEvent["type"])}>
                <option value="video">Main Channel Video</option>
                <option value="stream">Live Stream</option>
                <option value="collab">Collaboration Stream/Video</option>
                <option value="milestone">Channel Milestone / Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Target Release Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Brief Description</label>
              <textarea placeholder="e.g. Discussing future plans, editing tasks assigned to John." value={description} onChange={(e) => setDescription(e.target.value)} rows={3}></textarea>
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Schedule Event</button>
            </div>
          </form>
        </div>
      )}

      {/* Events List Grid */}
      <div className="glass-premium" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>Scheduled Releases</h3>

        {calendarEvents.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>Your calendar is currently clear. Click 'Schedule Content' to start planning.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {calendarEvents.map((event) => (
              <div key={event.id} style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", padding: "18px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", transition: "var(--transition-fast)" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent-purple)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}>
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{event.title}</h4>
                    {getEventBadge(event.type)}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{event.description}</p>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Target Date</p>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-purple)" }}>{event.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

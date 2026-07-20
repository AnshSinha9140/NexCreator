"use client";

import React, { useState } from "react";
import { useApp, BrandDeal } from "../context/AppContext";

export const CrmView: React.FC = () => {
  const { brandDeals, addBrandDeal, updateBrandDealStatus } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [payout, setPayout] = useState("");
  const [status, setStatus] = useState<BrandDeal["status"]>("negotiating");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !brand || !payout || !date) return;

    addBrandDeal({
      title,
      brand,
      platform,
      payout: Number(payout),
      status,
      date,
    });

    setTitle("");
    setBrand("");
    setPayout("");
    setDate("");
    setShowAddForm(false);
  };

  const getStatusBadge = (status: BrandDeal["status"]) => {
    switch (status) {
      case "completed":
        return <span className="badge badge-verified">Completed</span>;
      case "signed":
        return <span className="badge badge-pending" style={{ color: "var(--accent-blue)", background: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.2)" }}>Signed</span>;
      default:
        return <span className="badge badge-pending">Negotiating</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Brand Deals CRM</h1>
          <p style={{ color: "var(--text-secondary)" }}>Track sponsorship pipelines, payouts, contracts, and payment completion status.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Close Form" : "➕ Log New Brand Deal"}
        </button>
      </div>

      {/* Add Deal Form */}
      {showAddForm && (
        <div className="glass-premium animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Log Sponsorship Campaign</h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Campaign Title</label>
              <input type="text" placeholder="e.g. 60s Dedicated Video Integration" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Brand Name</label>
              <input type="text" placeholder="e.g. NordVPN" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Sponsorship Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="YouTube">YouTube</option>
                <option value="Twitch">Twitch</option>
                <option value="Kick">Kick</option>
                <option value="TikTok">TikTok</option>
                <option value="Twitter/X">Twitter/X</option>
                <option value="Multi-Platform">Multi-Platform</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Payout Value (USD)</label>
              <input type="number" placeholder="e.g. 3500" value={payout} onChange={(e) => setPayout(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Initial Stage</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as BrandDeal["status"])}>
                <option value="negotiating">Negotiating</option>
                <option value="signed">Signed / Contract Out</option>
                <option value="completed">Completed / Invoiced</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Campaign Deadline / Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Log Brand Deal</button>
            </div>
          </form>
        </div>
      )}

      {/* CRM Deals Table */}
      <div className="glass-premium" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>Active Pipeline</h3>

        {brandDeals.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No deals logged. Start adding sponsorships to monitor payouts!</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Campaign & Brand</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Platform</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Payout</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Target Date</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", textAlign: "right" }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {brandDeals.map((deal) => (
                  <tr key={deal.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "var(--transition-fast)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{deal.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{deal.brand}</div>
                    </td>
                    <td style={{ padding: "16px", color: "var(--text-primary)", fontSize: "0.9rem" }}>{deal.platform}</td>
                    <td style={{ padding: "16px", fontWeight: 700, color: "var(--accent-green)", fontSize: "0.95rem" }}>${deal.payout.toLocaleString()}</td>
                    <td style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{deal.date}</td>
                    <td style={{ padding: "16px" }}>{getStatusBadge(deal.status)}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <select
                        value={deal.status}
                        onChange={(e) => updateBrandDealStatus(deal.id, e.target.value as BrandDeal["status"])}
                        style={{ width: "auto", padding: "6px 12px", fontSize: "0.85rem", borderRadius: "var(--radius-sm)" }}
                      >
                        <option value="negotiating">Negotiating</option>
                        <option value="signed">Signed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

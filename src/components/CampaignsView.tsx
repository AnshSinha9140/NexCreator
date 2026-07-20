"use client";

import React, { useState } from "react";
import { useApp, GlobalCampaign } from "../context/AppContext";

export const CampaignsView: React.FC = () => {
  const { globalCampaigns, addGlobalCampaign, addBrandDeal, currentUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [appliedCampaignIds, setAppliedCampaignIds] = useState<string[]>([]);

  // Add campaign form inputs (Admin only)
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [payout, setPayout] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !brand || !payout) return;

    addGlobalCampaign({
      title,
      brand,
      payout: Number(payout),
      description,
    });

    setTitle("");
    setBrand("");
    setPayout("");
    setDescription("");
    setShowAddForm(false);
  };

  const handleApply = (campaign: GlobalCampaign) => {
    // Add to creator's personal CRM deals
    addBrandDeal({
      title: campaign.title,
      brand: campaign.brand,
      platform: "YouTube", // Default platform
      payout: campaign.payout,
      status: "negotiating",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 10 days out
    });

    setAppliedCampaignIds([...appliedCampaignIds, campaign.id]);
    alert(`Successfully applied! "${campaign.title}" is now added to your Brand Deals CRM pipeline.`);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Global Sponsorship Board</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {currentUser?.isAdmin 
              ? "Publish network-wide sponsorship campaigns for your creators."
              : "Browse sponsorship opportunities and request to join campaigns."
            }
          </p>
        </div>
        {currentUser?.isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Close Form" : "➕ Post Campaign"}
          </button>
        )}
      </div>

      {/* Admin Add Campaign Panel */}
      {currentUser?.isAdmin && showAddForm && (
        <div className="glass-premium animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Publish Brand Sponsorship Spot</h3>
          <form onSubmit={handleCreateCampaign} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Campaign Title</label>
              <input type="text" placeholder="e.g. NordVPN Autumn Sponsorship Push" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Brand Name</label>
              <input type="text" placeholder="e.g. NordVPN" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Payout (USD)</label>
              <input type="number" placeholder="e.g. 4500" value={payout} onChange={(e) => setPayout(e.target.value)} required />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Deliverable Description</label>
              <textarea placeholder="e.g. 60-second dedicated spot on YouTube reviewing product. Spot must run in first 3 minutes of video." value={description} onChange={(e) => setDescription(e.target.value)} rows={3}></textarea>
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Post Campaign</button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {globalCampaigns.map((campaign) => {
          const hasApplied = appliedCampaignIds.includes(campaign.id);
          return (
            <div key={campaign.id} className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-purple)", fontWeight: 800, textTransform: "uppercase" }}>{campaign.brand}</span>
                  <span className="badge badge-verified" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>${campaign.payout.toLocaleString()}</span>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>{campaign.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", minHeight: "60px", lineHeight: "1.5" }}>{campaign.description}</p>
              </div>

              <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "16px", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>🔥 {campaign.spotsLeft} spots left</span>
                
                {!currentUser?.isAdmin && (
                  <button
                    onClick={() => handleApply(campaign)}
                    disabled={hasApplied}
                    className={hasApplied ? "btn btn-secondary" : "btn btn-primary"}
                    style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                  >
                    {hasApplied ? "✓ Applied" : "Join Campaign"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {globalCampaigns.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", gridColumn: "span 3", padding: "40px 0" }}>No global sponsorships currently available.</p>
        )}
      </div>
    </div>
  );
};

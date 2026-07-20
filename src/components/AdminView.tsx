"use client";

import React from "react";
import { useApp, User } from "../context/AppContext";

export const AdminView: React.FC = () => {
  const { usersList, updateUserStatus } = useApp();

  // Filter out the admin themselves
  const creators = usersList.filter((u) => !u.isAdmin);

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "verified":
        return <span className="badge badge-verified">Verified</span>;
      case "rejected":
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Admin Verification Portal</h1>
        <p style={{ color: "var(--text-secondary)" }}>Manage creator applications, check social links, and approve accounts.</p>
      </div>

      <div className="glass-premium" style={{ padding: "24px", overflow: "hidden" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>
          Registered Creator Applications ({creators.length})
        </h3>

        {creators.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No applications found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Creator Email</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>YouTube</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Twitch</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Kick</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((creator) => (
                  <tr key={creator.email} style={{ borderBottom: "1px solid var(--border-color)", transition: "var(--transition-fast)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "16px", color: "var(--text-primary)", fontWeight: 500 }}>{creator.email}</td>
                    
                    <td style={{ padding: "16px" }}>
                      {creator.youtubeLink ? (
                        <a href={creator.youtubeLink} target="_blank" rel="noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "none", fontSize: "0.85rem" }}>
                          Link ↗
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>-</span>
                      )}
                    </td>

                    <td style={{ padding: "16px" }}>
                      {creator.twitchLink ? (
                        <a href={creator.twitchLink} target="_blank" rel="noreferrer" style={{ color: "var(--accent-pink)", textDecoration: "none", fontSize: "0.85rem" }}>
                          Link ↗
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>-</span>
                      )}
                    </td>

                    <td style={{ padding: "16px" }}>
                      {creator.kickLink ? (
                        <a href={creator.kickLink} target="_blank" rel="noreferrer" style={{ color: "var(--accent-green)", textDecoration: "none", fontSize: "0.85rem" }}>
                          Link ↗
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>-</span>
                      )}
                    </td>

                    <td style={{ padding: "16px" }}>{getStatusBadge(creator.status)}</td>
                    
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        {creator.status !== "verified" && (
                          <button
                            onClick={() => updateUserStatus(creator.email, "verified")}
                            className="btn btn-success"
                            style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "var(--radius-sm)" }}
                          >
                            Approve
                          </button>
                        )}
                        {creator.status !== "rejected" && (
                          <button
                            onClick={() => updateUserStatus(creator.email, "rejected")}
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "var(--radius-sm)" }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
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

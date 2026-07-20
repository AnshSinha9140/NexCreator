"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const AuthView: React.FC = () => {
  const { loginUser, registerUser, usersList } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [youtube, setYoutube] = useState("");
  const [twitch, setTwitch] = useState("");
  const [kick, setKick] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }

    if (isLogin) {
      const success = loginUser(email);
      if (!success) {
        setError("User not found. Try 'admin@creatormanager.com' or register a new account.");
      }
    } else {
      const exists = usersList.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setError("Email is already registered.");
        return;
      }
      registerUser(email, {
        youtube: youtube.trim(),
        twitch: twitch.trim(),
        kick: kick.trim(),
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-premium animate-fade-in">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-pink) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" }}>
            CREATOR HUB
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Manage your content, sponsors, and workflow.
          </p>
        </div>

        <div style={{ display: "flex", background: "var(--bg-input)", padding: "4px", borderRadius: "var(--radius-md)", marginBottom: "28px" }}>
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            style={{
              flex: 1,
              padding: "10px",
              background: isLogin ? "var(--bg-sidebar)" : "transparent",
              color: isLogin ? "var(--text-primary)" : "var(--text-muted)",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s"
            }}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            style={{
              flex: 1,
              padding: "10px",
              background: !isLogin ? "var(--bg-sidebar)" : "transparent",
              color: !isLogin ? "var(--text-primary)" : "var(--text-muted)",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s"
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--accent-red)", color: "var(--accent-red)", padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "18px" }}>
              <h4 style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600, marginBottom: "4px" }}>
                Channel Links (for manual verification)
              </h4>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  YouTube Channel Link
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@yourchannel"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Twitch Channel Link
                </label>
                <input
                  type="url"
                  placeholder="https://twitch.tv/yourchannel"
                  value={twitch}
                  onChange={(e) => setTwitch(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Kick Channel Link
                </label>
                <input
                  type="url"
                  placeholder="https://kick.com/yourchannel"
                  value={kick}
                  onChange={(e) => setKick(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: "12px", width: "100%" }}>
            {isLogin ? "Sign In" : "Submit Request & Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {isLogin ? (
            <p>
              Demo admin login: <strong>admin@creatormanager.com</strong>
            </p>
          ) : (
            <p>Once registered, admins will manually verify your channels before dashboard unlock.</p>
          )}
        </div>
      </div>
    </div>
  );
};

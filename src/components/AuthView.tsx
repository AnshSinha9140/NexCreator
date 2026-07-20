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
    <div className="auth-container" style={{ padding: 0, overflow: "hidden" }}>
      {/* Dynamic Keyframes injected into DOM for Lottie-like complex animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes orbit-yt {
          0% { transform: rotate(0deg) translateX(90px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
        }
        @keyframes orbit-tw {
          0% { transform: rotate(120deg) translateX(90px) rotate(-120deg); }
          100% { transform: rotate(480deg) translateX(90px) rotate(-480deg); }
        }
        @keyframes orbit-kk {
          0% { transform: rotate(240deg) translateX(90px) rotate(-240deg); }
          100% { transform: rotate(600deg) translateX(90px) rotate(-600deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.95); opacity: 0.2; }
        }
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (max-width: 900px) {
          .auth-split-left { display: none !important; }
          .auth-split-right { width: 100% !important; max-width: 100% !important; }
        }
      `}</style>

      <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
        
        {/* Left Side: Playful & Professional Animation Panel */}
        <div className="auth-split-left" style={{
          flex: 1,
          background: "linear-gradient(-45deg, #090b11, #131726, #1b122e, #0c1824)",
          backgroundSize: "400% 400%",
          animation: "gradient-move 15s ease infinite",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          position: "relative",
          borderRight: "1px solid var(--border-color)",
          overflow: "hidden"
        }}>
          {/* Pulsing Backlight */}
          <div style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            background: "radial-gradient(circle, var(--glow-purple) 0%, transparent 70%)",
            borderRadius: "50%",
            zIndex: 1,
            animation: "pulse-ring 4s ease-in-out infinite"
          }}></div>

          {/* Animated SVG Illustration */}
          <div style={{ position: "relative", width: "240px", height: "240px", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            
            {/* Center Console Icon */}
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-pink) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px rgba(189, 92, 255, 0.4)",
              animation: "float 6s ease-in-out infinite",
              zIndex: 3
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>

            {/* Orbiting Youtube Channel Badge */}
            <div style={{
              position: "absolute",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#ff0000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(255, 0, 0, 0.4)",
              animation: "orbit-yt 12s linear infinite",
              zIndex: 2
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.002 3.002 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C6.482 20.5 12 20.5 12 20.5s7.518 0 9.388-.553a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>

            {/* Orbiting Twitch Channel Badge */}
            <div style={{
              position: "absolute",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#9146ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(145, 70, 255, 0.4)",
              animation: "orbit-tw 12s linear infinite",
              zIndex: 2
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
            </div>

            {/* Orbiting Kick Channel Badge */}
            <div style={{
              position: "absolute",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#53fc18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(83, 252, 24, 0.4)",
              animation: "orbit-kk 12s linear infinite",
              zIndex: 2
            }}>
              <span style={{ color: "#000", fontWeight: 900, fontSize: "1.1rem", fontFamily: "sans-serif", transform: "translateY(-1px)" }}>K</span>
            </div>

          </div>

          {/* Marketing Copy */}
          <div style={{ marginTop: "40px", textAlign: "center", zIndex: 2, maxWidth: "400px" }}>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
              Level Up Your Content & Streams
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              Plan your publishing calendar, schedule your next big stream, organize editor tasks, and track sponsorships all in one professional yet playful dashboard.
            </p>
          </div>
        </div>

        {/* Right Side: The Sign In / Sign Up Form */}
        <div className="auth-split-right" style={{
          width: "520px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px",
          background: "var(--bg-main)",
          position: "relative"
        }}>
          <div className="auth-card glass-premium animate-fade-in" style={{ padding: "32px", border: "none", background: "transparent", boxShadow: "none" }}>
            
            <div style={{ textAlign: "center", marginBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <img src="/logo.png" alt="NexCreator Logo" style={{ width: "60px", height: "60px", borderRadius: "14px", marginBottom: "4px", boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }} />
              <h2 style={{ fontSize: "2.1rem", fontWeight: 900, background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-pink) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                NexCreator
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Please sign in or request access to enter the manager.
              </p>
            </div>

            <div style={{ display: "flex", background: "var(--bg-input)", padding: "4px", borderRadius: "var(--radius-md)", marginBottom: "24px" }}>
              <button
                onClick={() => { setIsLogin(true); setError(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: isLogin ? "var(--bg-sidebar)" : "transparent",
                  color: isLogin ? "var(--text-primary)" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "0.2s"
                }}
              >
                Log In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: !isLogin ? "var(--bg-sidebar)" : "transparent",
                  color: !isLogin ? "var(--text-primary)" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "0.2s"
                }}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div style={{ background: "rgba(248, 113, 113, 0.08)", border: "2px solid var(--accent-red)", color: "var(--accent-red)", padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "0.85rem", fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="creator@hub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 700, marginBottom: "4px" }}>
                    🔗 Channel Links
                  </h4>
                  <div>
                    <input
                      type="url"
                      placeholder="YouTube URL"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="Twitch URL"
                      value={twitch}
                      onChange={(e) => setTwitch(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="Kick URL"
                      value={kick}
                      onChange={(e) => setKick(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ marginTop: "8px", width: "100%" }}>
                {isLogin ? "Sign In" : "Request Channel Verification"}
              </button>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {isLogin ? (
                <p>
                  🔑 Demo admin login: <strong style={{ color: "var(--text-secondary)" }}>admin@creatormanager.com</strong>
                </p>
              ) : (
                <p>Your request goes to admins for approval before unlocking dashboards.</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

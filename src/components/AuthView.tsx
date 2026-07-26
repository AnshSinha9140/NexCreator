"use client";

import React, { useState } from "react";
import Link from "next/link";
import { validateLogin, validateSignup } from "@/lib/authValidation";

interface AuthViewProps {
  initialMode?: "login" | "signup";
  onSuccess?: (user: any, redirectTo: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = "login",
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Signup State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setFormErrors({});

    const validation = validateLogin({ email: loginEmail, password: loginPassword });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          rememberMe,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "Failed to log in. Please check your credentials.";
        setApiError(errorMsg);
        return;
      }

      localStorage.setItem("cm_current_user", JSON.stringify(data.user));
      if (onSuccess) {
        onSuccess(data.user, data.redirectTo || "/dashboard");
      } else {
        window.location.href = data.redirectTo || "/dashboard";
      }
    } catch (err: any) {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setFormErrors({});

    const validation = validateSignup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "Failed to complete registration.";
        setApiError(errorMsg);
        return;
      }

      localStorage.setItem("cm_current_user", JSON.stringify(data.user));
      if (onSuccess) {
        onSuccess(data.user, data.redirectTo || "/onboarding");
      } else {
        window.location.href = data.redirectTo || "/onboarding";
      }
    } catch (err: any) {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        background: "#060810",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ─── Left Branding Panel (Linear / Vercel Dark Aesthetic) ────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "between",
          padding: "48px 64px",
          background: "radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.12) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), #080b14",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          position: "relative",
        }}
      >
        {/* Top Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "18px",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(168, 85, 247, 0.4)",
            }}
          >
            N
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc", lineHeight: 1.1 }}>
              NexCreator
            </div>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#a855f7", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Creator Intelligence Platform
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup Element */}
        <div
          style={{
            margin: "auto 0",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "99px",
              background: "rgba(168, 85, 247, 0.1)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              color: "#c084fc",
              fontSize: "11px",
              fontWeight: "700",
              fontFamily: "'JetBrains Mono', monospace",
              width: "fit-content",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            The Bloomberg Terminal for Creators
          </div>

          <h1
            style={{
              fontSize: "40px",
              fontWeight: "900",
              color: "#f8fafc",
              lineHeight: 1.15,
              letterSpacing: "-1px",
            }}
          >
            Turn Live Stream Data Into Instant Growth.
          </h1>

          <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: 1.6 }}>
            Real-time chat sentiment analysis, AI stream producer recommendations, automated clip candidate detection, and multi-platform creator analytics.
          </p>

          {/* Feature Highlights */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
            {[
              { title: "Live Pulse & Sentiment Engine", desc: "Track community hype, retention & chat velocity live." },
              { title: "AI Creator Producer", desc: "Instant real-time action recommendations during streams." },
              { title: "Sponsor & Content Pipeline", desc: "Manage brand deals, deliverables & editing tasks seamlessly." },
            ].map((feat, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  ✓
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{feat.title}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{feat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: "12px", color: "#475569" }}>
          © 2026 NexCreator. Enterprise Grade Intelligence for Streamers & YouTubers.
        </div>
      </div>

      {/* ─── Right Form Panel (Linear/Stripe Form Redesign) ───────────── */}
      <div
        style={{
          width: "540px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 56px",
          background: "#060810",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: "8px" }}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              {mode === "login"
                ? "Enter your credentials to access your creator workspace."
                : "Get started with AI-powered creator analytics in minutes."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "10px",
              padding: "4px",
              marginBottom: "24px",
            }}
          >
            <button
              onClick={() => { setMode("login"); setApiError(""); setFormErrors({}); }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "7px",
                border: "none",
                background: mode === "login" ? "rgba(168, 85, 247, 0.15)" : "transparent",
                color: mode === "login" ? "#c084fc" : "#64748b",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setApiError(""); setFormErrors({}); }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "7px",
                border: "none",
                background: mode === "signup" ? "rgba(168, 85, 247, 0.15)" : "transparent",
                color: mode === "signup" ? "#c084fc" : "#64748b",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Sign Up
            </button>
          </div>

          {/* API Global Error */}
          {apiError && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(244, 63, 94, 0.1)",
                border: "1px solid rgba(244, 63, 94, 0.25)",
                color: "#fb7185",
                fontSize: "13px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          {/* ─── LOGIN FORM ───────────────────────────────────────────── */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    borderColor: formErrors.email ? "rgba(244, 63, 94, 0.5)" : undefined,
                  }}
                />
                {formErrors.email && (
                  <span style={{ fontSize: "11px", color: "#fb7185", marginTop: "4px", display: "block" }}>
                    {formErrors.email}
                  </span>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#a855f7",
                      fontSize: "11px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    borderColor: formErrors.password ? "rgba(244, 63, 94, 0.5)" : undefined,
                  }}
                />
                {formErrors.password && (
                  <span style={{ fontSize: "11px", color: "#fb7185", marginTop: "4px", display: "block" }}>
                    {formErrors.password}
                  </span>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#a855f7", cursor: "pointer" }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: "12px", color: "#94a3b8", cursor: "pointer" }}>
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  marginTop: "8px",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "14px", height: "14px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    Signing in...
                  </span>
                ) : (
                  "Sign In to Workspace →"
                )}
              </button>
            </form>
          ) : (
            /* ─── SIGNUP FORM ───────────────────────────────────────────── */
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  style={{
                    borderColor: formErrors.name ? "rgba(244, 63, 94, 0.5)" : undefined,
                  }}
                />
                {formErrors.name && (
                  <span style={{ fontSize: "11px", color: "#fb7185", marginTop: "4px", display: "block" }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="alex@creator.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  style={{
                    borderColor: formErrors.email ? "rgba(244, 63, 94, 0.5)" : undefined,
                  }}
                />
                {formErrors.email && (
                  <span style={{ fontSize: "11px", color: "#fb7185", marginTop: "4px", display: "block" }}>
                    {formErrors.email}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="At least 8 chars (1 upper, 1 lower, 1 num)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  style={{
                    borderColor: formErrors.password ? "rgba(244, 63, 94, 0.5)" : undefined,
                  }}
                />
                {formErrors.password && (
                  <span style={{ fontSize: "11px", color: "#fb7185", marginTop: "4px", display: "block" }}>
                    {formErrors.password}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    borderColor: formErrors.confirmPassword ? "rgba(244, 63, 94, 0.5)" : undefined,
                  }}
                />
                {formErrors.confirmPassword && (
                  <span style={{ fontSize: "11px", color: "#fb7185", marginTop: "4px", display: "block" }}>
                    {formErrors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  marginTop: "8px",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "14px", height: "14px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    Creating account...
                  </span>
                ) : (
                  "Create Creator Account →"
                )}
              </button>
            </form>
          )}

          {/* Bottom Switcher CTA */}
          <div style={{ marginTop: "28px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => { setMode("signup"); setApiError(""); setFormErrors({}); }}
                  style={{ background: "none", border: "none", color: "#a855f7", fontWeight: "600", cursor: "pointer" }}
                >
                  Sign up free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setApiError(""); setFormErrors({}); }}
                  style={{ background: "none", border: "none", color: "#a855f7", fontWeight: "600", cursor: "pointer" }}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Forgot Password UI-Only Modal ───────────────────────────────── */}
      {showForgotPasswordModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#0b0d16",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc", marginBottom: "8px" }}>
              Reset your password
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Enter your email address and we'll send you a password reset link.
            </p>

            {forgotSuccess ? (
              <div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#34d399", fontSize: "13px", marginBottom: "20px" }}>
                  ✓ Password reset link sent to <strong>{forgotEmail}</strong>. Please check your inbox.
                </div>
                <button
                  onClick={() => { setShowForgotPasswordModal(false); setForgotSuccess(false); setForgotEmail(""); }}
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

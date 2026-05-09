"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 9, fontSize: 14,
    background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--fg)",
    outline: "none", transition: "border-color 0.15s", fontFamily: "var(--font)",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      {/* Left */}
      <div style={{
        width: 440, flexShrink: 0, padding: 48, display: "flex", flexDirection: "column",
        justifyContent: "space-between", borderRight: "1px solid var(--line)", background: "var(--bg-1)",
        position: "relative", overflow: "hidden",
      }} className="hidden lg:flex">
        <div style={{
          position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,216,121,0.08), transparent 70%)",
          pointerEvents: "none",
        }} />
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ width: 26, height: 26, borderRadius: 6, background: "var(--green)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>T</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em" }}>TRANSLTR</span>
        </Link>
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Speech translated.<br />
            <span style={{ background: "linear-gradient(90deg, var(--green), #00ffaa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Instantly.
            </span>
          </h2>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            {["Unlimited translations on Pro", "Two-way conversation mode", "Projector view for events", "All prices in Nigerian Naira"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "var(--fg-2)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--fg-3)" }}>© {new Date().getFullYear()} TRANSLTR</p>
      </div>

      {/* Right */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 360 }}>
          <Link href="/" className="lg:hidden" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 40 }}>
            <span style={{ width: 26, height: 26, borderRadius: 6, background: "var(--green)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>T</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)" }}>TRANSLTR</span>
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Welcome back</h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "var(--fg-2)" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>Sign up free</Link>
          </p>

          <form onSubmit={submit} style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-3)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--green)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--line)")} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}>Forgot?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--green)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--line)")} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--fg-3)", padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px", borderRadius: 9, fontSize: 14, fontWeight: 700,
                background: "var(--green)", color: "#000", border: "none", cursor: "pointer",
                opacity: loading ? 0.7 : 1, transition: "opacity 0.15s", marginTop: 4,
              }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ fontSize: 12, color: "var(--fg-3)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <button type="button"
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "11px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer",
              border: "1px solid var(--line)", background: "var(--bg-2)", color: "var(--fg)", transition: "border-color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--line-2)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Mic } from "lucide-react";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // auth wired up next sprint
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{ borderRight: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div className="absolute inset-0 grid-lines opacity-60 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom left, rgba(0,214,143,0.07), transparent 60%)" }} />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>T</div>
          <span className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>TRANSLTR</span>
        </Link>

        <div className="relative space-y-8">
          <div className="space-y-4">
            <span className="label" style={{ color: "var(--accent)" }}>● Real-time · No API key · Browser-native</span>
            <h2 className="text-3xl font-bold tracking-tighter leading-tight"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
              Speech translated.<br />
              <span className="brand-gradient">Instantly.</span>
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Real-time speech-to-speech translation between English, Tiv, and Idoma — built for Benue State.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Unlimited translations on Pro",
              "Two-way conversation mode",
              "Projector view for events",
              "Full session analytics",
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative label">© {new Date().getFullYear()} TRANSLTR</p>
      </div>

      {/* ── Right panel / form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
          className="w-full max-w-sm space-y-8">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>T</div>
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>TRANSLTR</span>
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "var(--accent)" }} className="hover:underline">Sign up free</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--border-default)"}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="label hover:underline" style={{ color: "var(--accent)" }}>
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input id="password" type={showPw ? "text" : "password"} required placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border-default)"}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            <span className="label">or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
          </div>

          <button type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)", background: "var(--bg-surface)", fontFamily: "var(--font-body)" }}>
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

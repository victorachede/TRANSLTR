"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, LayoutDashboard, ExternalLink, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/projector") return null;

  const navLinks = [
    { href: "/translator", label: "Translator", icon: Mic },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(6,6,6,0.85)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}
            >T</div>
            <span className="text-sm font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              TRANSLTR
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${active ? "nav-dot" : ""}`}
                  style={{
                    fontFamily: "var(--font-body)",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    background: active ? "var(--bg-elevated)" : "transparent",
                    border: active ? "1px solid var(--border-default)" : "1px solid transparent",
                  }}>
                  <Icon size={12} />{label}
                </Link>
              );
            })}

            <Link href="/projector" target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ml-1"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.05em", border: "1px solid var(--border-subtle)" }}>
              <ExternalLink size={10} />LIVE VIEW
            </Link>

            <div style={{ width: "1px", height: "20px", background: "var(--border-subtle)", margin: "0 8px" }} />

            <Link href="/pricing"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors"
              style={{
                color: pathname === "/pricing" ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                border: "1px solid transparent",
              }}>
              Pricing
            </Link>

            <Link href="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)", marginLeft: "4px" }}>
              <LogIn size={11} />Sign in
            </Link>
          </nav>

          {/* Mobile: sign in + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>
              <LogIn size={11} />Sign in
            </Link>
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center justify-center w-8 h-8 rounded-md transition-colors"
              style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}
              aria-label="Toggle menu">
              {open ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 flex flex-col"
            style={{
              background: "rgba(6,6,6,0.97)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid var(--border-default)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors"
                  style={{
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: active ? "var(--bg-elevated)" : "transparent",
                  }}>
                  <Icon size={14} />{label}
                </Link>
              );
            })}
            <Link href="/pricing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors"
              style={{
                color: pathname === "/pricing" ? "var(--accent)" : "var(--text-secondary)",
                borderBottom: "1px solid var(--border-subtle)",
              }}>
              Pricing
            </Link>
            <Link href="/projector" target="_blank"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-6 py-4 text-sm transition-colors"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
              <ExternalLink size={13} />Open Projector view
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, LayoutDashboard, ExternalLink, LogIn, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/projector") return null;

  const links = [
    { href: "/translator", label: "Translator", icon: Mic },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          background: scrolled ? "rgba(249,248,244,0.92)" : "rgba(249,248,244,0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: scrolled ? "1px solid var(--border-default)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-95"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-display)", fontStyle: "italic" }}
            >T</div>
            <span className="text-sm font-bold tracking-tight hidden sm:block" style={{ fontFamily: "var(--font-body)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              TRANSLTR
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    background: active ? "var(--accent-dim)" : "transparent",
                    fontFamily: "var(--font-body)",
                  }}>
                  <Icon size={12} />{label}
                </Link>
              );
            })}

            <Link href="/projector" target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ml-1"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.04em" }}>
              <ExternalLink size={10} />LIVE VIEW
            </Link>

            <div style={{ width: "1px", height: "18px", background: "var(--border-default)", margin: "0 6px" }} />

            <Link href="/pricing"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                color: pathname === "/pricing" ? "var(--accent)" : "var(--text-secondary)",
                background: pathname === "/pricing" ? "var(--accent-dim)" : "transparent",
              }}>
              Pricing
            </Link>

            <Link href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-[0.97] ml-1"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)" }}>
              <LogIn size={11} />Sign in
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-primary)", background: open ? "var(--bg-elevated)" : "transparent" }}
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.15)", top: "56px" }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed left-0 right-0 z-40 md:hidden px-4 pb-4"
              style={{ top: "57px" }}
            >
              <div className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
                {[...links, { href: "/pricing", label: "Pricing", icon: null }, { href: "/projector", label: "Live View ↗", icon: null }].map(({ href, label, icon: Icon }, i) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 px-5 py-4 text-sm font-semibold transition-colors"
                    style={{
                      color: pathname === href ? "var(--accent)" : "var(--text-primary)",
                      background: pathname === href ? "var(--accent-dim)" : "transparent",
                      borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none",
                    }}>
                    {Icon && <Icon size={15} style={{ color: "var(--text-tertiary)" }} />}
                    {label}
                  </Link>
                ))}
                <div className="p-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <Link href="/login"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    <LogIn size={14} />Sign in
                  </Link>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

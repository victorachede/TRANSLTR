"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/translator", label: "Translator" },
  { href: "/dashboard",  label: "Dashboard"  },
  { href: "/pricing",    label: "Pricing"     },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (path === "/projector") return null;

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
          background: scrolled ? "rgba(8,8,8,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{
              width: 26, height: 26, borderRadius: 6,
              background: "var(--green)", color: "#000",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em",
            }}>T</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em" }}>TRANSLTR</span>
          </Link>

          {/* Desktop */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
            {LINKS.map(({ href, label }) => {
              const active = path === href;
              return (
                <Link key={href} href={href} style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: active ? "var(--fg)" : "var(--fg-2)",
                  background: active ? "var(--bg-2)" : "transparent",
                  border: active ? "1px solid var(--line)" : "1px solid transparent",
                  textDecoration: "none", transition: "all 0.15s",
                }}>
                  {label}
                </Link>
              );
            })}
            <Link href="/projector" target="_blank" style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              color: "var(--fg-3)", textDecoration: "none", letterSpacing: "0.04em",
              marginLeft: 4,
            }}>
              LIVE ↗
            </Link>
            <div style={{ width: 1, height: 18, background: "var(--line)", margin: "0 8px" }} />
            <Link href="/login" style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: "#000", background: "var(--green)", textDecoration: "none",
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              Sign in
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setOpen(o => !o)}
            style={{ background: "none", border: "none", color: "var(--fg-2)", cursor: "pointer", padding: 4 }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 md:hidden" style={{ top: 56, background: "rgba(0,0,0,0.6)", zIndex: 40 }}
              onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-x-0 md:hidden"
              style={{ top: 57, zIndex: 41, padding: "0 16px 16px" }}>
              <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                {LINKS.map(({ href, label }, i) => (
                  <Link key={href} href={href} style={{
                    display: "block", padding: "14px 20px", fontSize: 15, fontWeight: 500,
                    color: path === href ? "var(--green)" : "var(--fg)",
                    borderBottom: i < LINKS.length - 1 ? "1px solid var(--line)" : "none",
                    textDecoration: "none",
                  }}>{label}</Link>
                ))}
                <div style={{ padding: 12 }}>
                  <Link href="/login" style={{
                    display: "block", textAlign: "center", padding: "12px", borderRadius: 8,
                    background: "var(--green)", color: "#000", fontSize: 14, fontWeight: 700,
                    textDecoration: "none",
                  }}>Sign in</Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

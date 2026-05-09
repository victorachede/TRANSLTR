"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Zap } from "lucide-react";

const pop: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const fmt = (n: number) => n === 0 ? "₦0" : `₦${n.toLocaleString("en-NG")}`;

const PLANS = [
  {
    id: "free", name: "Free",
    price: { monthly: 0, annual: 0 },
    desc: "For personal use and exploration.",
    cta: "Start free", href: "/register", featured: false,
    features: ["Solo translation mode", "English ↔ Tiv & Idoma", "50 translations / day", "Session history (last 20)", "Browser-native — no uploads"],
    missing: ["Conversation mode", "Projector view", "Full analytics", "Priority support"],
  },
  {
    id: "pro", name: "Pro",
    price: { monthly: 7500, annual: 5800 },
    desc: "For individuals who translate every day.",
    cta: "Start Pro trial", href: "/register?plan=pro", featured: true,
    badge: "Most popular",
    features: ["Everything in Free", "Unlimited translations", "Conversation mode", "Projector view", "Full dashboard & analytics", "CSV export", "Email support"],
    missing: ["Team workspace", "Admin dashboard"],
  },
  {
    id: "team", name: "Team",
    price: { monthly: 25000, annual: 19500 },
    desc: "For organisations, clinics, and schools.",
    cta: "Contact us", href: "mailto:hello@transltr.app", featured: false,
    features: ["Everything in Pro", "Up to 10 members", "Shared history", "Admin dashboard", "Custom language pairs", "Priority support", "SLA"],
    missing: [],
  },
];

const FAQ = [
  { q: "Do I need a credit card to start?",  a: "No. The Free plan requires zero payment details." },
  { q: "Are prices really in Naira?",         a: "Yes — 100%. Built for Benue State. All prices in NGN." },
  { q: "What counts as one translation?",     a: "Each mic press that returns a result counts as one." },
  { q: "Can I switch plans at any time?",     a: "Yes. Upgrade or downgrade instantly with prorated credits." },
  { q: "Is my voice stored anywhere?",        a: "Never. Audio stays in your browser. Nothing is uploaded." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 56 }}>
      {/* Header */}
      <section style={{ padding: "80px 24px 64px", textAlign: "center", position: "relative" }}>
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,216,121,0.06), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Pricing
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5 }}
            style={{ marginTop: 16, fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            Simple, honest pricing.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ marginTop: 16, fontSize: 16, color: "var(--fg-2)", maxWidth: 400, margin: "16px auto 0" }}>
            All prices in Nigerian Naira. No hidden fees. No dollar conversion surprises.
          </motion.p>
          {/* Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ marginTop: 32, display: "inline-flex", padding: 4, borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg-1)", gap: 4 }}>
            {([false, true] as boolean[]).map(isAnnual => (
              <button key={String(isAnnual)} onClick={() => setAnnual(isAnnual)}
                style={{
                  padding: "8px 20px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: "none", transition: "all 0.15s",
                  background: annual === isAnnual ? "var(--bg-3)" : "transparent",
                  color: annual === isAnnual ? "var(--fg)" : "var(--fg-3)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                {isAnnual && <Zap size={11} />}
                {isAnnual ? "Annual" : "Monthly"}
                {isAnnual && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 100, background: "var(--green)", color: "#000" }}>−23%</span>
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: "0 24px 80px" }}>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {PLANS.map(plan => (
            <motion.div key={plan.id} variants={pop}
              style={{
                position: "relative", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column",
                border: plan.featured ? "1px solid var(--green-line)" : "1px solid var(--line)",
                background: plan.featured ? "var(--green-dim)" : "var(--bg-1)",
                boxShadow: plan.featured ? "0 0 40px rgba(0,216,121,0.08)" : "none",
              }}>
              {plan.badge && (
                <span style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  padding: "3px 12px", borderRadius: 100, background: "var(--green)", color: "#000",
                }}>{plan.badge}</span>
              )}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: plan.featured ? "var(--green)" : "var(--fg-3)" }}>
                  {plan.name}
                </p>
                <div style={{ marginTop: 8, display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {fmt(annual ? plan.price.annual : plan.price.monthly)}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span style={{ fontSize: 13, color: "var(--fg-3)", marginBottom: 6 }}>/mo</span>
                  )}
                </div>
                <p style={{ marginTop: 6, fontSize: 13, color: "var(--fg-2)" }}>{plan.desc}</p>
              </div>

              <div style={{ marginTop: 24, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={13} color={plan.featured ? "var(--green)" : "var(--fg-2)"} style={{ marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--fg)" }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.25 }}>
                    <div style={{ width: 13, height: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ width: 8, height: 1, background: "var(--fg-3)" }} />
                    </div>
                    <span style={{ fontSize: 13, color: "var(--fg-3)" }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href={plan.href}
                style={{
                  marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  textDecoration: "none", transition: "opacity 0.15s",
                  background: plan.featured ? "var(--green)" : "var(--bg-3)",
                  color: plan.featured ? "#000" : "var(--fg)",
                  border: plan.featured ? "none" : "1px solid var(--line)",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                {plan.cta} <ArrowRight size={13} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "64px 24px 80px", borderTop: "1px solid var(--line)", background: "var(--bg-1)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase" }}>FAQ</p>
          <h2 style={{ marginTop: 12, fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em" }}>Common questions.</h2>
          <div style={{ marginTop: 40 }}>
            {FAQ.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{ paddingTop: 24, marginTop: 24, borderTop: "1px solid var(--line)" }}>
                <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{f.q}</p>
                <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: "var(--fg-2)" }}>{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

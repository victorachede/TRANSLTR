"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Mic, Zap } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    tagline: "For personal use and exploration.",
    accent: false,
    cta: "Start for free",
    href: "/register",
    features: [
      "Solo translation mode",
      "English ↔ Tiv & Idoma",
      "50 translations / day",
      "Session history (last 20)",
      "Browser-native — no uploads",
    ],
    missing: ["Conversation mode", "Projector view", "Full dashboard analytics", "Priority support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 7500, annual: 5800 },
    tagline: "For individuals who translate every day.",
    accent: true,
    cta: "Start Pro trial",
    href: "/register?plan=pro",
    badge: "Most popular",
    features: [
      "Everything in Free",
      "Unlimited translations",
      "Conversation mode",
      "Projector view",
      "Full dashboard & analytics",
      "Translation export (CSV)",
      "Email support",
    ],
    missing: ["Team workspace", "Priority support"],
  },
  {
    id: "team",
    name: "Team",
    price: { monthly: 25000, annual: 19500 },
    tagline: "For organisations, clinics, and schools.",
    accent: false,
    cta: "Contact us",
    href: "mailto:hello@transltr.app",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared translation history",
      "Admin dashboard",
      "Custom language pairs",
      "Priority support",
      "SLA guarantee",
    ],
    missing: [],
  },
];

function fmt(n: number) {
  if (n === 0) return "₦0";
  return `₦${n.toLocaleString("en-NG")}`;
}

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen pt-14" style={{ background: "var(--bg-base)" }}>
      {/* ── Header ── */}
      <section className="relative py-24 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-lines pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, rgba(13,92,58,0.05), transparent 70%)" }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="label" style={{ color: "var(--accent)" }}>
            Pricing
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22,1,0.36,1] }}
            className="mt-4 text-5xl md:text-6xl leading-tight"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.04em" }}>
            Simple, honest<br />
            <span className="brand-gradient">pricing.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="mt-5 text-base max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--text-secondary)" }}>
            Start free. Upgrade when you need more. All prices in Nigerian Naira. No hidden fees.
          </motion.p>

          {/* Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="mt-8 inline-flex items-center gap-1 p-1 rounded-xl"
            style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
            <button onClick={() => setAnnual(false)}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: !annual ? "var(--bg-elevated)" : "transparent", color: !annual ? "var(--text-primary)" : "var(--text-tertiary)", border: !annual ? "1px solid var(--border-default)" : "1px solid transparent" }}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: annual ? "var(--accent-dim)" : "transparent", color: annual ? "var(--accent)" : "var(--text-tertiary)", border: annual ? "1px solid var(--accent-border)" : "1px solid transparent" }}>
              <Zap size={10} />Annual
              <span className="lang-badge" style={{ background: "var(--accent)", color: "#fff", marginLeft: 4 }}>−23%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="px-5 pb-28">
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <motion.div key={plan.id} variants={item}
              className="card-lift relative flex flex-col h-full rounded-2xl p-8"
              style={{
                background: plan.accent ? "var(--accent)" : "var(--bg-surface)",
                border: `1px solid ${plan.accent ? "var(--accent)" : "var(--border-default)"}`,
              }}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="lang-badge" style={{ background: "var(--accent-warm)", color: "#fff", padding: "4px 12px" }}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-1 mb-8">
                <p className="text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-body)", color: plan.accent ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)" }}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1.5">
                  <span className="stat-num text-5xl" style={{ color: plan.accent ? "#fff" : "var(--text-primary)" }}>
                    {fmt(annual ? plan.price.annual : plan.price.monthly)}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-sm mb-1.5" style={{ color: plan.accent ? "rgba(255,255,255,0.6)" : "var(--text-tertiary)" }}>/ mo</span>
                  )}
                </div>
                <p className="text-xs leading-relaxed"
                  style={{ color: plan.accent ? "rgba(255,255,255,0.7)" : "var(--text-secondary)" }}>{plan.tagline}</p>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check size={13} style={{ color: plan.accent ? "#fff" : "var(--accent)", marginTop: 1, flexShrink: 0 }} />
                    <span className="text-xs leading-relaxed"
                      style={{ color: plan.accent ? "#fff" : "var(--text-primary)" }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-start gap-2.5 opacity-30">
                    <div className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                      <div className="w-2 h-px" style={{ background: plan.accent ? "#fff" : "var(--text-tertiary)" }} />
                    </div>
                    <span className="text-xs leading-relaxed" style={{ color: plan.accent ? "#fff" : "var(--text-tertiary)" }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link href={plan.href}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: plan.accent ? "#fff" : "var(--accent)",
                  color: plan.accent ? "var(--accent)" : "#fff",
                  fontFamily: "var(--font-body)",
                }}>
                {plan.cta} <ArrowRight size={13} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }} className="py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="label" style={{ color: "var(--accent)" }}>FAQ</span>
            <h2 className="mt-3 text-4xl leading-tight"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.04em" }}>Common questions.</h2>
          </motion.div>
          <div className="mt-12 space-y-8">
            {[
              { q: "Do I need a credit card to start?", a: "No. The Free plan requires no payment details. You only need billing info when you upgrade." },
              { q: "Are prices really in Naira?", a: "Yes — 100%. We built this for Benue State. All prices are in NGN with no dollar conversion surprises." },
              { q: "What counts as one 'translation'?", a: "Each time you press the mic and receive a translated result counts as one translation." },
              { q: "Can I switch plans at any time?", a: "Yes — upgrade or downgrade instantly. Prorated credits are applied automatically." },
              { q: "Is my voice data stored?", a: "Never. Audio is processed entirely in your browser via the Web Speech API. Nothing is uploaded." },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
                <p className="text-sm font-bold mb-2" style={{ fontFamily: "var(--font-body)", letterSpacing: "-0.01em" }}>{faq.q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-5 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.04em" }}>
            Start translating today.<br />
            <span className="brand-gradient">Free forever.</span>
          </h2>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold hover:opacity-90"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)" }}>
              <Mic size={14} />Create free account
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

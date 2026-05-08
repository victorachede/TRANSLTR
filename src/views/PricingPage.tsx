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
    price: { monthly: 9, annual: 7 },
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
    price: { monthly: 29, annual: 22 },
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

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay, ease: [0.22,1,0.36,1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen pt-14" style={{ background: "var(--bg-base)" }}>
      {/* ── Header ── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-100 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, rgba(0,214,143,0.06), transparent 70%)" }} />

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="label" style={{ color: "var(--accent)" }}>Pricing</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 text-5xl md:text-6xl font-bold tracking-tighter"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
            Simple, honest<br />
            <span className="brand-gradient">pricing.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="mt-5 text-base max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--text-secondary)" }}>
            Start free. Upgrade when you need more. No hidden fees, no surprise bills.
          </motion.p>

          {/* Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-full"
            style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
            <button onClick={() => setAnnual(false)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{ background: !annual ? "var(--bg-overlay)" : "transparent", color: !annual ? "var(--text-primary)" : "var(--text-secondary)" }}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={{ background: annual ? "var(--accent-dim)" : "transparent", color: annual ? "var(--accent)" : "var(--text-secondary)", border: annual ? "1px solid var(--accent-border)" : "1px solid transparent" }}>
              <Zap size={10} />Annual
              <span className="lang-badge" style={{ background: "var(--accent)", color: "var(--text-inverse)", marginLeft: 4 }}>-22%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="px-6 pb-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5 relative">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <div className="relative flex flex-col h-full rounded-xl p-8"
                style={{
                  background: plan.accent ? "var(--accent-dim)" : "var(--bg-surface)",
                  border: `1px solid ${plan.accent ? "var(--accent-border)" : "var(--border-subtle)"}`,
                  boxShadow: plan.accent ? "0 0 60px rgba(0,214,143,0.08)" : "none",
                }}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="lang-badge" style={{ background: "var(--accent)", color: "var(--text-inverse)", padding: "4px 12px" }}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-1 mb-8">
                  <p className="text-xs font-semibold" style={{ fontFamily: "var(--font-display)", color: plan.accent ? "var(--accent)" : "var(--text-secondary)" }}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1.5">
                    {plan.price.monthly === 0 ? (
                      <span className="stat-num text-5xl" style={{ color: "var(--text-primary)" }}>Free</span>
                    ) : (
                      <>
                        <span className="stat-num text-5xl" style={{ color: "var(--text-primary)" }}>
                          ${annual ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className="text-sm mb-1.5" style={{ color: "var(--text-tertiary)" }}>/ mo</span>
                        {annual && (
                          <span className="text-xs mb-2 ml-1" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>billed annually</span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{plan.tagline}</p>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check size={13} style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }} />
                      <span className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} className="flex items-start gap-2.5 opacity-30">
                      <div className="w-3 h-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-px" style={{ background: "var(--text-tertiary)" }} />
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href={plan.href}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: plan.accent ? "var(--accent)" : "var(--bg-elevated)",
                    color: plan.accent ? "var(--text-inverse)" : "var(--text-primary)",
                    border: plan.accent ? "none" : "1px solid var(--border-default)",
                    fontFamily: "var(--font-display)",
                  }}>
                  {plan.cta} <ArrowRight size={13} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ row ── */}
      <section style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }} className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <Reveal>
            <span className="label" style={{ color: "var(--accent)" }}>FAQ</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tighter" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
              Common questions.
            </h2>
          </Reveal>
          {[
            { q: "Do I need a credit card to start?", a: "No. The Free plan requires no payment details. You only need to provide billing info when you upgrade." },
            { q: "What counts as a 'translation'?", a: "Every time you press the mic and receive a translated result, that counts as one translation." },
            { q: "Can I switch plans at any time?", a: "Yes — upgrade or downgrade instantly. Prorated credits are applied automatically." },
            { q: "What languages are supported?", a: "Currently English, Tiv, and Idoma. More languages are on the roadmap." },
            { q: "Is my voice data stored anywhere?", a: "Never. Audio is processed entirely in your browser via the Web Speech API. Nothing is uploaded." },
          ].map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
                <p className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{faq.q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{faq.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl font-bold tracking-tighter mb-5"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
              Start translating today.<br />
              <span className="brand-gradient">Free forever.</span>
            </h2>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-sm font-semibold hover:opacity-90 active:scale-[0.98]"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>
              <Mic size={14} />Create free account
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

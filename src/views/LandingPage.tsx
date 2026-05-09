"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import Link from "next/link";
import { Mic, Globe2, Radio, Shield, BarChart2, MessageSquare, ArrowRight, Zap } from "lucide-react";

/* ── Framer Motion variants ── */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const pop: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ── Counter ── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView || to === 0) { setVal(to); return; }
    let n = 0;
    const step = to / 48;
    const id = setInterval(() => {
      n += step;
      if (n >= to) { setVal(to); clearInterval(id); return; }
      setVal(Math.round(n));
    }, 18);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Ticker phrases ── */
const TICKER = [
  { src: "Good morning",        tgt: "Tswen sha",    pair: "EN→TIV"   },
  { src: "How are you?",        tgt: "Agba ngu?",    pair: "EN→IDOMA" },
  { src: "U mba iŋ le",         tgt: "Thank you",    pair: "TIV→EN"   },
  { src: "Elewoyi",             tgt: "Good evening", pair: "IDOMA→EN" },
  { src: "Where are you going?",tgt: "Ieren ngu?",   pair: "EN→TIV"   },
  { src: "Oche ama",            tgt: "I am well",    pair: "IDOMA→EN" },
];

export default function LandingPage() {
  const tick = [...TICKER, ...TICKER];

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ─────────── HERO ─────────── */}
      <section style={{ position: "relative", padding: "140px 24px 100px", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 600, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,216,121,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px 4px 6px", borderRadius: 100,
              border: "1px solid var(--green-line)", background: "var(--green-dim)",
              fontSize: 12, fontWeight: 600, color: "var(--green)", letterSpacing: "0.02em",
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: "var(--green)", animation: "pulse 2s ease-in-out infinite",
              }} />
              Built for Benue State · English · Tiv · Idoma
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            style={{
              marginTop: 28, fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 800,
              letterSpacing: "-0.04em", lineHeight: 1.02, color: "var(--fg)",
              maxWidth: "14ch",
            }}
          >
            Speak any language.<br />
            <span style={{
              background: "linear-gradient(90deg, var(--green) 0%, #00ffaa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Be understood.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}
            style={{ marginTop: 24, fontSize: 17, lineHeight: 1.7, color: "var(--fg-2)", maxWidth: 480 }}
          >
            Real-time speech-to-speech translation between English, Tiv, and Idoma.
            No uploads, no API keys, no latency — just press and speak.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            <Link href="/translator" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "var(--green)", color: "#000", textDecoration: "none",
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              <Mic size={15} />Start translating free
            </Link>
            <Link href="/pricing" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              border: "1px solid var(--line-2)", color: "var(--fg-2)", textDecoration: "none",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line-2)"; e.currentTarget.style.color = "var(--fg-2)"; }}>
              View pricing <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Demo card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}
            style={{
              marginTop: 64, maxWidth: 520, borderRadius: 16, overflow: "hidden",
              border: "1px solid var(--line)", background: "var(--bg-1)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
              </div>
              <span style={{ fontSize: 11, color: "var(--fg-3)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 auto" }}>TRANSLTR · Live session</span>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { who: "A", text: "Good morning, how are you?", out: "Tswen sha, agba ngu?", pair: "EN → TIV", delay: 0.6 },
                { who: "B", text: "U mba iŋ le msen",           out: "Thank you very much",  pair: "TIV → EN", delay: 1.1 },
              ].map(m => (
                <motion.div key={m.who} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: m.delay, duration: 0.4 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: m.who === "A" ? "var(--green-dim)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${m.who === "A" ? "var(--green-line)" : "var(--line)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: m.who === "A" ? "var(--green)" : "var(--fg-2)",
                    }}>{m.who}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-2)" }}>{m.text}</p>
                      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 600, color: "var(--green)",
                          padding: "2px 10px", borderRadius: 100,
                          background: "var(--green-dim)", border: "1px solid var(--green-line)",
                        }}>{m.out}</span>
                        <span style={{ fontSize: 10, color: "var(--fg-3)", fontWeight: 600, letterSpacing: "0.06em" }}>{m.pair}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Pulsing bars */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}
                style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 16 }}>
                  {[0,1,2,3].map(i => (
                    <motion.div key={i} style={{ width: 3, borderRadius: 2, background: "var(--green)" }}
                      animate={{ height: ["4px","14px","4px"] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>Listening…</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────── TICKER ─────────── */}
      <div style={{ overflow: "hidden", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--bg-1)", padding: "14px 0" }}>
        <div className="marquee">
          {tick.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 32px", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-2)" }}>{t.src}</span>
              <span style={{ fontSize: 11, color: "var(--fg-3)" }}>→</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>{t.tgt}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                padding: "2px 8px", borderRadius: 100,
                border: "1px solid var(--line)", color: "var(--fg-3)",
              }}>{t.pair}</span>
              <div style={{ width: 1, height: 14, background: "var(--line)", margin: "0 8px" }} />
            </div>
          ))}
        </div>
      </div>

      {/* ─────────── STATS ─────────── */}
      <section style={{ padding: "80px 24px" }}>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          style={{
            maxWidth: 1100, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden",
          }}
          className="grid-cols-2 md:grid-cols-4"
        >
          {[
            { label: "Languages",         to: 3,   suffix: ""  },
            { label: "MB of voice uploaded", to: 0, suffix: ""  },
            { label: "Minutes to set up",    to: 0, suffix: ""  },
            { label: "Browser native",       to: 100, suffix: "%" },
          ].map((s, i) => (
            <motion.div key={s.label} variants={pop}
              style={{
                padding: "40px 24px", textAlign: "center",
                borderRight: i < 3 ? "1px solid var(--line)" : "none",
                background: "var(--bg-1)",
              }}>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--fg)", lineHeight: 1 }}>
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--fg-3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────── BENTO FEATURES ─────────── */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Features</p>
            <h2 style={{ marginTop: 12, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, maxWidth: "18ch" }}>
              Built for real conversations,<br />not just demos.
            </h2>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          >
            {/* Wide card */}
            <motion.div variants={pop}
              style={{
                gridColumn: "span 2", borderRadius: 16, padding: 32, position: "relative",
                border: "1px solid var(--line)", background: "var(--bg-1)", overflow: "hidden",
              }}>
              <div style={{
                position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0,216,121,0.08), transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--green-dim)", border: "1px solid var(--green-line)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Mic size={17} color="var(--green)" />
              </div>
              <h3 style={{ marginTop: 16, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Zero-upload, instant translation</h3>
              <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: "var(--fg-2)", maxWidth: "50ch" }}>
                Everything runs inside your browser using the Web Speech API. Your voice never leaves your device — no servers, no latency, no privacy concerns.
              </p>
            </motion.div>

            <motion.div variants={pop}
              style={{
                borderRadius: 16, padding: 28, border: "1px solid var(--line)", background: "var(--bg-1)",
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Shield size={17} color="var(--fg-3)" />
              </div>
              <h3 style={{ marginTop: 16, fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>100% private</h3>
              <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: "var(--fg-2)" }}>
                No accounts to start. No audio stored. No logs.
              </p>
            </motion.div>

            {[
              { icon: MessageSquare, title: "Conversation mode",   body: "Two speakers, two mics. Real back-and-forth translated live." },
              { icon: Radio,         title: "Projector view",      body: "Fullscreen display for events, clinics, and churches." },
              { icon: BarChart2,     title: "Session analytics",   body: "Track history, language pairs, and usage on your dashboard." },
              { icon: Globe2,        title: "3 languages, 1 app",  body: "English, Tiv, and Idoma — the heart of Benue State." },
            ].map(({ icon: Icon, title, body }) => (
              <motion.div key={title} variants={pop}
                style={{ borderRadius: 16, padding: 28, border: "1px solid var(--line)", background: "var(--bg-1)" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={17} color="var(--fg-3)" />
                </div>
                <h3 style={{ marginTop: 16, fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h3>
                <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: "var(--fg-2)" }}>{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase" }}>How it works</p>
            <h2 style={{ marginTop: 12, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Three steps. Zero friction.
            </h2>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 40 }}
            className="grid-cols-1 md:grid-cols-3">
            {[
              { n: "01", title: "Choose your languages", body: "Select source and target. Works with English, Tiv, and Idoma." },
              { n: "02", title: "Press mic and speak",   body: "Voice captured, processed entirely in-browser. No upload." },
              { n: "03", title: "Hear the translation",  body: "Translated speech plays back instantly in the target language." },
            ].map(s => (
              <motion.div key={s.n} variants={pop}>
                <span style={{ fontSize: 56, fontWeight: 800, color: "var(--bg-3)", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.n}</span>
                <h3 style={{ marginTop: 16, fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: "var(--fg-2)" }}>{s.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────── PRICING CTA ─────────── */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
              color: "var(--green)", border: "1px solid var(--green-line)", background: "var(--green-dim)",
            }}>
              <Zap size={11} />Pricing
            </span>
            <h2 style={{ marginTop: 20, fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Free forever.<br />
              <span style={{
                background: "linear-gradient(90deg, var(--green), #00ffaa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Upgrade when ready.</span>
            </h2>
            <p style={{ marginTop: 16, fontSize: 16, color: "var(--fg-2)", maxWidth: 440 }}>
              Plans start at ₦0. Pro from ₦7,500/mo. All prices in Nigerian Naira, no surprises.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: "var(--green)", color: "#000", textDecoration: "none",
              }}>
                <Mic size={15} />Create free account
              </Link>
              <Link href="/pricing" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                border: "1px solid var(--line-2)", color: "var(--fg-2)", textDecoration: "none",
              }}>
                Compare plans <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer style={{ padding: "32px 24px", borderTop: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 22, height: 22, borderRadius: 5, background: "var(--green)",
              color: "#000", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800,
            }}>T</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>TRANSLTR</span>
            <span style={{ fontSize: 12, color: "var(--fg-3)", marginLeft: 8 }}>Built for Benue State, Nigeria</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Translator", "/translator"], ["Pricing", "/pricing"], ["Sign in", "/login"]].map(([l, h]) => (
              <Link key={h} href={h} style={{ fontSize: 13, color: "var(--fg-3)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-3)")}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mic, Globe2, Radio, Shield, Zap, BarChart2, MessageSquare } from "lucide-react";

const TICKER = [
  { src: "Good morning", tgt: "Tswen sha", pair: "EN → TIV" },
  { src: "How are you?", tgt: "Agba ngu?", pair: "EN → IDOMA" },
  { src: "U mba iŋ le", tgt: "Thank you", pair: "TIV → EN" },
  { src: "Elewoyi", tgt: "Good evening", pair: "IDOMA → EN" },
  { src: "Where are you going?", tgt: "Ieren ngu?", pair: "EN → TIV" },
  { src: "Oche ama", tgt: "I am well", pair: "IDOMA → EN" },
];

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const val = useMotionValue(0);
  const spring = useSpring(val, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) val.set(to);
  }, [inView, to, val]);

  useEffect(() => {
    return spring.on("change", v => setDisplay(Math.round(v)));
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const FEATURES = [
  { icon: Mic, title: "No upload needed", body: "Everything runs in your browser via the Web Speech API. Your voice never leaves your device." },
  { icon: Globe2, title: "3 languages, 1 click", body: "Translate between English, Tiv, and Idoma — the primary languages of Benue State." },
  { icon: MessageSquare, title: "Conversation mode", body: "Two speakers, two mics. Real back-and-forth dialogue, translated as you go." },
  { icon: Radio, title: "Projector view", body: "Fullscreen display for events, ceremonies, and churches. Open it on any screen." },
  { icon: BarChart2, title: "Session analytics", body: "Track your translation history, language pairs, and usage patterns over time." },
  { icon: Shield, title: "100% private", body: "No accounts required to start. No data stored. No servers. Just your browser." },
];

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
};

export default function LandingPage() {
  const repeated = [...TICKER, ...TICKER];

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-lines pointer-events-none opacity-100" />
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(13,92,58,0.06) 0%, transparent 70%)" }} />

        <div className="relative max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <span className="label" style={{ color: "var(--accent)" }}>● Live · Browser-native · Benue State</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7, ease: [0.22,1,0.36,1] }}
            className="mt-5 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.03em", maxWidth: "14ch" }}
          >
            Speak Tiv.<br />
            Speak Idoma.<br />
            <span className="brand-gradient">Be heard.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="mt-7 text-base sm:text-lg leading-relaxed max-w-lg"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            Real-time speech-to-speech translation between English, Tiv, and Idoma.
            No uploads. No API keys. No internet required. Just press and speak.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/translator"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)" }}>
              <Mic size={14} />Start translating free
            </Link>
            <Link href="/pricing"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--bg-elevated)]"
              style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
              View pricing <ArrowRight size={13} />
            </Link>
          </motion.div>

          {/* Floating demo card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8, ease: [0.22,1,0.36,1] }}
            className="mt-16 rounded-2xl overflow-hidden max-w-xl"
            style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)", boxShadow: "0 20px 80px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
              <div className="flex gap-1.5">
                {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
              </div>
              <span className="label mx-auto" style={{ letterSpacing: "0.12em" }}>TRANSLTR — Live demo</span>
            </div>
            <div className="p-6 space-y-4">
              {[
                { who: "Speaker A", text: "Good morning, how are you?", translated: "Tswen sha, agba ngu?", pair: "EN → TIV", delay: 0.7 },
                { who: "Speaker B", text: "U mba iŋ le", translated: "Thank you very much", pair: "TIV → EN", delay: 1.1 },
              ].map((msg) => (
                <motion.div key={msg.who} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: msg.delay, duration: 0.5 }}>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ background: "var(--accent-dim)", color: "var(--accent)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                      {msg.who.split(" ")[1]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{msg.text}</p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="lang-badge" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>{msg.translated}</span>
                        <span className="label" style={{ fontSize: "0.6rem" }}>{msg.pair}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
                className="flex items-center gap-2 pt-2">
                <div className="flex items-center gap-1">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent)" }}
                      animate={{ scaleY: [1, 2.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
                <span className="label" style={{ color: "var(--accent)" }}>Listening…</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="overflow-hidden py-4" style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div className="marquee-inner">
          {repeated.map((t, i) => (
            <div key={i} className="flex items-center gap-4 px-8 whitespace-nowrap">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.src}</span>
              <ArrowRight size={12} style={{ color: "var(--text-tertiary)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{t.tgt}</span>
              <span className="lang-badge">{t.pair}</span>
              <span style={{ width: 1, height: 16, background: "var(--border-default)", display: "inline-block", margin: "0 8px" }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="py-20 px-5">
        <motion.div
          variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ border: "1px solid var(--border-default)", borderRadius: 16, overflow: "hidden", background: "var(--border-default)" }}
        >
          {[
            { label: "Languages", value: 3, suffix: "" },
            { label: "Latency", value: 0, suffix: "ms upload" },
            { label: "Setup required", value: 0, suffix: " minutes" },
            { label: "Browser native", value: 100, suffix: "%" },
          ].map((s) => (
            <motion.div key={s.label} variants={item}
              className="flex flex-col items-center justify-center py-10 px-6 text-center"
              style={{ background: "var(--bg-surface)" }}>
              <span className="stat-num text-4xl md:text-5xl" style={{ color: "var(--text-primary)" }}>
                <Counter to={s.value} suffix={s.suffix} />
              </span>
              <span className="label mt-2">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.span variants={item} className="label" style={{ color: "var(--accent)" }}>How it works</motion.span>
            <motion.h2 variants={item}
              className="mt-3 text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.03em", maxWidth: "16ch" }}>
              Three steps.<br />Zero friction.
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mt-14 grid md:grid-cols-3 gap-8"
          >
            {[
              { n: "01", title: "Open & choose languages", body: "Pick your source language and target language. No account needed." },
              { n: "02", title: "Press mic and speak", body: "Your voice is captured and processed entirely in your browser." },
              { n: "03", title: "Hear the translation", body: "The translated speech plays back instantly in the target language." },
            ].map((s) => (
              <motion.div key={s.n} variants={item} className="space-y-4">
                <span className="stat-num text-6xl" style={{ color: "var(--border-strong)" }}>{s.n}</span>
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-body)", letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-5" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.span variants={item} className="label" style={{ color: "var(--accent)" }}>Features</motion.span>
            <motion.h2 variants={item}
              className="mt-3 text-4xl md:text-5xl leading-tight"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.03em" }}>
              Built for real conversations.<br />
              <span className="brand-gradient">Not demos.</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mt-14 grid sm:grid-cols-2 md:grid-cols-3 gap-5"
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={item}
                className="card-lift p-6 rounded-xl space-y-3"
                style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
                  <f.icon size={16} style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="font-bold text-sm" style={{ letterSpacing: "-0.02em" }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="py-24 px-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.blockquote initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}>
            <p className="text-3xl md:text-4xl leading-snug"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
              &ldquo;Language is the road map of a culture. It tells you where its people come from and where they are going.&rdquo;
            </p>
            <cite className="label mt-6 block not-italic">Rita Mae Brown · adapted for Benue State</cite>
          </motion.blockquote>
        </div>
      </section>

      {/* ── Pricing teaser ── */}
      <section className="py-20 px-5" style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="label" style={{ color: "var(--accent)" }}>Pricing</span>
            <h2 className="mt-2 text-3xl md:text-4xl leading-tight"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.03em" }}>
              Free forever.<br />Upgrade when you&apos;re ready.
            </h2>
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              Plans start from ₦0. Pro from ₦7,500/mo. No hidden fees.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Link href="/pricing"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold hover:opacity-90 whitespace-nowrap"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)" }}>
              See all plans <ArrowRight size={13} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-100 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="relative max-w-2xl mx-auto space-y-6">
          <h2 className="text-5xl md:text-6xl leading-tight"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.04em" }}>
            Start speaking.<br />
            <span className="brand-gradient">Start connecting.</span>
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No sign-up required. Works on any modern browser.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/translator"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold hover:opacity-90"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)" }}>
              <Mic size={14} />Try it now — it&apos;s free
            </Link>
            <Link href="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold"
              style={{ border: "1px solid var(--border-default)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
              Create account <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 py-10" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-display)", fontStyle: "italic" }}>T</div>
            <span className="text-sm font-bold" style={{ fontFamily: "var(--font-body)", letterSpacing: "-0.02em" }}>TRANSLTR</span>
            <span className="label ml-2">Built for Benue State, Nigeria</span>
          </div>
          <div className="flex items-center gap-5">
            {[["Translator", "/translator"], ["Pricing", "/pricing"], ["Login", "/login"]].map(([l, h]) => (
              <Link key={h} href={h} className="label hover:text-[var(--text-primary)] transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

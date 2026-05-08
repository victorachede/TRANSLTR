
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Mic } from "lucide-react";

/* ─────────────────── Types & Data ─────────────────────────── */

const FEATURES = [
  { tag: "01", title: "Browser-native", desc: "No downloads. No sign-ups. Speech recognition and synthesis run entirely in your browser via the Web Speech API.", accent: false },
  { tag: "02", title: "English ↔ Tiv & Idoma", desc: "Built specifically for Benue State's indigenous languages — bridging English with Tiv and Idoma in real time.", accent: true },
  { tag: "03", title: "Conversation mode", desc: "Two speakers, two languages. Hold a fluid bilingual exchange without touching the device between turns.", accent: false },
  { tag: "04", title: "Projector view", desc: "Broadcast translations live to any large screen — built for events, lectures, clinics, and community gatherings.", accent: false },
  { tag: "05", title: "Zero latency uploads", desc: "Your audio never leaves the device. Translation happens via a free public API. Private by design.", accent: false },
  { tag: "06", title: "Session dashboard", desc: "Review every translation in your session — pair breakdowns, activity charts, and a searchable history table.", accent: false },
];

const LANGUAGES = [
  { code: "EN", name: "English", origin: "Global", speakers: "~1.5B", note: "Source & target language" },
  { code: "TV", name: "Tiv", origin: "Benue State, Nigeria", speakers: "~8M", note: "Benue-Congo family · Tonal" },
  { code: "ID", name: "Idoma", origin: "Southern Benue, Nigeria", speakers: "~1M", note: "Kwa family · Tonal" },
];

const HOW = [
  { n: "1", head: "Tap the mic", body: "Press record and speak in English, Tiv, or Idoma." },
  { n: "2", head: "Transcribed instantly", body: "Your browser captures and transcribes your voice in real time." },
  { n: "3", head: "Translated & spoken", body: "The translation appears and is read aloud in the target language." },
  { n: "4", head: "Broadcast it", body: "Open Projector view to display translations on any screen." },
];

/* ─────────────────── Animated counter ─────────────────────── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = end / (900 / 16);
    const t = setInterval(() => {
      n = Math.min(n + step, end);
      setV(Math.round(n));
      if (n >= end) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ─────────────────── Section header ───────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="label" style={{ color: "var(--accent)" }}>{children}</span>
  );
}

/* ─────────────────── Reveal wrapper ───────────────────────── */
function Reveal({ children, delay = 0, className = "", style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}>
      {children}
    </motion.div>
  );
}

/* ─────────────────── Page ──────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-28 px-6 overflow-hidden">
        {/* Grid background — very subtle */}
        <div className="absolute inset-0 grid-lines opacity-100 pointer-events-none" />
        {/* Gradient bloom — single, restrained */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, rgba(0,214,143,0.06) 0%, transparent 70%)" }} />

        <div className="relative max-w-6xl mx-auto">
          {/* Tag line */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
            <span className="label" style={{ color: "var(--accent)" }}>
              ● Real-time · No API key · Browser-native
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[clamp(3rem,8vw,7rem)] leading-[0.95] font-bold tracking-tighter"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
            Speech<br />
            <span className="brand-gradient">translated</span>.<br />
            Instantly.
          </motion.h1>

          {/* Body copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-start gap-8 max-w-3xl">
            <p className="text-base leading-relaxed max-w-sm shrink-0"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              Real-time speech-to-speech translation between English, Tiv, and Idoma.
              Designed for Benue State — built for everyone in it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/translator"
                className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>
                <Mic size={15} />Start translating
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium transition-all duration-150"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)", fontFamily: "var(--font-body)" }}>
                View dashboard <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Language chips */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="mt-10 flex flex-wrap gap-2">
            {[
              { code: "EN", label: "English" },
              { code: "TV", label: "Tiv" },
              { code: "ID", label: "Idoma" },
            ].map(l => (
              <div key={l.code}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
                <span className="lang-badge" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>{l.code}</span>
                <span className="text-xs" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>{l.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ background: "var(--border-subtle)" }}>
          {[
            { value: 3, suffix: "", label: "Languages" },
            { value: 0, suffix: "ms", label: "Upload latency" },
            { value: 100, suffix: "%", label: "Browser-native" },
            { value: 2, suffix: "", label: "Translation modes" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}
              className="flex flex-col gap-2 px-8 py-10" style={{ background: "var(--bg-surface)" } as React.CSSProperties}>
              <p className="stat-num text-5xl" style={{ color: "var(--text-primary)" }}>
                <Counter end={s.value} suffix={s.suffix} />
              </p>
              <p className="label">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-16 flex items-end justify-between flex-wrap gap-6">
            <div className="space-y-3">
              <SectionLabel>Capabilities</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
                Built for real<br />conversations.
              </h2>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Every feature exists because someone in Benue State needed it — at a clinic, a market, a school.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "var(--border-subtle)" }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.tag} delay={i * 0.06}>
                <div className="feature-card h-full p-8 flex flex-col gap-6"
                  style={{ background: f.accent ? "var(--accent-dim)" : "var(--bg-surface)", border: f.accent ? "1px solid var(--accent-border)" : "none" }}>
                  <span className="label">{f.tag}</span>
                  <div className="space-y-2 mt-auto">
                    <h3 className="text-base font-semibold" style={{ fontFamily: "var(--font-display)", color: f.accent ? "var(--accent)" : "var(--text-primary)" }}>
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-16">
            <SectionLabel>Process</SectionLabel>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tighter"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
              Four steps to<br />instant translation.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-px" style={{ background: "var(--border-subtle)" }}>
            {HOW.map((h, i) => (
              <Reveal key={h.n} delay={i * 0.08}>
                <div className="p-8 flex flex-col gap-8" style={{ background: "var(--bg-surface)" }}>
                  <span className="stat-num text-6xl" style={{ color: "var(--border-strong)" }}>{h.n}</span>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{h.head}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{h.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LANGUAGES ═════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid var(--border-subtle)" }} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-16 flex items-end justify-between flex-wrap gap-6">
            <div className="space-y-3">
              <SectionLabel>Supported languages</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
                Three languages.<br />One conversation.
              </h2>
            </div>
          </Reveal>

          <div className="divide-y" style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
            {LANGUAGES.map((l, i) => (
              <Reveal key={l.code} delay={i * 0.08}>
                <div className="py-8 grid grid-cols-[80px_1fr_1fr_1fr] items-center gap-8 feature-card px-2">
                  <span className="stat-num text-3xl" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{l.code}</span>
                  <div>
                    <p className="text-base font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{l.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{l.origin}</p>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{l.speakers} speakers</p>
                  <p className="text-xs label">{l.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════ */}
      <section style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
            <div className="space-y-5 max-w-lg">
              <SectionLabel>Get started</SectionLabel>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
                Ready to start<br />
                <span className="brand-gradient">a real conversation</span>?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                No downloads, no sign-ups, no API keys. Open the translator and speak.
              </p>
            </div>
            <div className="flex flex-col gap-3 items-start md:items-end">
              <Link href="/translator"
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-md text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>
                <Mic size={15} />Launch Translator <ArrowRight size={14} />
              </Link>
              <Link href="/projector" target="_blank"
                className="flex items-center gap-2 text-xs transition-colors"
                style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                Open projector view <ArrowUpRight size={11} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>T</div>
            <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>TRANSLTR</span>
          </div>
          <p className="label">English · Tiv · Idoma · Real-time speech translation</p>
          <div className="flex items-center gap-5">
            {[{ href: "/translator", l: "Translator" }, { href: "/dashboard", l: "Dashboard" }, { href: "/projector", l: "Projector" }].map(x => (
              <Link key={x.href} href={x.href} className="label transition-colors hover:text-white" style={{ color: "var(--text-tertiary)" }}>{x.l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

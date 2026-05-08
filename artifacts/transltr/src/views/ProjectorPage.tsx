
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TranslationEvent {
  transcript: string;
  translation: string;
  sourceLang: "english" | "tiv" | "idoma";
  targetLang: "english" | "tiv" | "idoma";
  ts: string;
}

const LANG: Record<string, { label: string }> = {
  english: { label: "English" },
  tiv:     { label: "Tiv" },
  idoma:   { label: "Idoma" },
};

/* ─── Particle canvas ───────────────────────────────────────── */
function ParticleCanvas({ active }: { active: boolean }) {
  const ref      = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ active });
  useEffect(() => { stateRef.current.active = active; }, [active]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf: number;
    type P = { x:number; y:number; vx:number; vy:number; r:number; o:number };
    const pts: P[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 80; i++) pts.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.3, o: Math.random() * 0.4 + 0.08,
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spd = stateRef.current.active ? 2.4 : 1;
      for (const p of pts) {
        p.x += p.vx * spd; p.y += p.vy * spd;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,214,143,${p.o * (stateRef.current.active ? 1 : 0.5)})`;
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          const max = stateRef.current.active ? 130 : 90;
          if (d < max) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,214,143,${(1 - d/max) * 0.08})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

/* ─── Typewriter ────────────────────────────────────────────── */
function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const r = useRef({ text, idx: 0, timer: 0 });

  useEffect(() => {
    setDisplayed(""); setDone(false);
    r.current = { text, idx: 0, timer: 0 };
    const speed = Math.max(15, Math.min(55, 1100 / text.length));
    r.current.timer = window.setInterval(() => {
      r.current.idx++;
      setDisplayed(text.slice(0, r.current.idx));
      if (r.current.idx >= text.length) { clearInterval(r.current.timer); setDone(true); }
    }, speed);
    return () => clearInterval(r.current.timer);
  }, [text]);

  return (
    <span style={{ color: "var(--accent)" }}>
      {displayed}
      {!done && <span className="cursor" style={{ color: "var(--accent)" }}>|</span>}
    </span>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function ProjectorPage() {
  const [current, setCurrent] = useState<TranslationEvent | null>(null);
  const [prev, setPrev]       = useState<TranslationEvent | null>(null);
  const [pulse, setPulse]     = useState(false);
  const [time, setTime]       = useState("");

  useEffect(() => {
    const ex = localStorage.getItem("transltr_event");
    if (ex) { try { setCurrent(JSON.parse(ex)); } catch {} }
    const h = (e: StorageEvent) => {
      if (e.key === "transltr_event" && e.newValue) {
        try {
          const d: TranslationEvent = JSON.parse(e.newValue);
          setCurrent(p => { setPrev(p); return d; });
          setPulse(true); setTimeout(() => setPulse(false), 800);
        } catch {}
      }
    };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#030303" }}>
      <div className="scanline" />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb-a absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,214,143,0.04), transparent 65%)" }} />
        <div className="orb-b absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.04), transparent 65%)" }} />
      </div>

      <div className="fixed inset-0"><ParticleCanvas active={!!current} /></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-10 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "var(--accent)", color: "#030303", fontFamily: "var(--font-display)" }}>T</div>
          <span className="font-semibold tracking-widest uppercase text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.2em" }}>
            TRANSLTR
          </span>
        </div>
        <div className="flex items-center gap-6" style={{ color: "var(--text-tertiary)" }}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", opacity: 0.6 }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>{time}</span>
          </div>
          <span className="label">Live Translation</span>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 py-12">
        <AnimatePresence mode="wait">
          {!current ? (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-10">
              <div className="relative">
                <motion.div animate={{ scale: [1, 1.14, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)", filter: "blur(30px)" }} />
                <div className="relative w-28 h-28 rounded-2xl flex items-center justify-center"
                  style={{ border: "1px solid var(--accent-border)", background: "var(--accent-dim)" }}>
                  <span className="text-5xl font-bold brand-gradient" style={{ fontFamily: "var(--font-display)" }}>T</span>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-2xl font-light" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-display)" }}>
                  Waiting for translation…
                </p>
                <p className="label">Start speaking on the main device</p>
              </div>

              <div className="flex items-center gap-4">
                {["english", "tiv", "idoma"].map((l, i, arr) => (
                  <div key={l} className="flex items-center gap-4">
                    <span className="lang-badge" style={{ border: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
                      {LANG[l].label}
                    </span>
                    {i < arr.length - 1 && <span style={{ color: "var(--text-tertiary)" }}>·</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={current.ts}
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-5xl space-y-10">

              {/* Source */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                className="flex items-start gap-5">
                <span className="lang-badge mt-1 shrink-0"
                  style={{ border: "1px solid var(--border-default)", color: "var(--text-tertiary)", background: "transparent" }}>
                  {LANG[current.sourceLang]?.label}
                </span>
                <p className="text-2xl font-light leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                  {current.transcript}
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-px origin-left"
                style={{ background: "linear-gradient(90deg, var(--accent), transparent)" }} />

              {/* Translation */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                className="flex items-start gap-5">
                <span className="lang-badge mt-3 shrink-0"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                  {LANG[current.targetLang]?.label}
                </span>
                <p className="leading-tight font-bold" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4.5rem)", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
                  <Typewriter text={current.translation} />
                </p>
              </motion.div>

              {/* Flash */}
              <AnimatePresence>
                {pulse && (
                  <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(circle at center, rgba(0,214,143,0.06), transparent 60%)" }} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ghost */}
      <AnimatePresence>
        {prev && (
          <motion.div initial={{ opacity: 0.2 }} animate={{ opacity: 0.06 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }} className="relative z-10 px-10 pb-8 max-w-4xl">
            <p className="text-sm truncate" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-display)" }}>
              {prev.translation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="relative z-10 px-10 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          {["english", "tiv", "idoma"].map(l => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full" style={{
                background: "var(--accent)",
                opacity: current && (current.sourceLang === l || current.targetLang === l) ? 1 : 0.12,
              }} />
              <span className="label">{LANG[l].label}</span>
            </div>
          ))}
        </div>
        <span className="label">TRANSLTR · Projector</span>
      </div>
    </div>
  );
}

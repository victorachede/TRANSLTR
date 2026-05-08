"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TranslationEvent {
  transcript: string;
  translation: string;
  sourceLang: "english" | "tiv" | "idoma";
  targetLang: "english" | "tiv" | "idoma";
  ts: string;
}

const LANG: Record<string, { label: string; color: string }> = {
  english: { label: "English", color: "#6366f1" },
  tiv:     { label: "Tiv",     color: "#10b981" },
  idoma:   { label: "Idoma",   color: "#8b5cf6" },
};

function ParticleCanvas({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ active });

  useEffect(() => { stateRef.current.active = active; }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    type P = { x: number; y: number; vx: number; vy: number; r: number; o: number; color: string };
    const COLORS = ["#10b981", "#6366f1", "#8b5cf6", "#34d399", "#818cf8"];
    const particles: P[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.4,
        o: Math.random() * 0.5 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const speed = stateRef.current.active ? 2.2 : 1;

      for (const p of particles) {
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.o * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = stateRef.current.active ? 140 : 100;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

function TypewriterText({ text, color }: { text: string; color: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef({ text, idx: 0, timer: 0 });

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    ref.current.text = text;
    ref.current.idx = 0;
    clearInterval(ref.current.timer);

    const speed = Math.max(18, Math.min(60, 1200 / text.length));
    ref.current.timer = window.setInterval(() => {
      ref.current.idx++;
      setDisplayed(ref.current.text.slice(0, ref.current.idx));
      if (ref.current.idx >= ref.current.text.length) {
        clearInterval(ref.current.timer);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(ref.current.timer);
  }, [text]);

  return (
    <span style={{ color }}>
      {displayed}
      {!done && <span className="cursor" style={{ color }}>|</span>}
    </span>
  );
}

export default function Projector() {
  const [current, setCurrent] = useState<TranslationEvent | null>(null);
  const [prev, setPrev] = useState<TranslationEvent | null>(null);
  const [pulse, setPulse] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const existing = localStorage.getItem("transltr_event");
    if (existing) {
      try { setCurrent(JSON.parse(existing)); } catch {}
    }

    const handler = (e: StorageEvent) => {
      if (e.key === "transltr_event" && e.newValue) {
        try {
          const data: TranslationEvent = JSON.parse(e.newValue);
          setCurrent(prev => { setPrev(prev); return data; });
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        } catch {}
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const targetColor = current ? LANG[current.targetLang]?.color ?? "#10b981" : "#10b981";
  const sourceColor = current ? LANG[current.sourceLang]?.color ?? "#6366f1" : "#6366f1";

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Scanline */}
      <div className="scanline" />

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="proj-orb-1 absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] rounded-full opacity-[0.055]"
          style={{ background: "radial-gradient(circle at center, #10b981, transparent 65%)" }} />
        <div className="proj-orb-2 absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle at center, #8b5cf6, transparent 65%)" }} />
        <div className="proj-orb-3 absolute top-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle at center, #6366f1, transparent 65%)" }} />
      </div>

      {/* Particle canvas */}
      <div className="fixed inset-0">
        <ParticleCanvas active={!!current} />
      </div>

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between px-10 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base"
            style={{ background: "linear-gradient(135deg, #10b981, #6366f1)" }}>
            T
          </div>
          <span className="text-lg font-semibold tracking-[0.2em] uppercase gradient-text">TRANSLTR</span>
        </div>

        <div className="flex items-center gap-6 text-zinc-700">
          <div className="flex items-center gap-2 text-xs tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-60" />
            <span className="font-mono">{time}</span>
          </div>
          <div className="text-xs tracking-widest uppercase">Live Translation</div>
        </div>
      </div>

      {/* Main display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-12 py-12">
        <AnimatePresence mode="wait">
          {!current ? (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8">

              {/* Idle pulsing logo */}
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, #10b981, transparent 70%)", filter: "blur(30px)" }}
                />
                <div className="relative w-32 h-32 rounded-full glass flex items-center justify-center border border-emerald-500/20">
                  <span className="text-5xl font-bold gradient-text">T</span>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-2xl text-zinc-600 font-light tracking-wide">Waiting for translation…</p>
                <p className="text-sm text-zinc-800 tracking-widest uppercase">Start speaking on the main device</p>
              </div>

              {/* Language badges */}
              <div className="flex items-center gap-4">
                {["english", "tiv", "idoma"].map((l, i, arr) => (
                  <div key={l} className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-full glass border border-white/[0.06]">
                      <span className="text-sm text-zinc-600">{LANG[l].label}</span>
                    </div>
                    {i < arr.length - 1 && <span className="text-zinc-800">·</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key={current.ts} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-5xl space-y-10">

              {/* Source text */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                className="flex items-start gap-4">
                <div className="px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase shrink-0 mt-1"
                  style={{ backgroundColor: sourceColor + "20", color: sourceColor }}>
                  {LANG[current.sourceLang]?.label}
                </div>
                <p className="text-2xl text-zinc-500 font-light leading-relaxed">{current.transcript}</p>
              </motion.div>

              {/* Divider */}
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-px origin-left" style={{ background: `linear-gradient(90deg, ${targetColor}60, transparent)` }} />

              {/* Translated text */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex items-start gap-4">
                <div className="px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase shrink-0 mt-2"
                  style={{ backgroundColor: targetColor + "20", color: targetColor }}>
                  {LANG[current.targetLang]?.label}
                </div>
                <p className="text-5xl font-bold leading-tight text-glow" style={{ lineHeight: 1.3 }}>
                  <TypewriterText text={current.translation} color={targetColor} />
                </p>
              </motion.div>

              {/* Pulse indicator */}
              <AnimatePresence>
                {pulse && (
                  <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 2 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
                    className="fixed inset-0 pointer-events-none rounded-full"
                    style={{ background: `radial-gradient(circle at center, ${targetColor}10, transparent 60%)` }} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Previous translation ghost */}
      <AnimatePresence>
        {prev && (
          <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="relative z-10 px-10 pb-8 max-w-4xl">
            <p className="text-sm text-zinc-800 truncate">
              {prev.translation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <div className="relative z-10 px-10 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {["english", "tiv", "idoma"].map(l => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{
                backgroundColor: LANG[l].color,
                opacity: current && (current.sourceLang === l || current.targetLang === l) ? 1 : 0.2,
                boxShadow: current && (current.sourceLang === l || current.targetLang === l) ? `0 0 6px ${LANG[l].color}` : "none"
              }} />
              <span className="text-[10px] text-zinc-700 tracking-wider uppercase">{LANG[l].label}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-zinc-800 tracking-widest">TRANSLTR · Projector View</span>
      </div>
    </div>
  );
}

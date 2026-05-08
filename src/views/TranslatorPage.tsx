"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Radio, MessageSquare, Clock, Trash2, AlertCircle, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

/* ─────────────────── Types ─────────────────────────────────── */
type Language  = "english" | "tiv" | "idoma";
type AppMode   = "solo" | "conversation";
type Status    = "idle" | "listening" | "processing" | "speaking" | "error";

interface TranslationEntry {
  id: string;
  transcript: string;
  translation: string;
  sourceLang: Language;
  targetLang: Language;
  speaker?: "a" | "b";
  ts: Date;
}

/* ─────────────────── Config ─────────────────────────────────── */
const LANG: Record<Language, { label: string; code: string }> = {
  english: { label: "English", code: "EN" },
  tiv:     { label: "Tiv",     code: "TV" },
  idoma:   { label: "Idoma",   code: "ID" },
};

const MYMEMORY = "https://api.mymemory.translated.net/get";
const LANG_CODES: Record<Language, string> = { english: "en", tiv: "tv", idoma: "idd" };

/* ─────────────────── Translation logic ──────────────────────── */
async function translateText(text: string, from: Language, to: Language): Promise<string> {
  if (!text.trim()) return "";
  try {
    const res = await fetch(`${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=${LANG_CODES[from]}|${LANG_CODES[to]}`);
    const data = await res.json();
    const t = data?.responseData?.translatedText;
    if (t && typeof t === "string" && t.trim()) return t;
  } catch {}
  return `[${LANG[to].label}] ${text}`;
}

function speakText(text: string, lang: Language) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const c = LANG_CODES[lang];
    u.lang  = c === "tv" || c === "idd" ? "en" : c;
    u.rate  = 0.88;
    window.speechSynthesis.speak(u);
  } catch {}
}

function persist(entry: TranslationEntry) {
  try {
    localStorage.setItem("transltr_event", JSON.stringify({ ...entry, ts: entry.ts.toISOString() }));
    const raw  = localStorage.getItem("transltr_history");
    const hist = raw ? JSON.parse(raw) : [];
    localStorage.setItem("transltr_history", JSON.stringify([...hist, { ...entry, ts: entry.ts.toISOString() }].slice(-200)));
  } catch {}
}

/* ─────────────────── Speech recognition hook ────────────────── */
function useSpeechRec(onResult: (t: string) => void) {
  const ref  = useRef<SpeechRecognition | null>(null);
  const [on, setOn]   = useState(false);
  const [ok, setOk]   = useState(true);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setOk(false); return; }
    const r: SpeechRecognition = new SR();
    r.continuous = false; r.interimResults = false;
    r.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0]?.[0]?.transcript || "";
      if (t.trim()) onResult(t);
    };
    r.onerror = () => setOn(false);
    r.onend   = () => setOn(false);
    ref.current = r;
    return () => r.abort();
  }, []);

  const start = useCallback((lang: Language) => {
    const r = ref.current; if (!r || on) return;
    const c = LANG_CODES[lang];
    r.lang = c === "tv" || c === "idd" ? "en" : c;
    r.start(); setOn(true);
  }, [on]);

  const stop = useCallback(() => { ref.current?.stop(); setOn(false); }, []);
  return { on, ok, start, stop };
}

/* ─────────────────── Wave bars ──────────────────────────────── */
function WaveBars() {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="wave-bar w-[2px] rounded-full" style={{ background: "var(--accent)" }} />
      ))}
    </div>
  );
}

/* ─────────────────── Mic button ─────────────────────────────── */
function MicButton({ size = "lg", on, status, disabled, onClick }: {
  size?: "lg" | "sm"; on: boolean; status: Status; disabled: boolean; onClick: () => void;
}) {
  const dim = size === "lg" ? "w-32 h-32" : "w-14 h-14";
  const ico = size === "lg" ? 32 : 16;
  return (
    <div className="relative flex items-center justify-center">
      {on && <>
        <div className={`absolute ${dim} rounded-full pulse-ring`} style={{ background: "rgba(0,214,143,0.12)" }} />
        <div className={`absolute ${dim} rounded-full pulse-ring-delay`} style={{ background: "rgba(0,214,143,0.07)" }} />
      </>}
      <button
        onClick={onClick} disabled={disabled}
        className={`relative ${dim} rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30`}
        style={{
          background: on ? "var(--accent)" : "var(--bg-elevated)",
          border: on ? "none" : "1px solid var(--border-default)",
          boxShadow: on ? "0 0 40px rgba(0,214,143,0.3)" : "none",
        }}>
        {status === "processing"
          ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" style={{ width: ico * 0.6, height: ico * 0.6 }} />
            </motion.div>
          : status === "speaking"
          ? <Radio size={ico} color={on ? "var(--text-inverse)" : "var(--accent)"} />
          : on
          ? <Square size={ico} fill={on ? "var(--text-inverse)" : "var(--text-secondary)"} color={on ? "var(--text-inverse)" : "var(--text-secondary)"} />
          : <Mic size={ico} color="var(--text-secondary)" />}
      </button>
    </div>
  );
}

/* ─────────────────── Speaker card ───────────────────────────── */
function SpeakerCard({ label, lang, otherLang, status, onTap, rec, disabled, lastEntry }: {
  label: string; lang: Language; otherLang: Language; status: Status;
  onTap: () => void; rec: ReturnType<typeof useSpeechRec>; disabled: boolean;
  lastEntry?: TranslationEntry;
}) {
  const active = rec.on || status === "processing" || status === "speaking";
  return (
    <div className="flex-1 flex flex-col gap-4 p-5 rounded-lg transition-all duration-200"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${active ? "var(--border-strong)" : "var(--border-subtle)"}`,
        minHeight: 260,
      }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "var(--accent)" : "var(--bg-overlay)" }} />
          <span className="label">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="lang-badge" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
            {LANG[lang].code}
          </span>
          <span className="label" style={{ color: "var(--text-tertiary)" }}>→</span>
          <span className="lang-badge" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
            {LANG[otherLang].code}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <MicButton size="sm" on={rec.on} status={status} disabled={disabled} onClick={onTap} />
        {rec.on && <WaveBars />}
        <span className="text-xs" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
          {rec.on ? "Listening…" : status === "processing" ? "Translating…" : status === "speaking" ? "Speaking…" : "Tap to speak"}
        </span>
      </div>

      {/* Last entry */}
      <AnimatePresence>
        {lastEntry && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-md p-3 space-y-1.5 text-xs"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
            <p style={{ color: "var(--text-secondary)" }}>&ldquo;{lastEntry.transcript}&rdquo;</p>
            <p className="font-medium" style={{ color: "var(--accent)" }}>{lastEntry.translation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── Main page ──────────────────────────────── */
export default function TranslatorPage() {
  const [mode, setMode]       = useState<AppMode>("solo");
  // FIX: source and target are now both configurable, not source-fixed to English
  const [source, setSource]   = useState<Language>("english");
  const [target, setTarget]   = useState<Language>("tiv");
  const [soloSt, setSoloSt]   = useState<Status>("idle");
  const [stA, setStA]         = useState<Status>("idle");
  const [stB, setStB]         = useState<Status>("idle");
  const [history, setHistory] = useState<TranslationEntry[]>([]);
  const [latest, setLatest]   = useState<TranslationEntry | null>(null);
  const busyRef               = useRef(false);
  const endRef                = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const addEntry = useCallback((e: TranslationEntry) => {
    setHistory(h => [...h.slice(-49), e]);
    setLatest(e);
    persist(e);
  }, []);

  const processText = useCallback(async (
    text: string, src: Language, tgt: Language,
    setSt: (s: Status) => void, speaker?: "a" | "b"
  ) => {
    if (!text.trim()) { setSt("idle"); return; }
    setSt("processing");
    try {
      const translation = await translateText(text, src, tgt);
      const entry: TranslationEntry = {
        id: Date.now().toString(), transcript: text, translation,
        sourceLang: src, targetLang: tgt, speaker, ts: new Date(),
      };
      addEntry(entry);
      setSt("speaking");
      speakText(translation, tgt);
      setTimeout(() => setSt("idle"), 2000);
    } catch {
      setSt("error"); setTimeout(() => setSt("idle"), 2500);
    }
  }, [addEntry]);

  /* Solo speech */
  const solo = useSpeechRec(useCallback((t: string) => {
    processText(t, source, target, setSoloSt);
  }, [processText, source, target]));

  /* Conv speech A — always EN → target */
  const recA = useSpeechRec(useCallback((t: string) => {
    if (busyRef.current) return; busyRef.current = true;
    processText(t, "english", target, setStA, "a").then(() => { busyRef.current = false; });
  }, [processText, target]));

  /* Conv speech B — always target → EN */
  const recB = useSpeechRec(useCallback((t: string) => {
    if (busyRef.current) return; busyRef.current = true;
    processText(t, target, "english", setStB, "b").then(() => { busyRef.current = false; });
  }, [processText, target]));

  const toggleSolo = () => {
    if (solo.on) { solo.stop(); setSoloSt("idle"); }
    else { setSoloSt("listening"); solo.start(source); }
  };

  const tapA = () => {
    if (recA.on) { recA.stop(); setStA("idle"); return; }
    if (recB.on || busyRef.current) return;
    setStA("listening"); recA.start("english");
  };

  const tapB = () => {
    if (recB.on) { recB.stop(); setStB("idle"); return; }
    if (recA.on || busyRef.current) return;
    setStB("listening"); recB.start(target);
  };

  const stopAll = () => {
    solo.stop(); recA.stop(); recB.stop();
    setSoloSt("idle"); setStA("idle"); setStB("idle");
  };

  const switchMode = (m: AppMode) => { stopAll(); setMode(m); };
  const switchSource = (l: Language) => { stopAll(); setSource(l); };
  const switchTarget = (l: Language) => { stopAll(); setTarget(l); };

  // FIX: swap source/target
  const swapLangs = () => {
    stopAll();
    // Only allow swap if the other lang is english (since we only support EN↔indigenous)
    const newSrc = target;
    const newTgt = source;
    setSource(newSrc);
    setTarget(newTgt);
  };

  const convALast = history.filter(e => e.speaker === "a").at(-1);
  const convBLast = history.filter(e => e.speaker === "b").at(-1);

  // All languages for source; target must differ from source
  const allLangs: Language[] = ["english", "tiv", "idoma"];
  const availableTargets = allLangs.filter(l => l !== source);

  return (
    <div className="min-h-screen pt-14" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">

        {/* Unsupported warning */}
        {!solo.ok && (
          <div className="flex items-center gap-3 p-4 rounded-lg text-sm"
            style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.2)", color: "#fb923c" }}>
            <AlertCircle size={15} />
            Speech recognition is only supported in Chrome and Edge.
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Mode toggle */}
          <div className="flex rounded-md overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
            {(["solo", "conversation"] as AppMode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all"
                style={{
                  background: mode === m ? "var(--bg-elevated)" : "var(--bg-surface)",
                  color: mode === m ? "var(--text-primary)" : "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                  borderRight: m === "solo" ? "1px solid var(--border-default)" : "none",
                }}>
                {m === "solo" ? <Mic size={12} /> : <MessageSquare size={12} />}
                {m === "solo" ? "Solo" : "Conversation"}
              </button>
            ))}
          </div>

          {/* Projector link */}
          <Link href="/projector" target="_blank" className="label transition-colors hover:text-white"
            style={{ color: "var(--text-tertiary)" }}>
            Open projector →
          </Link>
        </div>

        {/* ── Language bar ── FIX: bidirectional, with swap button */}
        <div className="flex items-center gap-2">
          {/* Source */}
          <div className="flex-1 flex gap-1.5">
            {allLangs.map(l => (
              <button key={l}
                onClick={() => {
                  if (l === target) { swapLangs(); return; }
                  switchSource(l);
                  // ensure target differs
                  if (target === l) switchTarget(allLangs.find(x => x !== l && x !== source) ?? "tiv");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-md transition-all text-xs"
                style={{
                  background: source === l ? "var(--bg-elevated)" : "var(--bg-surface)",
                  border: `1px solid ${source === l ? "var(--border-strong)" : "var(--border-subtle)"}`,
                  color: source === l ? "var(--text-primary)" : "var(--text-tertiary)",
                }}>
                <span className="lang-badge" style={{
                  background: source === l ? "var(--bg-overlay)" : "transparent",
                  color: source === l ? "var(--text-primary)" : "var(--text-tertiary)",
                }}>
                  {LANG[l].code}
                </span>
                <span className="hidden sm:inline">{LANG[l].label}</span>
              </button>
            ))}
          </div>

          {/* Swap */}
          <button onClick={swapLangs}
            className="flex items-center justify-center w-9 h-9 rounded-md transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}
            title="Swap languages">
            <ArrowLeftRight size={13} />
          </button>

          {/* Target */}
          <div className="flex-1 flex gap-1.5">
            {availableTargets.map(l => (
              <button key={l}
                onClick={() => switchTarget(l)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-md transition-all text-xs"
                style={{
                  background: target === l ? "var(--accent-dim)" : "var(--bg-surface)",
                  border: `1px solid ${target === l ? "var(--accent-border)" : "var(--border-subtle)"}`,
                  color: target === l ? "var(--accent)" : "var(--text-tertiary)",
                }}>
                <span className="lang-badge" style={{
                  background: target === l ? "var(--accent)" : "transparent",
                  color: target === l ? "var(--text-inverse)" : "var(--text-tertiary)",
                }}>
                  {LANG[l].code}
                </span>
                <span className="hidden sm:inline">{LANG[l].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Solo mode ── */}
        <AnimatePresence mode="wait">
          {mode === "solo" && (
            <motion.div key="solo"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center gap-6 py-6">
              <MicButton size="lg" on={solo.on} status={soloSt} disabled={!solo.ok} onClick={toggleSolo} />

              {solo.on && soloSt === "listening" && <WaveBars />}

              <p className="text-xs" style={{ color: solo.on ? "var(--accent)" : "var(--text-tertiary)", fontFamily: "var(--font-body)" }}>
                {!solo.on ? `Tap to speak in ${LANG[source].label} — translates to ${LANG[target].label}`
                  : soloSt === "listening" ? "Listening…"
                  : soloSt === "processing" ? "Translating…"
                  : soloSt === "speaking" ? "Speaking…" : "Error — try again"}
              </p>

              <AnimatePresence>
                {latest && (
                  <motion.div key={latest.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full rounded-lg p-5 space-y-4"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    {/* Source */}
                    <div className="space-y-1.5">
                      <span className="lang-badge" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                        {LANG[latest.sourceLang].code} · {LANG[latest.sourceLang].label}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {latest.transcript}
                      </p>
                    </div>
                    {/* Divider */}
                    <div style={{ borderTop: "1px solid var(--border-subtle)" }} />
                    {/* Translation */}
                    <div className="space-y-1.5">
                      <span className="lang-badge" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                        {LANG[latest.targetLang].code} · {LANG[latest.targetLang].label}
                      </span>
                      <p className="text-xl font-semibold leading-snug" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                        {latest.translation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Conversation mode ── */}
          {mode === "conversation" && (
            <motion.div key="conv"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-4">
              <div className="flex gap-3">
                <SpeakerCard label="Speaker A" lang="english" otherLang={target}
                  status={stA} onTap={tapA} rec={recA} disabled={!recA.ok} lastEntry={convALast} />
                <SpeakerCard label="Speaker B" lang={target} otherLang="english"
                  status={stB} onTap={tapB} rec={recB} disabled={!recB.ok} lastEntry={convBLast} />
              </div>
              <p className="label text-center">Tap a card to record · one speaker at a time</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── History ── FIX: mobile-friendly layout */}
        {history.length > 0 && (
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
              <div className="flex items-center gap-2">
                <Clock size={11} style={{ color: "var(--text-tertiary)" }} />
                <span className="label">Session history</span>
                <span className="lang-badge" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                  {history.length}
                </span>
              </div>
              <button onClick={() => { setHistory([]); setLatest(null); }}
                className="flex items-center gap-1.5 label transition-colors hover:text-red-400"
                style={{ color: "var(--text-tertiary)" }}>
                <Trash2 size={11} />Clear
              </button>
            </div>

            {/* FIX: responsive history rows — stack on mobile */}
            <div className="max-h-64 overflow-y-auto divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {[...history].reverse().map(e => (
                <div key={e.id} className="px-4 py-3 flex flex-col gap-1.5 sm:grid sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center sm:gap-3"
                  style={{ background: "var(--bg-base)" }}>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="lang-badge" style={{ background: "var(--bg-elevated)", color: "var(--text-tertiary)" }}>{LANG[e.sourceLang].code}</span>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>→</span>
                    <span className="lang-badge" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>{LANG[e.targetLang].code}</span>
                    <span className="label ml-2 sm:hidden" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{e.transcript}</p>
                  <p className="text-xs font-medium truncate" style={{ color: "var(--accent)" }}>{e.translation}</p>
                  <span className="label whitespace-nowrap hidden sm:block">
                    {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, ExternalLink, MessageSquare, Radio } from "lucide-react";
import Link from "next/link";

type Language = "english" | "tiv" | "idoma";
type AppMode = "solo" | "conversation";
type Status = "idle" | "listening" | "processing" | "speaking" | "error";

interface TranslationEntry {
  id: string;
  transcript: string;
  translation: string;
  sourceLang: Language;
  targetLang: Language;
  speaker?: "a" | "b";
  ts: Date;
}

const LANG: Record<Language, { label: string; short: string; color: string }> = {
  english: { label: "English", short: "EN", color: "#6366f1" },
  tiv:     { label: "Tiv",     short: "TV", color: "#10b981" },
  idoma:   { label: "Idoma",   short: "ID", color: "#8b5cf6" },
};

function broadcastTranslation(entry: TranslationEntry) {
  try {
    const payload = {
      transcript: entry.transcript,
      translation: entry.translation,
      sourceLang: entry.sourceLang,
      targetLang: entry.targetLang,
      ts: entry.ts.toISOString(),
    };
    localStorage.setItem("transltr_event", JSON.stringify(payload));
  } catch {}
}

function WaveBars({ color = "#10b981" }: { color?: string }) {
  return (
    <div className="flex items-center gap-[3px] h-7">
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="wave-bar w-[3px] rounded-full" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

function useRecorder(onBlob: (blob: Blob, mimeType: string) => void) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef      = useRef<AudioContext | null>(null);
  const rafRef      = useRef<number>(0);
  const silenceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mimeRef     = useRef<string>("audio/webm");
  const [level, setLevel]       = useState(0);
  const [recording, setRecording] = useState(false);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (silenceRef.current) clearTimeout(silenceRef.current);
    if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    ctxRef.current?.close();
    streamRef.current = null;
    ctxRef.current = null;
    analyserRef.current = null;
    recorderRef.current = null;
    setRecording(false);
    setLevel(0);
  }, []);

  const startOnce = useCallback(async (autoStop: boolean): Promise<() => void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyserRef.current = analyser;
    analyser.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(analyser);

    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus" : "audio/webm";
    mimeRef.current = mime;

    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeRef.current });
      chunksRef.current = [];
      if (blob.size > 500) onBlob(blob, mimeRef.current);
    };

    recorder.start(100);
    setRecording(true);

    if (autoStop) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      let speechStarted = false;

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(avg);

        if (avg > 12) {
          speechStarted = true;
          if (silenceRef.current) { clearTimeout(silenceRef.current); silenceRef.current = null; }
        } else if (speechStarted && !silenceRef.current) {
          silenceRef.current = setTimeout(() => {
            silenceRef.current = null;
            speechStarted = false;
            if (recorderRef.current?.state === "recording") {
              recorder.stop();
              setRecording(false);
              setLevel(0);
              cancelAnimationFrame(rafRef.current);
            }
          }, 1400);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        setLevel(data.reduce((a, b) => a + b, 0) / data.length);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    return stop;
  }, [onBlob, stop]);

  return { recording, level, startOnce, stop };
}

function SpeakerCard({
  label,
  lang,
  otherLang,
  status,
  level,
  onTap,
  isRecording,
  disabled,
  lastEntry,
}: {
  label: string;
  lang: Language;
  otherLang: Language;
  status: Status;
  level: number;
  onTap: () => void;
  isRecording: boolean;
  disabled: boolean;
  lastEntry?: TranslationEntry;
}) {
  const color = LANG[lang].color;
  const isActive = isRecording || status === "processing" || status === "speaking";

  return (
    <motion.div
      layout
      className="flex-1 glass rounded-2xl p-5 flex flex-col gap-4 min-h-[260px]"
      style={{ borderColor: isActive ? color + "40" : undefined }}
      animate={{ borderColor: isActive ? color + "40" : "rgba(255,255,255,0.08)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: isActive ? `0 0 8px ${color}` : "none" }} />
          <span className="text-xs font-semibold tracking-widest uppercase text-zinc-400">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full glass" style={{ color }}>{LANG[lang].label}</span>
          <span className="text-zinc-700 text-[10px]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full glass text-zinc-400">{LANG[otherLang].label}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full ping-slow" style={{ backgroundColor: color + "20" }} />
              <div className="absolute inset-0 rounded-full ping-slow-delay" style={{ backgroundColor: color + "15" }} />
            </>
          )}
          <button
            onClick={onTap}
            disabled={disabled}
            className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30"
            style={{
              backgroundColor: isRecording ? color : "rgba(255,255,255,0.07)",
              boxShadow: isRecording ? `0 0 24px ${color}50` : "none",
            }}
          >
            {isRecording ? (
              <Square size={18} fill="white" color="white" />
            ) : status === "processing" ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              </motion.div>
            ) : status === "speaking" ? (
              <Radio size={18} color="white" />
            ) : (
              <Mic size={18} color="rgba(255,255,255,0.7)" />
            )}
          </button>
        </div>

        {isRecording && <WaveBars color={color} />}

        <span className="text-[11px] text-zinc-600 font-medium">
          {isRecording ? "Listening…" : status === "processing" ? "Translating…" : status === "speaking" ? "Speaking…" : "Tap to speak"}
        </span>
      </div>

      <AnimatePresence>
        {lastEntry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-3 text-xs space-y-1.5"
            style={{ backgroundColor: color + "10", borderColor: color + "20", border: "1px solid" }}
          >
            <p className="text-zinc-400 leading-relaxed">&ldquo;{lastEntry.transcript}&rdquo;</p>
            <p className="font-semibold leading-relaxed" style={{ color }}>{lastEntry.translation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<AppMode>("solo");
  const [targetLang, setTargetLang] = useState<Language>("tiv");
  const [soloActive, setSoloActive] = useState(false);
  const [soloStatus, setSoloStatus] = useState<Status>("idle");
  const [convStatusA, setConvStatusA] = useState<Status>("idle");
  const [convStatusB, setConvStatusB] = useState<Status>("idle");
  const [history, setHistory] = useState<TranslationEntry[]>([]);
  const [latest, setLatest] = useState<TranslationEntry | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const soloActiveRef = useRef(false);
  const convBusyRef = useRef(false);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const addEntry = useCallback((entry: TranslationEntry) => {
    setHistory(h => [...h.slice(-49), entry]);
    setLatest(entry);
    broadcastTranslation(entry);
  }, []);

  const processBlob = useCallback(async (
    blob: Blob,
    sourceLang: Language,
    targetLang: Language,
    setStatus: (s: Status) => void,
    speaker?: "a" | "b",
  ) => {
    setStatus("processing");
    try {
      const fd = new FormData();
      fd.append("audio", blob, "audio.webm");
      fd.append("sourceLang", sourceLang);
      fd.append("targetLang", targetLang);

      const res = await fetch("/api/translate", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();

      if (!data.transcript?.trim()) { setStatus("idle"); return; }

      const entry: TranslationEntry = {
        id: Date.now().toString(),
        transcript: data.transcript,
        translation: data.translation,
        sourceLang,
        targetLang,
        speaker,
        ts: new Date(),
      };
      addEntry(entry);

      if (data.audioBase64) {
        setStatus("speaking");
        const bytes = Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
        const audio = new Audio(url);
        await new Promise<void>(resolve => {
          audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
          audio.onerror = () => { resolve(); };
          audio.play().catch(resolve);
        });
      }
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }, [addEntry]);

  // ── Solo mode ──────────────────────────────────────────
  const soloOnBlob = useCallback((blob: Blob) => {
    if (!soloActiveRef.current) return;
    processBlob(blob, "english", targetLang, setSoloStatus).then(() => {
      if (soloActiveRef.current) soloRecorder.startOnce(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLang, processBlob]);

  const soloRecorder = useRecorder(soloOnBlob);

  const toggleSolo = useCallback(async () => {
    if (soloActive) {
      soloActiveRef.current = false;
      setSoloActive(false);
      soloRecorder.stop();
      setSoloStatus("idle");
    } else {
      soloActiveRef.current = true;
      setSoloActive(true);
      setSoloStatus("listening");
      await soloRecorder.startOnce(true);
    }
  }, [soloActive, soloRecorder]);

  // ── Conversation mode – Speaker A (English) ─────────────
  const convALastEntry = history.filter(e => e.speaker === "a").at(-1);
  const convBLastEntry = history.filter(e => e.speaker === "b").at(-1);

  const convAOnBlob = useCallback((blob: Blob) => {
    if (convBusyRef.current) return;
    convBusyRef.current = true;
    processBlob(blob, "english", targetLang, setConvStatusA, "a").then(() => {
      convBusyRef.current = false;
    });
  }, [targetLang, processBlob]);

  const convBOnBlob = useCallback((blob: Blob) => {
    if (convBusyRef.current) return;
    convBusyRef.current = true;
    processBlob(blob, targetLang, "english", setConvStatusB, "b").then(() => {
      convBusyRef.current = false;
    });
  }, [targetLang, processBlob]);

  const recorderA = useRecorder(convAOnBlob);
  const recorderB = useRecorder(convBOnBlob);

  const tapSpeakerA = useCallback(async () => {
    if (recorderA.recording) { recorderA.stop(); setConvStatusA("idle"); return; }
    if (recorderB.recording || convBusyRef.current) return;
    setConvStatusA("listening");
    await recorderA.startOnce(false);
  }, [recorderA, recorderB]);

  const tapSpeakerB = useCallback(async () => {
    if (recorderB.recording) { recorderB.stop(); setConvStatusB("idle"); return; }
    if (recorderA.recording || convBusyRef.current) return;
    setConvStatusB("listening");
    await recorderB.startOnce(false);
  }, [recorderA, recorderB]);

  useEffect(() => {
    return () => { soloRecorder.stop(); recorderA.stop(); recorderB.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeChange = (m: AppMode) => {
    soloActiveRef.current = false;
    soloRecorder.stop();
    recorderA.stop();
    recorderB.stop();
    setSoloActive(false);
    setSoloStatus("idle");
    setConvStatusA("idle");
    setConvStatusB("idle");
    setMode(m);
  };

  const handleTargetLang = (l: Language) => {
    handleModeChange(mode);
    setTargetLang(l);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }} />
        <div className="orb-2 absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
        <div className="orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #10b981, #6366f1)" }}>
            T
          </div>
          <span className="text-lg font-semibold tracking-tight gradient-text">TRANSLTR</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="glass rounded-xl p-1 flex gap-1">
            {(["solo", "conversation"] as AppMode[]).map(m => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  mode === m ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {m === "solo" ? <Mic size={12} /> : <MessageSquare size={12} />}
                {m === "solo" ? "Solo" : "Conversation"}
              </button>
            ))}
          </div>

          <Link href="/projector" target="_blank"
            className="glass flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors">
            <ExternalLink size={12} />
            Projector
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-8 gap-6">

        {/* Language selector */}
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2.5 flex-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG.english.color }} />
            <span className="text-sm font-medium text-zinc-200">English</span>
            <span className="ml-auto text-[10px] text-zinc-600 uppercase tracking-wider">source</span>
          </div>
          <div className="text-zinc-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
          <div className="flex gap-2 flex-1">
            {(["tiv", "idoma"] as Language[]).map(l => (
              <button key={l} onClick={() => handleTargetLang(l)}
                className={`flex-1 glass rounded-xl px-3 py-3 flex items-center gap-2 transition-all duration-200 ${
                  targetLang === l ? "border-[1.5px]" : "hover:bg-white/[0.04]"
                }`}
                style={targetLang === l ? { borderColor: LANG[l].color + "60", backgroundColor: LANG[l].color + "0d" } : {}}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG[l].color }} />
                <span className="text-sm font-medium" style={targetLang === l ? { color: LANG[l].color } : { color: "#71717a" }}>
                  {LANG[l].label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── SOLO MODE ── */}
        <AnimatePresence mode="wait">
          {mode === "solo" && (
            <motion.div key="solo" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="flex flex-col items-center gap-6 py-4">

              {/* Mic button */}
              <div className="relative flex items-center justify-center">
                {soloActive && (
                  <>
                    <div className="absolute inset-0 w-32 h-32 rounded-full ping-slow"
                      style={{ backgroundColor: LANG[targetLang].color + "18" }} />
                    <div className="absolute inset-0 w-32 h-32 rounded-full ping-slow-delay"
                      style={{ backgroundColor: LANG[targetLang].color + "12" }} />
                  </>
                )}
                <button
                  onClick={toggleSolo}
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300`}
                  style={{
                    background: soloActive
                      ? `radial-gradient(circle, ${LANG[targetLang].color}dd, ${LANG[targetLang].color}99)`
                      : "rgba(255,255,255,0.06)",
                    boxShadow: soloActive ? `0 0 50px ${LANG[targetLang].color}40, 0 0 100px ${LANG[targetLang].color}15` : "none",
                    border: soloActive ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {soloActive ? (
                    soloStatus === "processing" ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-8 h-8 border-[3px] border-white/30 border-t-white rounded-full" />
                    ) : soloStatus === "speaking" ? (
                      <Radio size={36} color="white" />
                    ) : (
                      <Square size={28} fill="white" color="white" />
                    )
                  ) : (
                    <Mic size={36} color="rgba(255,255,255,0.6)" />
                  )}
                </button>
              </div>

              {soloActive && soloStatus === "listening" && <WaveBars color={LANG[targetLang].color} />}

              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium" style={{
                  color: soloActive
                    ? soloStatus === "error" ? "#f87171"
                    : soloStatus === "speaking" ? "#60a5fa"
                    : LANG[targetLang].color
                    : "#52525b"
                }}>
                  {!soloActive ? "Tap to start" : soloStatus === "listening" ? "Listening…" : soloStatus === "processing" ? "Translating…" : soloStatus === "speaking" ? "Speaking…" : "Error — retrying"}
                </span>
                {!soloActive && (
                  <p className="text-xs text-zinc-600 text-center max-w-[220px]">
                    Speak in English, hear it in <span style={{ color: LANG[targetLang].color }}>{LANG[targetLang].label}</span>
                  </p>
                )}
              </div>

              {/* Latest translation card */}
              <AnimatePresence>
                {latest && (
                  <motion.div key={latest.id} initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full glass-strong rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LANG[latest.sourceLang].color }} />
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{LANG[latest.sourceLang].label}</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{latest.transcript}</p>
                    <div className="border-t border-white/[0.06] pt-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LANG[latest.targetLang].color }} />
                        <span className="text-xs uppercase tracking-wider font-medium" style={{ color: LANG[latest.targetLang].color }}>{LANG[latest.targetLang].label}</span>
                      </div>
                      <p className="text-base font-semibold leading-relaxed" style={{ color: LANG[latest.targetLang].color }}>
                        {latest.translation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── CONVERSATION MODE ── */}
          {mode === "conversation" && (
            <motion.div key="convo" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="flex gap-3">
              <SpeakerCard
                label="Speaker A" lang="english" otherLang={targetLang}
                status={convStatusA} level={recorderA.level}
                onTap={tapSpeakerA} isRecording={recorderA.recording}
                disabled={recorderB.recording || convStatusB === "processing" || convStatusB === "speaking"}
                lastEntry={convALastEntry}
              />
              <div className="flex flex-col items-center justify-center gap-2 px-1 py-10">
                <div className="text-zinc-700 text-lg">⇄</div>
              </div>
              <SpeakerCard
                label="Speaker B" lang={targetLang} otherLang="english"
                status={convStatusB} level={recorderB.level}
                onTap={tapSpeakerB} isRecording={recorderB.recording}
                disabled={recorderA.recording || convStatusA === "processing" || convStatusA === "speaking"}
                lastEntry={convBLastEntry}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <AnimatePresence>
          {history.length > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.05]" />
                <span className="text-[10px] font-semibold tracking-widest text-zinc-700 uppercase">Session</span>
                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <AnimatePresence>
                  {history.slice(0, -1).reverse().map(e => (
                    <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 items-start rounded-xl p-3 glass group">
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LANG[e.sourceLang].color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 truncate">{e.transcript}</p>
                        <p className="text-sm font-medium mt-0.5 truncate" style={{ color: LANG[e.targetLang].color }}>{e.translation}</p>
                      </div>
                      <span className="text-[10px] text-zinc-700 shrink-0 mt-0.5">
                        {e.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={historyEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {history.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-zinc-800">
            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
              <MessageSquare size={20} className="text-zinc-700" />
            </div>
            <p className="text-sm">Translations will appear here</p>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
        <span className="text-[10px] text-zinc-800 tracking-wider uppercase">TRANSLTR · English · Tiv · Idoma</span>
        <Link href="/projector" target="_blank" className="text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors flex items-center gap-1">
          <ExternalLink size={10} />
          Open projector view
        </Link>
      </footer>
    </div>
  );
}

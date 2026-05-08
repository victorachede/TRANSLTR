"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Language = "english" | "tiv" | "idoma";
type Status = "idle" | "listening" | "processing" | "speaking" | "error";

interface TranslationEntry {
  id: string;
  original: string;
  translated: string;
  sourceLang: Language;
  targetLang: Language;
  timestamp: Date;
}

const LANG_LABELS: Record<Language, string> = {
  english: "English",
  tiv: "Tiv",
  idoma: "Idoma",
};

const LANG_FLAGS: Record<Language, string> = {
  english: "🇬🇧",
  tiv: "🇳🇬",
  idoma: "🇳🇬",
};

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [targetLang, setTargetLang] = useState<Language>("tiv");
  const [sourceLang] = useState<Language>("english");
  const [history, setHistory] = useState<TranslationEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isActive, setIsActive] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const stopRecording = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob, tLang: Language, sLang: Language) => {
    if (audioBlob.size < 1000) {
      setStatus("listening");
      return;
    }

    setStatus("processing");
    setCurrentTranscript("");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("targetLang", tLang);
      formData.append("sourceLang", sLang);

      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Translation failed");
      }

      const data = await response.json();

      if (!data.transcript || data.transcript.trim().length === 0) {
        setStatus("listening");
        return;
      }

      setCurrentTranscript(data.transcript);

      const entry: TranslationEntry = {
        id: Date.now().toString(),
        original: data.transcript,
        translated: data.translation,
        sourceLang: sLang,
        targetLang: tLang,
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, entry]);

      if (data.audioBase64) {
        setStatus("speaking");
        isSpeakingRef.current = true;
        const audioData = atob(data.audioBase64);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          isSpeakingRef.current = false;
          setStatus("listening");
        };
        audio.onerror = () => {
          isSpeakingRef.current = false;
          setStatus("listening");
        };
        await audio.play();
      } else {
        setStatus("listening");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
      setTimeout(() => {
        setStatus("listening");
        setErrorMsg("");
      }, 3000);
    }
  }, []);

  const startListening = useCallback(async (tLang: Language, sLang: Language) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        processAudio(blob, tLang, sLang);
      };

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let speechDetected = false;

      const checkSilence = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (avg > 15) {
          speechDetected = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (speechDetected && !silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            speechDetected = false;
            silenceTimerRef.current = null;
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              recorder.stop();
              audioChunksRef.current = [];
              setTimeout(() => {
                if (isActive) {
                  const newRecorder = new MediaRecorder(stream, { mimeType });
                  mediaRecorderRef.current = newRecorder;
                  newRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                  };
                  newRecorder.onstop = () => {
                    const b = new Blob(audioChunksRef.current, { type: mimeType });
                    audioChunksRef.current = [];
                    processAudio(b, tLang, sLang);
                  };
                  newRecorder.start(100);
                }
              }, 200);
            }
          }, 1500);
        }

        animFrameRef.current = requestAnimationFrame(checkSilence);
      };

      recorder.start(100);
      checkSilence();
      setStatus("listening");
    } catch (err) {
      console.error(err);
      setErrorMsg("Microphone access denied. Please allow microphone access.");
      setStatus("error");
    }
  }, [isActive, processAudio]);

  const stopAll = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setStatus("idle");
  }, []);

  const toggleActive = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      stopAll();
    } else {
      setIsActive(true);
      startListening(targetLang, sourceLang);
    }
  }, [isActive, targetLang, sourceLang, startListening, stopAll]);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  const handleTargetChange = (lang: Language) => {
    setTargetLang(lang);
    if (isActive) {
      stopAll();
      setIsActive(false);
    }
  };

  const statusLabel: Record<Status, string> = {
    idle: "Ready to translate",
    listening: "Listening...",
    processing: "Translating...",
    speaking: "Speaking...",
    error: errorMsg || "Error occurred",
  };

  const statusColor: Record<Status, string> = {
    idle: "text-zinc-500",
    listening: "text-emerald-400",
    processing: "text-amber-400",
    speaking: "text-blue-400",
    error: "text-red-400",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-[var(--font-geist-sans)]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-sm font-bold">
            T
          </div>
          <span className="text-xl font-semibold tracking-tight">TRANSLTR</span>
        </div>
        <span className="text-xs text-zinc-500 tracking-widest uppercase">
          Real-time Speech Translation
        </span>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-8 gap-8">
        {/* Language selector */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5">
            <span className="text-lg">{LANG_FLAGS[sourceLang]}</span>
            <span className="font-medium">{LANG_LABELS[sourceLang]}</span>
            <span className="text-zinc-600 ml-auto text-sm">source</span>
          </div>

          <div className="text-zinc-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {(["tiv", "idoma"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleTargetChange(lang)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  targetLang === lang
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
                }`}
              >
                <span className="text-lg">{LANG_FLAGS[lang]}</span>
                <span className="font-medium">{LANG_LABELS[lang]}</span>
                {targetLang === lang && (
                  <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mic button */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            {isActive && status === "listening" && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 pulse-ring" />
            )}
            <button
              onClick={toggleActive}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
                  : "bg-white/10 border border-white/20 hover:bg-white/15"
              }`}
            >
              {isActive ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="white" stroke="none" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
          </div>

          {/* Wave visualizer */}
          {isActive && status === "listening" && (
            <div className="flex items-center gap-1 h-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="wave-bar w-1.5 bg-emerald-500 rounded-full"
                />
              ))}
            </div>
          )}

          <span className={`text-sm font-medium ${statusColor[status]}`}>
            {statusLabel[status]}
          </span>

          {!isActive && (
            <p className="text-xs text-zinc-600 text-center max-w-xs">
              Tap the mic and speak in English — it will be translated to{" "}
              <span className="text-zinc-400">{LANG_LABELS[targetLang]}</span> and spoken aloud
            </p>
          )}
        </div>

        {/* Translation history */}
        {history.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
              Session history
            </h2>
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 shrink-0 mt-0.5">
                      {LANG_LABELS[entry.sourceLang]}
                    </span>
                    <p className="text-sm text-zinc-300 leading-relaxed">{entry.original}</p>
                  </div>
                  <div className="flex items-start gap-3 pl-4 border-l-2 border-emerald-500/30">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      {LANG_LABELS[entry.targetLang]}
                    </span>
                    <p className="text-sm text-emerald-300 leading-relaxed font-medium">{entry.translated}</p>
                  </div>
                  <span className="text-xs text-zinc-700 text-right">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              <div ref={historyEndRef} />
            </div>
          </div>
        )}

        {history.length === 0 && !isActive && (
          <div className="flex flex-col items-center gap-2 py-8 text-zinc-700">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm">Your translations will appear here</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 px-6 py-3 text-center text-xs text-zinc-700">
        TRANSLTR — English · Tiv · Idoma real-time translation
      </footer>
    </div>
  );
}

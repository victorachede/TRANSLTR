
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { Globe2, Mic, Clock, Trash2, TrendingUp, Languages, Activity, Radio, ArrowRight } from "lucide-react";
import { Link } from "wouter";

/* ─────────────────── Types ─────────────────────────────────── */
interface StoredEntry {
  id: string; transcript: string; translation: string;
  sourceLang: string; targetLang: string; speaker?: string; ts: string;
}

const LABELS: Record<string, string> = { english: "English", tiv: "Tiv", idoma: "Idoma" };
const CODES:  Record<string, string>  = { english: "EN",      tiv: "TV",  idoma: "ID"    };
const PIE_COLORS = ["#00D68F", "#6366f1", "#8b5cf6", "#f59e0b"];

/* ─────────────────── Tooltip ────────────────────────────────── */
const TT_STYLE: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  padding: "8px 12px",
  color: "var(--text-primary)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

function TipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TT_STYLE}>
      {label && <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || "var(--accent)" }}>{p.name || ""} {p.value}</p>
      ))}
    </div>
  );
}

/* ─────────────────── Stat card ──────────────────────────────── */
function Stat({ label, value, icon: Icon, sub }: {
  label: string; value: string | number; icon: React.ElementType; sub?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col justify-between p-6 rounded-lg"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", minHeight: 120 }}>
      <div className="flex items-center justify-between mb-3">
        <span className="label">{label}</span>
        <Icon size={13} style={{ color: "var(--text-tertiary)" }} />
      </div>
      <div>
        <p className="stat-num text-4xl" style={{ color: "var(--text-primary)" }}>{value}</p>
        {sub && <p className="label mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ─────────────────── Panel ──────────────────────────────────── */
function Panel({ title, icon: Icon, children, action }: {
  title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color: "var(--text-tertiary)" }} />
          <span className="label">{title}</span>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </motion.div>
  );
}

/* ─────────────────── Page ───────────────────────────────────── */
export default function DashboardPage() {
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [filter, setFilter]   = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("transltr_history");
    if (raw) { try { setEntries(JSON.parse(raw)); } catch {} }
  }, []);

  const clear = () => { localStorage.removeItem("transltr_history"); localStorage.removeItem("transltr_event"); setEntries([]); };

  /* Stats */
  const stats = useMemo(() => {
    const pairs: Record<string, number> = {};
    entries.forEach(e => {
      const k = `${CODES[e.sourceLang] || e.sourceLang}→${CODES[e.targetLang] || e.targetLang}`;
      pairs[k] = (pairs[k] || 0) + 1;
    });
    return {
      total: entries.length,
      today: entries.filter(e => new Date(e.ts).toDateString() === new Date().toDateString()).length,
      langs: new Set(entries.map(e => e.targetLang)).size,
      topPair: Object.entries(pairs).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
    };
  }, [entries]);

  /* Charts */
  const langDist = useMemo(() => {
    const c: Record<string,number> = {};
    entries.forEach(e => { c[e.targetLang] = (c[e.targetLang] || 0) + 1; });
    return Object.entries(c).map(([k,v]) => ({ name: LABELS[k] || k, value: v }));
  }, [entries]);

  const pairData = useMemo(() => {
    const c: Record<string,number> = {};
    entries.forEach(e => {
      const k = `${CODES[e.sourceLang]||e.sourceLang}→${CODES[e.targetLang]||e.targetLang}`;
      c[k] = (c[k] || 0) + 1;
    });
    return Object.entries(c).map(([pair,count]) => ({ pair, count })).sort((a,b) => b.count - a.count);
  }, [entries]);

  const hourly = useMemo(() => {
    const b: Record<number,number> = {};
    entries.forEach(e => { const h = new Date(e.ts).getHours(); b[h] = (b[h] || 0) + 1; });
    return Array.from({length: 24}, (_, h) => ({ hour: `${String(h).padStart(2,"0")}h`, n: b[h] || 0 }));
  }, [entries]);

  const recent = useMemo(() => {
    let f = [...entries].reverse();
    if (filter) f = f.filter(e => e.targetLang === filter || e.sourceLang === filter);
    return f.slice(0, 50);
  }, [entries, filter]);

  const isEmpty = entries.length === 0;

  const TICK = { fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "var(--font-mono)" };
  const AXIS = { axisLine: false, tickLine: false };

  return (
    <div className="min-h-screen pt-14" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <span className="label" style={{ color: "var(--accent)" }}>Analytics</span>
            <h1 className="text-3xl font-bold tracking-tighter" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
              Dashboard
            </h1>
          </div>
          {!isEmpty && (
            <button onClick={clear}
              className="flex items-center gap-1.5 label transition-colors hover:text-red-400"
              style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)", padding: "8px 12px", borderRadius: 8 }}>
              <Trash2 size={11} />Clear all data
            </button>
          )}
        </div>

        {isEmpty ? (
          /* ── Empty ── */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-32 text-center">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <Activity size={24} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-secondary)" }}>
                No translations yet
              </h2>
              <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-tertiary)" }}>
                Start translating to see your history and analytics here.
              </p>
            </div>
            <Link href="/translator"
              className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-semibold"
              style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>
              <Mic size={14} />Go to Translator <ArrowRight size={13} />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total", value: stats.total, icon: Globe2, sub: "All time" },
                { label: "Today", value: stats.today, icon: Activity, sub: "This session" },
                { label: "Languages", value: stats.langs, icon: Languages, sub: "Target" },
                { label: "Top pair", value: stats.topPair, icon: TrendingUp, sub: "Most used" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <Stat {...s} />
                </motion.div>
              ))}
            </div>

            {/* ── Charts row ── */}
            <div className="grid md:grid-cols-2 gap-5">
              <Panel title="Target Language Distribution" icon={Globe2}>
                <div className="flex items-center gap-4 p-5">
                  <ResponsiveContainer width="50%" height={160}>
                    <PieChart>
                      <Pie data={langDist} cx="50%" cy="50%" innerRadius={38} outerRadius={65}
                        dataKey="value" stroke="none">
                        {langDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TT_STYLE} formatter={(v:any) => [v, "translations"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2.5">
                    {langDist.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="label">{d.name}</span>
                        <span className="ml-auto label" style={{ color: "var(--text-primary)" }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel title="By Language Pair" icon={Languages}>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={pairData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <XAxis dataKey="pair" tick={TICK} {...AXIS} />
                      <YAxis tick={TICK} {...AXIS} />
                      <Tooltip content={<TipContent />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                      <Bar dataKey="count" name="Translations" radius={[3,3,0,0]}>
                        {pairData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            {/* ── Hourly ── */}
            <Panel title="Activity by Hour" icon={Clock}>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={hourly} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                    <XAxis dataKey="hour" tick={TICK} {...AXIS} interval={2} />
                    <YAxis tick={TICK} {...AXIS} />
                    <Tooltip content={<TipContent />} cursor={{ stroke: "var(--border-strong)" }} />
                    <Line type="monotone" dataKey="n" name="Translations" stroke="var(--accent)"
                      strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: "var(--accent)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* ── History table ── */}
            <Panel title="Recent Translations" icon={Radio}
              action={
                <div className="flex items-center gap-1">
                  <button onClick={() => setFilter(null)}
                    className="lang-badge transition-all"
                    style={{ background: !filter ? "var(--bg-overlay)" : "transparent", color: !filter ? "var(--text-primary)" : "var(--text-tertiary)", border: "none", cursor: "pointer", padding: "3px 8px", borderRadius: 4 }}>
                    All
                  </button>
                  {Object.entries(CODES).map(([k, code]) => (
                    <button key={k} onClick={() => setFilter(filter === k ? null : k)}
                      className="lang-badge transition-all"
                      style={{ background: filter === k ? "var(--accent-dim)" : "transparent", color: filter === k ? "var(--accent)" : "var(--text-tertiary)", border: filter === k ? "1px solid var(--accent-border)" : "none", cursor: "pointer", padding: "3px 8px", borderRadius: 4 }}>
                      {code}
                    </button>
                  ))}
                </div>
              }>
              <div className="max-h-96 overflow-y-auto divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {recent.length === 0 ? (
                  <p className="label text-center py-8">No entries match</p>
                ) : recent.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                    className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors"
                    style={{ background: "var(--bg-base)" }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = "var(--bg-surface)")}
                    onMouseLeave={ev => (ev.currentTarget.style.background = "var(--bg-base)")}>
                    <div className="flex items-center gap-1">
                      <span className="lang-badge" style={{ background: "var(--bg-elevated)", color: "var(--text-tertiary)" }}>
                        {CODES[e.sourceLang] || e.sourceLang}
                      </span>
                      <span style={{ color: "var(--text-tertiary)", fontSize: 9 }}>→</span>
                      <span className="lang-badge" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                        {CODES[e.targetLang] || e.targetLang}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>{e.transcript}</p>
                    <p className="text-xs font-medium truncate" style={{ color: "var(--accent)", fontFamily: "var(--font-display)" }}>{e.translation}</p>
                    <span className="label whitespace-nowrap">
                      {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Panel>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <Link href="/translator"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--accent)", color: "var(--text-inverse)", fontFamily: "var(--font-display)" }}>
                <Mic size={12} />New Translation
              </Link>
              <Link href="/projector" target="_blank"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-xs transition-colors label"
                style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
                <Radio size={12} />Open Projector
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

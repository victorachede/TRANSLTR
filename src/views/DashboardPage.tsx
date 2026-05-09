"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Area, AreaChart,
} from "recharts";
import {
  Globe2, Mic, Clock, Trash2, TrendingUp, Languages, Activity,
  Radio, ArrowRight, Download, Search, Filter,
} from "lucide-react";
import Link from "next/link";

interface StoredEntry {
  id: string; transcript: string; translation: string;
  sourceLang: string; targetLang: string; speaker?: string; ts: string;
}

const LABELS: Record<string, string> = { english: "English", tiv: "Tiv", idoma: "Idoma" };
const CODES: Record<string, string>  = { english: "EN", tiv: "TV", idoma: "ID" };
const PIE_COLORS = ["#0D5C3A", "#00A65A", "#E8561A", "#f59e0b"];

const TT: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 8,
  padding: "8px 12px",
  color: "#0C0C0C",
  fontSize: 11,
  fontFamily: "var(--font-body)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

function TipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TT}>
      {label && <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || "var(--accent)" }}>{p.name || ""} {p.value}</p>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, sub, trend }: {
  label: string; value: string | number; icon: React.ElementType; sub?: string; trend?: string;
}) {
  return (
    <div className="card-lift flex flex-col justify-between p-6 rounded-2xl"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", minHeight: 130 }}>
      <div className="flex items-center justify-between mb-3">
        <span className="label">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
          <Icon size={13} style={{ color: "var(--accent)" }} />
        </div>
      </div>
      <div>
        <p className="stat-num text-4xl" style={{ color: "var(--text-primary)" }}>{value}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {sub && <p className="label">{sub}</p>}
          {trend && (
            <span className="lang-badge" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>{trend}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children, action }: {
  title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
      <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-2"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color: "var(--text-tertiary)" }} />
          <span className="label">{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [filter, setFilter]   = useState<string | null>(null);
  const [search, setSearch]   = useState("");
  const [tab, setTab]         = useState<"overview" | "history">("overview");

  useEffect(() => {
    const raw = localStorage.getItem("transltr_history");
    if (raw) { try { setEntries(JSON.parse(raw)); } catch {} }
  }, []);

  const clear = () => {
    localStorage.removeItem("transltr_history");
    localStorage.removeItem("transltr_event");
    setEntries([]);
  };

  const stats = useMemo(() => {
    const pairs: Record<string, number> = {};
    entries.forEach(e => {
      const k = `${CODES[e.sourceLang] || e.sourceLang}→${CODES[e.targetLang] || e.targetLang}`;
      pairs[k] = (pairs[k] || 0) + 1;
    });
    const today = entries.filter(e => new Date(e.ts).toDateString() === new Date().toDateString()).length;
    const prev = entries.filter(e => {
      const d = new Date(e.ts); const y = new Date(); y.setDate(y.getDate() - 1);
      return d.toDateString() === y.toDateString();
    }).length;
    return {
      total: entries.length,
      today,
      todayTrend: prev > 0 ? (today >= prev ? `+${today - prev} vs yesterday` : `${today - prev} vs yesterday`) : undefined,
      langs: new Set(entries.map(e => e.targetLang)).size,
      topPair: Object.entries(pairs).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
      avgPerDay: entries.length > 0 ? Math.round(entries.length / Math.max(1, new Set(entries.map(e => new Date(e.ts).toDateString())).size)) : 0,
    };
  }, [entries]);

  const langDist = useMemo(() => {
    const c: Record<string, number> = {};
    entries.forEach(e => { c[e.targetLang] = (c[e.targetLang] || 0) + 1; });
    return Object.entries(c).map(([k, v]) => ({ name: LABELS[k] || k, value: v }));
  }, [entries]);

  const pairData = useMemo(() => {
    const c: Record<string, number> = {};
    entries.forEach(e => {
      const k = `${CODES[e.sourceLang]||e.sourceLang}→${CODES[e.targetLang]||e.targetLang}`;
      c[k] = (c[k] || 0) + 1;
    });
    return Object.entries(c).map(([pair, count]) => ({ pair, count })).sort((a, b) => b.count - a.count);
  }, [entries]);

  const daily7 = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toLocaleDateString([], { weekday: "short" })] = 0;
    }
    entries.forEach(e => {
      const d = new Date(e.ts);
      const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (diff <= 6) { const key = d.toLocaleDateString([], { weekday: "short" }); if (key in days) days[key]++; }
    });
    return Object.entries(days).map(([day, n]) => ({ day, n }));
  }, [entries]);

  const recent = useMemo(() => {
    let f = [...entries].reverse();
    if (filter) f = f.filter(e => e.targetLang === filter || e.sourceLang === filter);
    if (search) f = f.filter(e =>
      e.transcript.toLowerCase().includes(search.toLowerCase()) ||
      e.translation.toLowerCase().includes(search.toLowerCase())
    );
    return f.slice(0, 100);
  }, [entries, filter, search]);

  const isEmpty = entries.length === 0;
  const TICK = { fill: "#888", fontSize: 10, fontFamily: "var(--font-body)" };
  const AXIS = { axisLine: false, tickLine: false };

  const exportCSV = () => {
    const rows = [["Time","Source","Target","Transcript","Translation"],
      ...entries.map(e => [new Date(e.ts).toISOString(), e.sourceLang, e.targetLang, e.transcript, e.translation])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "transltr-history.csv"; a.click();
  };

  return (
    <div className="min-h-screen pt-14" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-6xl mx-auto px-5 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="label" style={{ color: "var(--accent)" }}>Analytics</span>
            <h1 className="mt-1 text-3xl font-bold" style={{ fontFamily: "var(--font-body)", letterSpacing: "-0.04em" }}>Dashboard</h1>
            {!isEmpty && (
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                {entries.length} total translations · {stats.langs} target language{stats.langs !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {!isEmpty && (
              <>
                <button onClick={exportCSV}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}>
                  <Download size={11} />Export CSV
                </button>
                <button onClick={clear}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:text-red-500"
                  style={{ border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)", background: "var(--bg-surface)" }}>
                  <Trash2 size={11} />Clear data
                </button>
              </>
            )}
            <Link href="/translator"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)" }}>
              <Mic size={12} />New translation
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1" style={{ borderBottom: "1px solid var(--border-default)" }}>
          {(["overview", "history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2.5 text-xs font-bold transition-all capitalize"
              style={{
                color: tab === t ? "var(--accent)" : "var(--text-tertiary)",
                borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: "-1px",
              }}>
              {t}
            </button>
          ))}
        </div>

        {isEmpty ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-32 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <Activity size={24} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ letterSpacing: "-0.02em" }}>No translations yet</h2>
              <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>
                Start translating to see your analytics and history here.
              </p>
            </div>
            <Link href="/translator"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
              style={{ background: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)" }}>
              <Mic size={14} />Go to Translator <ArrowRight size={13} />
            </Link>
          </motion.div>
        ) : tab === "overview" ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total", value: stats.total, icon: Globe2, sub: "All time" },
                { label: "Today", value: stats.today, icon: Activity, trend: stats.todayTrend },
                { label: "Avg / day", value: stats.avgPerDay, icon: TrendingUp, sub: "Last 7 days" },
                { label: "Top pair", value: stats.topPair, icon: Languages, sub: "Most used" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <StatCard {...s} />
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Panel title="Translations — Last 7 Days" icon={Clock}>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={daily7} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D5C3A" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#0D5C3A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                      <XAxis dataKey="day" tick={TICK} {...AXIS} />
                      <YAxis tick={TICK} {...AXIS} />
                      <Tooltip content={<TipContent />} cursor={{ stroke: "var(--border-strong)" }} />
                      <Area type="monotone" dataKey="n" name="Translations" stroke="#0D5C3A"
                        strokeWidth={1.5} fill="url(#grad)" dot={false} activeDot={{ r: 3, fill: "#0D5C3A" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="By Language Pair" icon={Languages}>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={pairData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <XAxis dataKey="pair" tick={TICK} {...AXIS} />
                      <YAxis tick={TICK} {...AXIS} />
                      <Tooltip content={<TipContent />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                      <Bar dataKey="count" name="Translations" radius={[4,4,0,0]}>
                        {pairData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <Panel title="Target Language" icon={Globe2}>
                <div className="flex flex-col items-center gap-4 p-5">
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={langDist} cx="50%" cy="50%" innerRadius={35} outerRadius={52} dataKey="value" stroke="none">
                        {langDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TT} formatter={(v: any) => [v, "translations"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full space-y-2">
                    {langDist.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="label flex-1">{d.name}</span>
                        <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <div className="md:col-span-2">
                <Panel title="Activity by Hour" icon={Clock}>
                  <div className="p-5">
                    <ResponsiveContainer width="100%" height={190}>
                      <LineChart data={Array.from({ length: 24 }, (_, h) => ({
                        hour: `${String(h).padStart(2,"0")}h`,
                        n: entries.filter(e => new Date(e.ts).getHours() === h).length,
                      }))} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke="var(--border-subtle)" />
                        <XAxis dataKey="hour" tick={TICK} {...AXIS} interval={3} />
                        <YAxis tick={TICK} {...AXIS} />
                        <Tooltip content={<TipContent />} cursor={{ stroke: "var(--border-strong)" }} />
                        <Line type="monotone" dataKey="n" name="Translations" stroke="#0D5C3A"
                          strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: "#0D5C3A" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>
            </div>
          </>
        ) : (
          <Panel title="Translation History" icon={Radio}
            action={
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                  <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                    className="pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: "var(--bg-base)", border: "1px solid var(--border-default)", color: "var(--text-primary)", width: 130 }} />
                </div>
                <div className="flex items-center gap-1">
                  <Filter size={10} style={{ color: "var(--text-tertiary)" }} />
                  {[null, ...Object.keys(CODES)].map(k => (
                    <button key={k ?? "all"} onClick={() => setFilter(k)}
                      className="lang-badge transition-all cursor-pointer"
                      style={{
                        background: filter === k ? "var(--accent-dim)" : "transparent",
                        color: filter === k ? "var(--accent)" : "var(--text-tertiary)",
                        border: filter === k ? "1px solid var(--accent-border)" : "none",
                      }}>
                      {k ? CODES[k] : "All"}
                    </button>
                  ))}
                </div>
              </div>
            }>
            <div className="max-h-[600px] overflow-y-auto">
              {recent.length === 0 ? (
                <p className="label text-center py-12">No entries match</p>
              ) : recent.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                  className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 sm:gap-5 px-5 py-4 transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none" }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = "var(--bg-base)")}
                  onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                  <div className="flex items-center gap-1">
                    <span className="lang-badge">{CODES[e.sourceLang] || e.sourceLang}</span>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 9 }}>→</span>
                    <span className="lang-badge" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                      {CODES[e.targetLang] || e.targetLang}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{e.transcript}</p>
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--accent)" }}>{e.translation}</p>
                  <span className="label whitespace-nowrap hidden sm:block">
                    {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </motion.div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

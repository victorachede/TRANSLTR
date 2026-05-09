"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line } from "recharts";
import { Globe2, Mic, Clock, Trash2, TrendingUp, Languages, Activity, Radio, ArrowRight, Download, Search } from "lucide-react";
import Link from "next/link";

interface Entry { id: string; transcript: string; translation: string; sourceLang: string; targetLang: string; ts: string; }
const LABELS: Record<string,string> = { english:"English", tiv:"Tiv", idoma:"Idoma" };
const CODES:  Record<string,string> = { english:"EN", tiv:"TV", idoma:"ID" };
const PALETTE = ["#00D879","#00a85e","#006638","#f59e0b"];

const pop: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const TIP: React.CSSProperties = {
  background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 8,
  padding: "8px 12px", fontSize: 12, color: "var(--fg)", fontFamily: "var(--font)",
};

function Tip({ active, payload, label }: { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TIP}>
      {label && <p style={{ color: "var(--fg-3)", marginBottom: 4, fontSize: 11 }}>{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name} {p.value}</p>)}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, sub, accent }: { label:string; value:string|number; icon:React.ElementType; sub?:string; accent?:boolean }) {
  return (
    <div style={{ borderRadius: 14, padding: "20px 24px", border: "1px solid var(--line)", background: "var(--bg-1)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-3)" }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: accent ? "var(--green-dim)" : "var(--bg-2)", border: `1px solid ${accent ? "var(--green-line)" : "var(--line)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={13} color={accent ? "var(--green)" : "var(--fg-3)"} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children, action }: { title:string; icon:React.ElementType; children:React.ReactNode; action?:React.ReactNode }) {
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", background: "var(--bg-1)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--line)", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={13} color="var(--fg-3)" />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--fg-3)" }}>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter]   = useState<string|null>(null);
  const [search, setSearch]   = useState("");
  const [tab, setTab]         = useState<"overview"|"history">("overview");

  useEffect(() => { try { setEntries(JSON.parse(localStorage.getItem("transltr_history") ?? "[]")); } catch {} }, []);
  const clear = () => { localStorage.removeItem("transltr_history"); setEntries([]); };

  const stats = useMemo(() => {
    const pairs: Record<string,number> = {};
    entries.forEach(e => { const k = `${CODES[e.sourceLang]||e.sourceLang}→${CODES[e.targetLang]||e.targetLang}`; pairs[k]=(pairs[k]||0)+1; });
    const today = entries.filter(e => new Date(e.ts).toDateString() === new Date().toDateString()).length;
    const days = new Set(entries.map(e => new Date(e.ts).toDateString())).size;
    return {
      total: entries.length, today,
      avgDay: entries.length ? Math.round(entries.length / Math.max(1, days)) : 0,
      langs: new Set(entries.map(e => e.targetLang)).size,
      topPair: Object.entries(pairs).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "—",
    };
  }, [entries]);

  const daily7 = useMemo(() => {
    const map: Record<string,number> = {};
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate()-i); map[d.toLocaleDateString([],{weekday:"short"})] = 0; }
    entries.forEach(e => { const d = new Date(e.ts); const diff = Math.floor((Date.now()-d.getTime())/86400000); if (diff<=6) { const k = d.toLocaleDateString([],{weekday:"short"}); if (k in map) map[k]++; } });
    return Object.entries(map).map(([day,n]) => ({day,n}));
  }, [entries]);

  const langDist = useMemo(() => { const c: Record<string,number>={}; entries.forEach(e=>{c[e.targetLang]=(c[e.targetLang]||0)+1;}); return Object.entries(c).map(([k,v])=>({name:LABELS[k]||k,value:v})); }, [entries]);
  const pairData = useMemo(() => { const c: Record<string,number>={}; entries.forEach(e=>{const k=`${CODES[e.sourceLang]||e.sourceLang}→${CODES[e.targetLang]||e.targetLang}`;c[k]=(c[k]||0)+1;}); return Object.entries(c).map(([pair,count])=>({pair,count})).sort((a,b)=>b.count-a.count); }, [entries]);

  const recent = useMemo(() => {
    let f = [...entries].reverse();
    if (filter) f = f.filter(e => e.targetLang===filter || e.sourceLang===filter);
    if (search) f = f.filter(e => e.transcript.toLowerCase().includes(search.toLowerCase()) || e.translation.toLowerCase().includes(search.toLowerCase()));
    return f.slice(0,100);
  }, [entries, filter, search]);

  const TICK = { fill:"var(--fg-3)", fontSize:10, fontFamily:"var(--font)" };
  const AXIS = { axisLine:false, tickLine:false };
  const isEmpty = entries.length === 0;

  const exportCSV = () => {
    const rows = [["Time","Source","Target","Transcript","Translation"], ...entries.map(e=>[new Date(e.ts).toISOString(),e.sourceLang,e.targetLang,e.transcript,e.translation])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n")], {type:"text/csv"}));
    a.download = "transltr-history.csv"; a.click();
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 56, background: "var(--bg)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Analytics</p>
            <h1 style={{ marginTop: 6, fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em" }}>Dashboard</h1>
            {!isEmpty && <p style={{ marginTop: 4, fontSize: 13, color: "var(--fg-3)" }}>{entries.length} translations · {stats.langs} target language{stats.langs!==1?"s":""}</p>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!isEmpty && <>
              <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600, border:"1px solid var(--line)", background:"var(--bg-1)", color:"var(--fg-2)", cursor:"pointer" }}>
                <Download size={12} />Export CSV
              </button>
              <button onClick={clear} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600, border:"1px solid var(--line)", background:"var(--bg-1)", color:"var(--fg-3)", cursor:"pointer" }}>
                <Trash2 size={12} />Clear
              </button>
            </>}
            <Link href="/translator" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, background:"var(--green)", color:"#000", textDecoration:"none" }}>
              <Mic size={13} />New translation
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, borderBottom:"1px solid var(--line)", marginBottom:28 }}>
          {(["overview","history"] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", background:"none", border:"none", borderBottom: tab===t ? "2px solid var(--green)" : "2px solid transparent", color: tab===t ? "var(--fg)" : "var(--fg-3)", marginBottom:-1, textTransform:"capitalize", transition:"color 0.15s" }}>
              {t}
            </button>
          ))}
        </div>

        {isEmpty ? (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, padding:"80px 0", textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:14, border:"1px solid var(--line)", background:"var(--bg-1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Activity size={22} color="var(--fg-3)" />
            </div>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.02em" }}>No translations yet</h2>
              <p style={{ marginTop:6, fontSize:14, color:"var(--fg-2)" }}>Start translating to see analytics and history here.</p>
            </div>
            <Link href="/translator" style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 22px", borderRadius:9, fontSize:14, fontWeight:700, background:"var(--green)", color:"#000", textDecoration:"none" }}>
              <Mic size={14} />Go to Translator <ArrowRight size:={13} />
            </Link>
          </motion.div>
        ) : tab === "overview" ? (
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Stats */}
            <motion.div variants={pop} style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }} className="grid-cols-2 md:grid-cols-4">
              {[
                {label:"Total",    value:stats.total,   icon:Globe2,    sub:"All time",     accent:true },
                {label:"Today",    value:stats.today,   icon:Activity,  sub:"Translations"              },
                {label:"Avg/day",  value:stats.avgDay,  icon:TrendingUp,sub:"Last 7 days"               },
                {label:"Top pair", value:stats.topPair, icon:Languages, sub:"Most used"                 },
              ].map(s => <StatCard key={s.label} {...s} />)}
            </motion.div>

            {/* Charts row 1 */}
            <motion.div variants={pop} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }} className="grid-cols-1 md:grid-cols-2">
              <Panel title="Last 7 Days" icon={Clock}>
                <div style={{ padding:20 }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={daily7} margin={{top:4,right:0,left:-30,bottom:0}}>
                      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00D879" stopOpacity={0.15}/><stop offset="95%" stopColor="#00D879" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="2 4" stroke="var(--line)" />
                      <XAxis dataKey="day" tick={TICK} {...AXIS}/>
                      <YAxis tick={TICK} {...AXIS}/>
                      <Tooltip content={<Tip />} cursor={{stroke:"var(--line-2)"}}/>
                      <Area type="monotone" dataKey="n" name="Translations" stroke="#00D879" strokeWidth={1.5} fill="url(#g)" dot={false} activeDot={{r:3,fill:"#00D879"}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
              <Panel title="By Pair" icon={Languages}>
                <div style={{ padding:20 }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={pairData} margin={{top:0,right:0,left:-30,bottom:0}}>
                      <XAxis dataKey="pair" tick={TICK} {...AXIS}/>
                      <YAxis tick={TICK} {...AXIS}/>
                      <Tooltip content={<Tip />} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
                      <Bar dataKey="count" name="Translations" radius={[4,4,0,0]}>
                        {pairData.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </motion.div>

            {/* Charts row 2 */}
            <motion.div variants={pop} style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12 }} className="grid-cols-1 md:grid-cols-3">
              <Panel title="Target Language" icon={Globe2}>
                <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={langDist} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" stroke="none">
                        {langDist.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={TIP} formatter={(v:unknown)=>[v,"translations"]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  {langDist.map((d,i)=>(
                    <div key={d.name} style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:PALETTE[i%PALETTE.length],flexShrink:0}}/>
                      <span style={{fontSize:12,flex:1,color:"var(--fg-2)"}}>{d.name}</span>
                      <span style={{fontSize:12,fontWeight:700}}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </Panel>
              <div style={{gridColumn:"span 2"}} className="md:col-span-2">
                <Panel title="Activity by Hour" icon={Clock}>
                  <div style={{padding:20}}>
                    <ResponsiveContainer width="100%" height={170}>
                      <LineChart data={Array.from({length:24},(_,h)=>({hour:`${String(h).padStart(2,"0")}h`,n:entries.filter(e=>new Date(e.ts).getHours()===h).length}))} margin={{top:4,right:0,left:-30,bottom:0}}>
                        <CartesianGrid strokeDasharray="2 4" stroke="var(--line)"/>
                        <XAxis dataKey="hour" tick={TICK} {...AXIS} interval={3}/>
                        <YAxis tick={TICK} {...AXIS}/>
                        <Tooltip content={<Tip />} cursor={{stroke:"var(--line-2)"}}/>
                        <Line type="monotone" dataKey="n" name="Translations" stroke="#00D879" strokeWidth={1.5} dot={false} activeDot={{r:3,fill:"#00D879"}}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* History */
          <Panel title="Translation History" icon={Radio}
            action={
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div style={{position:"relative"}}>
                  <Search size={11} style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"var(--fg-3)"}}/>
                  <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}
                    style={{paddingLeft:28,paddingRight:10,paddingTop:6,paddingBottom:6,borderRadius:7,fontSize:12,background:"var(--bg-2)",border:"1px solid var(--line)",color:"var(--fg)",outline:"none",width:130,fontFamily:"var(--font)"}}/>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {[null,...Object.keys(CODES)].map(k=>(
                    <button key={k??"all"} onClick={()=>setFilter(k)}
                      style={{padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:700,cursor:"pointer",border: filter===k ? "1px solid var(--green-line)" : "1px solid transparent",background: filter===k ? "var(--green-dim)" : "transparent",color: filter===k ? "var(--green)" : "var(--fg-3)",letterSpacing:"0.05em"}}>
                      {k ? CODES[k] : "All"}
                    </button>
                  ))}
                </div>
              </div>
            }>
            <div style={{maxHeight:560,overflowY:"auto"}}>
              {recent.length===0 ? (
                <p style={{textAlign:"center",padding:48,fontSize:13,color:"var(--fg-3)"}}>No entries match</p>
              ) : recent.map((e,i)=>(
                <div key={e.id}
                  style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr auto",alignItems:"center",gap:12,padding:"12px 20px",borderTop: i>0 ? "1px solid var(--line)" : "none",transition:"background 0.1s"}}
                  onMouseEnter={ev=>(ev.currentTarget.style.background="var(--bg-2)")}
                  onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    {[CODES[e.sourceLang]||e.sourceLang, CODES[e.targetLang]||e.targetLang].map((code,ci)=>(
                      <span key={ci} style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",padding:"2px 7px",borderRadius:100,background: ci===1 ? "var(--green-dim)" : "var(--bg-3)",color: ci===1 ? "var(--green)" : "var(--fg-3)",border: ci===1 ? "1px solid var(--green-line)" : "1px solid var(--line)"}}>{code}</span>
                    ))}
                  </div>
                  <p style={{fontSize:13,color:"var(--fg-2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.transcript}</p>
                  <p style={{fontSize:13,fontWeight:600,color:"var(--green)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.translation}</p>
                  <span style={{fontSize:11,color:"var(--fg-3)",whiteSpace:"nowrap"}}>{new Date(e.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

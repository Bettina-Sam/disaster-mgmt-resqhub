import React, { useEffect, useMemo, useRef, useState } from "react";
import "./games-hub.css";

/* ========= DATA ========= */
const DISASTERS = [
  { id: "flood",      name: "Flood",      emoji: "🌊", hue: 210, tags: ["Go-bag","Kid-friendly","Fast"] },
  { id: "fire",       name: "Fire",       emoji: "🔥", hue:   8, tags: ["Smoke safety","Speed"] },
  { id: "earthquake", name: "Quake",      emoji: "🌎", hue: 160, tags: ["Drop-Cover-Hold","Routes"] },
  { id: "cyclone",    name: "Cyclone",    emoji: "🌪️", hue: 265, tags: ["Wind hazards"] },
  { id: "accident",   name: "Accident",   emoji: "🚑", hue: 330, tags: ["First-aid"] },
];

const LEVELS = [
  { key:"beginner", label:"Beginner", time:45 },
  { key:"medium",   label:"Medium",   time:40 },
  { key:"advanced", label:"Advanced", time:35 },
];

const HOW = {
  cyclone: {
    beginner:{ title:"Wind-Safe Room", bullets:["Pick the safest indoor place (no windows, inside wall).","Keep a small kit nearby."], skills:["Shelter selection"], controls:"Click/tap.", coach:true, legend:"🚪 inner room • 🪟 windows (no!)" },
    medium:{ title:"Windy Grid Collect", bullets:["Use Arrow keys to grab supplies and avoid 🌊/💨/🌀/💥.","Reach the green square when you have everything."], skills:["Movement timing","Hazard recognition"], controls:"Arrow keys (keyboard).", coach:true, legend:"💨 smoke • 🌊 wave • 🌀 twister • 💥 boom" },
    advanced:{ title:"Rescue Drop (Head-Start)", bullets:["Study who needs what; arrange drop order in 10s head-start.","Press Start and the helicopter auto-drops 🎒 in your order. Wind increases!"], skills:["Prioritization","Logistics under wind"], controls:"Order items • Start (auto-drop).", coach:true, legend:"💧 water • 💊 meds • 🐾 pet • 🔦 torch" },
  },
  fire: {
    beginner:{ title:"Find Extinguisher & Exit", bullets:["Pick up the 🧯 then reach 🚪.","Avoid smoke; stay low."], skills:["Navigation","Smoke avoidance"], controls:"WASD/Arrows, swipe, buttons", coach:true, legend:"🧯 extinguisher • 🚪 exit • ☁️ smoke" },
    medium:{ title:"Tool Match Scenes", bullets:["Drag the right tool to each mini-scene.","Plan a path that passes hotspots."], skills:["Tool choice","Path planning"], controls:"Drag & Drop / Tap-carry", coach:true, legend:"🛠️ tools • 🔥 hotspot" },
    advanced:{ title:"Crew Plan & Run", bullets:["Draw route (PLAN), then simulate (RUN).","Keep inside cooling circle."], skills:["Routing","Risk control"], controls:"Draw path → Run", coach:true, legend:"⭕ cooling • 🔥 hotspot" },
  },
  flood: {
    beginner:{ title:"Quick Go-Bag", bullets:["Drag essentials into backpack.","Place 🧱 sandbags to stop leaks."], skills:["Item triage","Barrier placement"], controls:"Drag/Drop • Click place", coach:true, legend:"🧱 sandbag • ⚡ electric • 🌉 bridge" },
    medium:{ title:"Match & Route", bullets:["Flip safety pairs.","Reach 🟩 via high roads; avoid ⚡."], skills:["Memory","Safe routing"], controls:"Click/tap", coach:false, legend:"⬆ high road • ⚡ live line" },
    advanced:{ title:"Shortest Safe Path", bullets:["Place checkpoints in order.","Avoid currents (blue arrows)."], skills:["Pathfinding"], controls:"Click to mark → Run", coach:false, legend:"↗ current • 🌉 bridge • ⛰️ high ground" },
  },
  earthquake: {
    beginner:{ title:"Drop-Cover-Hold", bullets:["Find solid cover.","Hold until shaking stops."], skills:["Hazard awareness"], controls:"Click/tap", coach:true, legend:"🪑 table • 🧱 fall zone" },
    medium:{ title:"Aftershock Route", bullets:["Select safe rooms to muster point.","Prefer stairs; avoid elevators/glass."], skills:["Route planning"], controls:"Click rooms", coach:true, legend:"↗ stairs • ⛔ elevator" },
    advanced:{ title:"Evac Plan & Run", bullets:["Draw path; then Run.","Avoid red danger circles."], skills:["Evacuation path"], controls:"Draw path → Run", coach:false, legend:"🔴 danger • 🟩 safe" },
  },
  accident: {
    beginner:{ title:"First-Aid Kit", bullets:["Drag essentials into kit.","Avoid decoys."], skills:["Item triage"], controls:"Drag/Drop", coach:true, legend:"🩹 bandage • 🧤 gloves • ❌ decoy" },
    medium:{ title:"Collect & Avoid", bullets:["Collect items; avoid hazards.","Reach 🟩 with full bag."], skills:["Movement","Avoidance"], controls:"Arrows", coach:true, legend:"🟥 hazard • 🟩 safe" },
    advanced:{ title:"Triage Tags", bullets:["Read clue; pick tag color.","Review ✅/❌ at the end."], skills:["Triage"], controls:"Click options", coach:false, legend:"🟢 minor • 🟡 delayed • 🔴 immediate • ⚫ expectant" },
  },
};

/* ========= UTILS ========= */
const ls = {
  get(k, f) { try { const v = localStorage.getItem(k); return v ?? f; } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
function pickInitialDisaster() {
  const last = ls.get("gh.active", null);
  if (last && DISASTERS.some(d => d.id === last)) return last;
  const hash = (typeof window !== "undefined" && window.location.hash?.slice(1)) || "";
  if (hash && DISASTERS.some(d => d.id === hash)) return hash;
  return DISASTERS[Math.floor(Math.random()*DISASTERS.length)].id; // no flood bias
}

/* ========= MAIN ========= */
export default function GamesHub({ onStart }) {
  const [active, setActive] = useState(pickInitialDisaster);
  const [level, setLevel]   = useState(ls.get("gh.level", "beginner"));
  const [coachOn, setCoachOn] = useState(true);

  useEffect(()=> ls.set("gh.active", active), [active]);
  useEffect(()=> ls.set("gh.level", level), [level]);

  const dMeta     = useMemo(()=> DISASTERS.find(d=>d.id===active) || DISASTERS[0], [active]);
  const info      = useMemo(()=> (HOW[active] && HOW[active][level]) || null, [active, level]);
  const levelMeta = useMemo(()=> LEVELS.find(l=>l.key===level) || LEVELS[0], [level]);

  // keyboard: cycle disasters, Enter starts
  useEffect(()=>{
    const onKey=(e)=>{
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){
        e.preventDefault();
        const i=DISASTERS.findIndex(x=>x.id===active);
        const next=(e.key==="ArrowRight"||e.key==="ArrowDown") ? (i+1)%DISASTERS.length : (i-1+DISASTERS.length)%DISASTERS.length;
        setActive(DISASTERS[next].id);
      }
      if(e.key==="Enter") onStart?.({disaster:active, level});
    };
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  },[active, level, onStart]);

  return (
    <div
      className="gh-root"
      style={{
        ["--accent"]: `hsl(${dMeta.hue} 92% 62%)`,
        ["--accent-weak"]: `hsl(${dMeta.hue} 92% 20% / .45)`,
      }}
    >
      {/* glowing lights layer */}
      <div className="gh-glow" aria-hidden />

      <header className="gh-head">
        <div className="left">
          <h3>🎮 Academy Games</h3>
          <span className="tag">Kid-friendly</span>
          <span className="tag">Neon/Space</span>
          <span className="tag">Keyboard & Touch</span>
        </div>
        <div className="right">
          <button className="btn ghost" onClick={()=> setActive(DISASTERS[Math.floor(Math.random()*DISASTERS.length)].id)}>🎲 Surprise</button>
          <button className="btn ghost" onClick={()=> setCoachOn(v=>!v)}>{coachOn ? "👩‍🏫 Coach On" : "👩‍🏫 Coach Off"}</button>
        </div>
      </header>

      <main className="gh-grid">
        {/* LEFT: full-height vertical list */}
        <aside className="card left-col">
          <div className="dis-list">
            {DISASTERS.map(d=>{
              const selected = active===d.id;
              return (
                <button key={d.id} className={`dis-row ${selected?"active":""}`} onClick={()=>setActive(d.id)}>
                  <div className="row-left">
                    <span className="icon" aria-hidden>{d.emoji}</span>
                    <span className="title">{d.name}</span>
                  </div>
                  <div className="row-right">
                    {d.tags.map(t=> <span key={t} className="tag small">{t}</span>)}
                    {selected && <span className="tag small accent">Selected</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT: details */}
        <section className="card right-col">
          <div className="level-row">
            <strong>Level</strong>
            <div className="level-btns" role="radiogroup" aria-label="Select level">
              {LEVELS.map(l=>(
                <button
                  key={l.key}
                  role="radio"
                  aria-checked={level===l.key}
                  className={`btn ${level===l.key?"primary":"outline"}`}
                  onClick={()=>setLevel(l.key)} /* does NOT change active */
                >{l.label}</button>
              ))}
            </div>
            <div className="eta">⏱ {levelMeta.time}s</div>
          </div>

          <div className="info">
            <div className="info-hd">
              <div className="title">{dMeta.emoji} {dMeta.name} — {info?.title || levelMeta.label}</div>
              <div className="chips">
                {(info?.skills || []).map(s=> <span key={s} className="chip">{s}</span>)}
              </div>
            </div>
            <ul className="bullets">
              {(info?.bullets || [
                "Complete the objective before time runs out.",
                "Avoid hazards, use safe routes/tools.",
              ]).map((b,i)=> <li key={i}>{b}</li>)}
            </ul>
            <div className="legend">
              <span className="muted">Controls:</span> {info?.controls || "Mouse/Touch/Keyboard"}
              <span className="sep" />
              <span className="muted">Legend:</span> {info?.legend || "🟩 safe • 🔴 hazard"}
              {info?.coach && coachOn && <span className="coach">👩‍🏫 Coach tips enabled</span>}
            </div>
          </div>

          <MiniPreview disaster={active} hue={dMeta.hue} />

          <div className="cta-row">
            <div className="hint">Use arrows / WASD or tap. Press Enter to start.</div>
            <button className="btn cta" onClick={()=> onStart?.({disaster:active, level})}>
              🚀 Start {dMeta.name} • {levelMeta.label}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ===== Mini preview grid (for vibes) ===== */
function MiniPreview({ disaster, hue }) {
  const size=6, cell=26;
  const hazards = useMemo(()=>{
    const H=new Set(), marks=[];
    const put=(x,y,s)=>{H.add(`${x},${y}`); marks.push({x,y,s});};
    const rng=(n)=> Math.abs(Math.sin(n*999 + hue));
    for(let i=1;i<size-1;i++){
      const r=Math.floor(rng(i)*(size-1));
      if(disaster==='fire') put(i,r,'🔥');
      if(disaster==='flood') put(r,i,'💧');
      if(disaster==='cyclone') put((i+r)%size,i,'💨');
      if(disaster==='earthquake') put(i,(r+2)%size,'🧱');
      if(disaster==='accident') put((i+1)%size,r,'🟥');
    }
    return {H,marks};
  },[disaster,hue]);

  return (
    <div className="preview card">
      <div className="gridN" style={{gridTemplateColumns:`repeat(${size}, ${cell}px)`}}>
        {Array.from({length:size*size}).map((_,idx)=>{
          const x=idx%size, y=Math.floor(idx/size);
          const bad=hazards.H.has(`${x},${y}`);
          const mark=hazards.marks.find(m=>m.x===x && m.y===y)?.s;
          const goal=x===size-1 && y===size-1;
          return (
            <div key={idx} className={`cell ${bad?"haz":""} ${goal?"goal":""}`} style={{width:cell,height:cell}}>
              <span className="mark" aria-hidden>{mark}</span>
            </div>
          );
        })}
      </div>
      <div className="preview-legend"><span>🟩 Goal</span><span>Hazards vary</span></div>
    </div>
  );
}

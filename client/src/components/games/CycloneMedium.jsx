import React, { useEffect, useMemo, useRef, useState } from "react";
import "./cyclone-medium.css";

export default function CycloneMedium({ onBack }) {
  const START_TIME = 55;     // seconds
  const RUN_SPEED  = 260;    // px/s
  const EDGE_PX    = 6;
  const RUNNER_PX  = 52;

  // ---- 4x3 neighborhood grid (r x c) ----
  // Goal: go from Home to School Shelter avoiding flood (🌊) and downed lines (⚡).
  const nodes = useMemo(
    () => [
      // row 0
      { id: "home",   label: "Home",          emoji: "🏠", r: 0, c: 0 },
      { id: "lane",   label: "High Lane",     emoji: "🛣️", r: 0, c: 1 },
      { id: "bridge", label: "Low Bridge",    emoji: "🌉", r: 0, c: 2 }, // risky if surge high
      { id: "pole",   label: "Power Lines",   emoji: "⚡", r: 0, c: 3 }, // avoid

      // row 1
      { id: "shop",   label: "Shops",         emoji: "🏪", r: 1, c: 0 },
      { id: "park",   label: "Small Park",    emoji: "🌳", r: 1, c: 1 },
      { id: "water",  label: "Waterlogged",   emoji: "🌊", r: 1, c: 2 }, // avoid
      { id: "alley",  label: "Narrow Alley",  emoji: "🧱", r: 1, c: 3 },

      // row 2
      { id: "flat3",  label: "Apartment 3F",  emoji: "🏢", r: 2, c: 0 },
      { id: "hill",   label: "High Ground",   emoji: "⛰️", r: 2, c: 1 }, // good
      { id: "yard",   label: "Open Yard",     emoji: "🏡", r: 2, c: 2 },
      { id: "truck",  label: "Relief Truck",  emoji: "🚚", r: 2, c: 3 },

      // row 3
      { id: "clinic", label: "Clinic",        emoji: "🏥", r: 3, c: 0 },
      { id: "road",   label: "Main Road",     emoji: "🛤️", r: 3, c: 1 },
      { id: "school", label: "School Shelter",emoji: "🟩", r: 3, c: 2 }, // destination
      { id: "gate",   label: "Back Gate",     emoji: "🚧", r: 3, c: 3 },
    ], []
  );

  const N = useMemo(() => {
    const m = new Map();
    nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [nodes]);

  // ---- state ----
  const [mode, setMode]   = useState("IDLE"); // IDLE | PLAN | RUN
  const [coachOn, setCoachOn] = useState(true);
  const [time, setTime]   = useState(START_TIME);
  const [path, setPath]   = useState([]);     // array of node ids
  const [runner, setRunner] = useState({ x: 0, y: 0, seg: 0, t: 0 });
  const runningRef = useRef(false);
  const boardRef   = useRef(null);
  const [banner, setBanner] = useState(null); // {win, title, sub}

  // Surge meter (rises with time) -> makes low bridge worse mid-run
  const [surge, setSurge] = useState(20); // 0..100

  // ---- voice coach ----
  function speak(t) {
    if (!coachOn) return;
    try {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-US"; u.rate = 1; u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }
  function toggleCoach() {
    setCoachOn(v => !v);
    try { window.speechSynthesis.cancel(); } catch {}
  }

  // ---- layout helpers ----
  function cellCenterLocal(r, c) {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const pad = 24;
    const W = rect.width  - pad * 2;
    const H = rect.height - pad * 2;
    const cols = 4, rows = 4;
    const cw = W / cols, ch = H / rows;
    return { x: pad + cw * c + cw / 2, y: pad + ch * r + ch / 2 };
  }

  // build orthogonal segments from path (auto 90° bends)
  function orthSegmentsFromPath(ids) {
    const segs = [];
    for (let i = 0; i < ids.length - 1; i++) {
      const A = N.get(ids[i]); const B = N.get(ids[i + 1]);
      if (!A || !B) continue;

      const pairs = [];
      if (A.r === B.r || A.c === B.c) {
        pairs.push([A, B]);
      } else {
        const bend = { r: A.r, c: B.c };
        pairs.push([A, bend], [bend, B]);
      }

      pairs.forEach(([P, Q]) => {
        const a = cellCenterLocal(P.r, P.c);
        const b = cellCenterLocal(Q.r, Q.c);
        if (P.r === Q.r) {
          const left = Math.min(a.x, b.x);
          const width = Math.abs(b.x - a.x);
          segs.push({ type: "h", left, top: a.y, width });
        } else {
          const top = Math.min(a.y, b.y);
          const height = Math.abs(b.y - a.y);
          segs.push({ type: "v", left: a.x, top, height });
        }
      });
    }
    return segs;
  }
  const segs = orthSegmentsFromPath(path);

  // ---- game controls ----
  function startGame() {
    setMode("PLAN");
    setTime(START_TIME);
    setPath([]);
    setRunner({ x: 0, y: 0, seg: 0, t: 0 });
    setBanner(null);
    setSurge(20);
    speak("Plan a dry, safe route to the school shelter. Avoid flood water and power lines.");
  }

  function onRun() {
    if (mode !== "PLAN") return;
    if (path.length < 2) { speak("Pick at least two places to form a path."); return; }
    setMode("RUN");
    runningRef.current = true;
    const first = N.get(path[0]);
    const p = cellCenterLocal(first.r, first.c);
    setRunner({ x: p.x, y: p.y, seg: 0, t: 0 });
    setBanner(null);
    speak("Running the route. Stay on high ground. Avoid water and wires.");
    animate();
  }
  function onStop() {
    runningRef.current = false;
    setMode("PLAN");
    try { window.speechSynthesis.cancel(); } catch {}
  }
  function onClear() {
    if (mode !== "PLAN") return;
    setPath([]);
    setBanner(null);
    speak("Path cleared. Tap places to plan again.");
  }
  function onNodeClick(id) {
    if (mode !== "PLAN") return;
    setPath(p => {
      if (!p.length) return [id];
      if (p[p.length - 1] === id) return p;
      const idx = p.indexOf(id);
      if (idx !== -1) return p.slice(0, idx + 1);
      return [...p, id];
    });
  }

  // ---- timer & surge during run ----
  useEffect(() => {
    if (mode !== "RUN") return;
    if (time <= 0) {
      runningRef.current = false;
      setMode("PLAN");
      verdict("timeout");
      return;
    }
    const t = setTimeout(() => setTime(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, time]);

  useEffect(() => {
    if (mode !== "RUN") return;
    const t = setInterval(() => setSurge(s => Math.min(100, s + 1.8)), 1000);
    return () => clearInterval(t);
  }, [mode]);

  // ---- animate along orth path ----
  function animate() {
    // expand path into points with bends
    const pts = [];
    for (let i = 0; i < path.length; i++) {
      const n = N.get(path[i]);
      pts.push(cellCenterLocal(n.r, n.c));
      if (i < path.length - 1) {
        const a = N.get(path[i]), b = N.get(path[i + 1]);
        if (a.r !== b.r && a.c !== b.c) pts.push(cellCenterLocal(a.r, b.c));
      }
    }
    // dedupe consecutive duplicates
    const clean = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i], q = clean[clean.length - 1];
      if (Math.abs(p.x - q.x) > 0.5 || Math.abs(p.y - q.y) > 0.5) clean.push(p);
    }
    if (clean.length < 2) { runningRef.current = false; setMode("PLAN"); return; }

    let last = performance.now();
    let seg = 0, t = 0;

    const step = (now) => {
      if (!runningRef.current) return;
      const dt = (now - last) / 1000; last = now;

      let a = clean[seg], b = clean[seg + 1];
      const segLen = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      t += (RUN_SPEED * dt) / segLen;

      while (t >= 1 && seg < clean.length - 2) {
        t -= 1; seg += 1;
        a = clean[seg]; b = clean[seg + 1];
      }

      if (t >= 1 && seg >= clean.length - 2) {
        setRunner({ x: b.x, y: b.y, seg, t: 1 });
        runningRef.current = false;
        setMode("PLAN");
        verdict("finished");
        return;
      }

      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      setRunner({ x, y, seg, t });

      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---- verdict & banner ----
  function evaluatePath(ids) {
    const startOK = ids[0] === "home";
    const endOK   = ids[ids.length - 1] === "school";

    const hasWater  = ids.includes("water");
    const hasLines  = ids.includes("pole");
    const usedHill  = ids.includes("hill");
    const usedLane  = ids.includes("lane");
    const usedBridge= ids.includes("bridge");

    if (!startOK || !endOK) {
      return { win:false, title:"Wrong start or destination", sub:"Begin at Home, end at School Shelter." };
    }
    if (hasLines) {
      return { win:false, title:"Danger: Power lines", sub:"Avoid ⚡ spots after cyclones." };
    }
    if (hasWater) {
      return { win:false, title:"Flooded route", sub:"Skip 🌊 areas; water hides holes and snakes." };
    }
    if (usedBridge && surge > 60) {
      return { win:false, title:"Low bridge unsafe", sub:"When surge is high, choose high ground." };
    }

    // Good paths prefer hill or high lane
    if (usedHill || usedLane) {
      return { win:true, title:"Dry, safe route!", sub:"Great job choosing high ground." };
    }
    return { win:true, title:"Safe route!", sub:"Nice. High ground is usually best." };
  }

  function verdict(kind) {
    if (kind === "timeout") {
      setBanner({ win:false, title:"Time’s up", sub:"Plan quicker—avoid water and wires." });
      speak("Time’s up. Plan a faster dry route next time.");
      return;
    }
    const result = evaluatePath(path);
    setBanner(result);
    speak(result.win ? "Nice! Dry and safe route." : "That path was risky. Let's try a higher route.");
  }

  // ---- UI helpers ----
  const mmss = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;

  return (
    <div className="cm-wrap">
      <div className="cm-top">
        <div className="cm-title"><span className="dot" /> Cyclone — Medium: Dry Route Planner</div>
        <div className="cm-row">
          <span className="cm-pill">⏱ {mmss}</span>
          <span className="cm-pill">🌊 Surge {Math.round(surge)}%</span>
          <button className="cm-btn cta"  onClick={startGame} disabled={mode === "RUN"}>Start</button>
          <button className="cm-btn cta2" onClick={onRun} disabled={mode !== "PLAN" || path.length < 2}>Run</button>
          <button className="cm-btn"     onClick={onStop} disabled={mode !== "RUN"}>Stop</button>
          <button className="cm-btn danger" onClick={onClear} disabled={mode !== "PLAN"}>Clear</button>
          <button className={`cm-btn ${coachOn ? "on" : ""}`} onClick={toggleCoach}>🔊 {coachOn ? "Coach On" : "Coach Off"}</button>
          <button className="cm-btn soft" onClick={onBack}>← Back</button>
        </div>
      </div>

      <div className="cm-board" ref={boardRef}>
        {/* planned / running path */}
        {segs.map((s, i) =>
          s.type === "h" ? (
            <div
              key={`h${i}`}
              className={`cm-edge ${mode === "RUN" ? "active" : "planned"}`}
              style={{
                left: s.left,
                top: s.top,
                width: s.width,
                height: EDGE_PX,
                transform: "translateY(-50%)",
                borderRadius: EDGE_PX / 2,
              }}
            />
          ) : (
            <div
              key={`v${i}`}
              className={`cm-edge ${mode === "RUN" ? "active" : "planned"}`}
              style={{
                left: s.left,
                top: s.top,
                width: EDGE_PX,
                height: s.height,
                transform: "translateX(-50%)",
                borderRadius: EDGE_PX / 2,
              }}
            />
          )
        )}

        {/* nodes */}
        {nodes.map(n => {
          const inPath = path.includes(n.id);
          const isLast = path[path.length - 1] === n.id && mode !== "IDLE";
          const p = cellCenterLocal(n.r, n.c);
          const risky = (n.id === "water") || (n.id === "pole") || (n.id === "bridge" && surge > 60);
          return (
            <div
              key={n.id}
              className={`cm-node ${inPath ? "inpath" : ""} ${isLast ? "last" : ""} ${risky ? "risky" : ""}`}
              style={{ left: p.x, top: p.y }}
              onClick={() => onNodeClick(n.id)}
              title={n.label}
            >
              <span className="emo dance">{n.emoji}</span>
              <div className="cap">{n.label}</div>
            </div>
          );
        })}

        {/* runner */}
        {mode === "RUN" && (
          <div className="cm-runner" style={{ left: runner.x, top: runner.y }}>
            <span className="emo bob" style={{ fontSize: RUNNER_PX, lineHeight: 1 }}>🚶‍♂️</span>
          </div>
        )}
      </div>

      <div className="cm-tip">
        Plan a <b>dry</b> path to the <b>School Shelter</b>. <b>Avoid</b> 🌊 water and ⚡ power lines. Choose <b>high ground</b> like ⛰️ Hill or 🛣️ High Lane.
      </div>

      {banner && (
        <div className="cm-overlay" onClick={() => setBanner(null)}>
          <div className="cm-center">
            <div className={`cm-title2 ${banner.win ? "win" : "lose"}`}>
              {banner.win ? "VICTORY" : "TRY AGAIN"}
            </div>
            <div className="cm-sub2">
              {banner.title}{banner.sub ? ` • ${banner.sub}` : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./quake-medium.css";

export default function QuakeMedium({ onBack }) {
  const START_TIME = 50;     // seconds
  const RUN_SPEED  = 280;    // px/s
  const EDGE_PX    = 6;      // path thickness
  const RUNNER_PX  = 36;     // runner emoji size

  // ---- nodes on a 3x3 grid ----
  const nodes = useMemo(
    () => [
      { id: "class",  label: "Classroom", emoji: "🏫", r: 0, c: 0 },
      { id: "lobby",  label: "Lobby",     emoji: "🛎️", r: 0, c: 1 },
      { id: "glass",  label: "Glass",     emoji: "🪟", r: 0, c: 2 },

      { id: "lab",    label: "Lab",       emoji: "🧪", r: 1, c: 0 },
      { id: "core",   label: "Core",      emoji: "⚙️", r: 1, c: 1 },
      { id: "lift",   label: "Lift",      emoji: "🛗", r: 1, c: 2 },

      { id: "room",   label: "Room",      emoji: "🚪", r: 2, c: 0 },
      { id: "hall",   label: "Hall",      emoji: "🧭", r: 2, c: 1 }, // treat as stairs
      { id: "muster", label: "Muster",    emoji: "🟩", r: 2, c: 2 },
    ],
    []
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
    if (!coachOn) {
      speak("Tap Start, click rooms to plan a safe route. Press Run to follow it. Avoid glass and elevators.");
    } else {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  // ---- layout helpers ----
  function cellCenterLocal(r, c) {
    const el = boardRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const pad = 24;
    const W = rect.width  - pad * 2;
    const H = rect.height - pad * 2;
    const cw = W / 3;
    const ch = H / 3;
    return { x: pad + cw * c + cw / 2, y: pad + ch * r + ch / 2 };
  }

  // build orthogonal segments from path (auto 90° bends)
  function orthSegmentsFromPath(ids) {
    const segs = [];
    for (let i = 0; i < ids.length - 1; i++) {
      const A = N.get(ids[i]);
      const B = N.get(ids[i + 1]);
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
    runningRef.current = false;
    speak("Planning started. Click rooms to build your route.");
  }

  function onRun() {
    if (mode !== "PLAN") return;
    if (path.length < 2) { speak("Pick at least two rooms to form a path."); return; }
    setMode("RUN");
    runningRef.current = true;
    const first = N.get(path[0]);
    const p = cellCenterLocal(first.r, first.c);
    setRunner({ x: p.x, y: p.y, seg: 0, t: 0 });
    setBanner(null);
    speak("Running the drill. Follow your safe route.");
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
    speak("Path cleared. Tap rooms to plan again.");
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

  // ---- timer during run ----
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
  }, [mode, time]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- animate along orthogonal path ----
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
    const startOK = ids[0] === "class";
    const endOK   = ids[ids.length - 1] === "muster";
    const hasLift = ids.includes("lift");
    const hasGlass= ids.includes("glass");
    const hasHall = ids.includes("hall");

    if (!startOK || !endOK) {
      return { win:false, title:"Wrong start or destination", sub:"Begin at Classroom, end at Muster point." };
    }
    if (hasLift || hasGlass) {
      return { win:false, title:"Risky route", sub: hasLift ? "Elevators are unsafe after earthquakes." : "Avoid glass—risk of shattering." };
    }
    if (hasHall) {
      return { win:true, title:"Safe route!", sub:"Great job choosing the stairs." };
    }
    return { win:true, title:"Safe route!", sub:"Good choice. Prefer stairs (Hall) when possible." };
  }

  function verdict(kind) {
    if (kind === "timeout") {
      setBanner({ win:false, title:"Time’s up", sub:"Plan a quicker route next time." });
      speak("Time’s up. Plan a faster safe route next time.");
      return;
    }
    const result = evaluatePath(path);
    setBanner(result);
    speak(result.win ? "Nice! Safe route." : "That route was risky. Let's try again.");
  }

  // ---- UI helpers ----
  const mmss = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;

  return (
    <div className="qm-wrap">
      <div className="qm-top">
        <div className="qm-title"><span className="dot" /> Quake — Medium: Aftershock Drill</div>
        <div className="qm-row">
          <span className="qm-pill">⏱ {mmss}</span>
          <button className="qm-btn cta"  onClick={startGame} disabled={mode === "RUN"}>Start</button>
          <button className="qm-btn cta2" onClick={onRun} disabled={mode !== "PLAN" || path.length < 2}>Run</button>
          <button className="qm-btn"     onClick={onStop} disabled={mode !== "RUN"}>Stop</button>
          <button className="qm-btn danger" onClick={onClear} disabled={mode !== "PLAN"}>Clear</button>
          <button className={`qm-btn ${coachOn ? "on" : ""}`} onClick={toggleCoach}>🔊 {coachOn ? "Coach On" : "Coach Off"}</button>
          <button className="qm-btn soft" onClick={onBack}>← Back</button>
        </div>
      </div>

      <div className="qm-board" ref={boardRef}>
        {/* planned / running path */}
        {segs.map((s, i) =>
          s.type === "h" ? (
            <div
              key={`h${i}`}
              className={`qm-edge ${mode === "RUN" ? "active" : "planned"}`}
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
              className={`qm-edge ${mode === "RUN" ? "active" : "planned"}`}
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
          return (
            <div
              key={n.id}
              className={`qm-node ${inPath ? "inpath" : ""} ${isLast ? "last" : ""}`}
              style={{ left: p.x, top: p.y }}
              onClick={() => onNodeClick(n.id)}
              title={n.label}
            >
              <span className="emo">{n.emoji}</span>
              <div className="cap">{n.label}</div>
            </div>
          );
        })}

        {/* runner */}
        {mode === "RUN" && (
          <div className="qm-runner" style={{ left: runner.x, top: runner.y }}>
            <span className="emo" style={{ fontSize: RUNNER_PX, lineHeight: 1 }}>🏃‍♀️</span>
          </div>
        )}
      </div>

      <div className="qm-tip">
        Plan your safe path. <b>Stairs good</b>, <b>elevator bad</b>, avoid <b>glass</b>. During aftershocks, drop–cover–hold if needed.
      </div>

      {banner && (
        <div className="qm-overlay" onClick={() => setBanner(null)}>
          <div className="qm-center">
            <div className={`qm-title2 ${banner.win ? "win" : "lose"}`}>
              {banner.win ? "VICTORY" : "TRY AGAIN"}
            </div>
            <div className="qm-sub2">
              {banner.title}{banner.sub ? ` • ${banner.sub}` : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

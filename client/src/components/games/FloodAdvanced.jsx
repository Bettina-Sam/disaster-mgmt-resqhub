import React, { useEffect, useMemo, useRef, useState } from "react";
import "./flood-advanced.css";

/**
 * Flood — Advanced: Safe Route Scout
 * Learn: avoid deep water & currents, steer clear of ⚡, prefer high ground & bridges to reach shelter.
 *
 * How to play:
 * - Click adjacent tiles to draw a path from 🏠 to 🟩 Shelter.
 * - Avoid ⚡ (downed wires), deep water (30cm+), and strong current arrows.
 * - Bridges let you cross water safely. High-ground roads score bonus.
 * - Undo or Clear anytime. Finish before the timer runs out!
 */

export default function FloodAdvanced({ onExit }) {
  // ------------------- config -------------------
  const W = 12;           // cols
  const H = 8;            // rows
  const TIME = 60;        // seconds
  const START = { r: 6, c: 1 };  // 🏠
  const GOAL  = { r: 2, c: 10 }; // 🟩 shelter

  // scoring weights (tuneable)
  const SCORE = {
    step: -1,         // each step costs a tiny effort
    shallow: -1,      // ≤ 15cm
    deep: -3,         // ≥ 30cm (danger!)
    current: -2,      // crossing current zones
    electric: -8,     // downed wires (severe, and fail condition)
    high: +2,         // high ground preference
    bridgeBonus: +3,  // good bridge usage
    reachShelter: +10 // goal
  };

  const [time, setTime] = useState(TIME);
  const [state, setState] = useState("IDLE"); // IDLE | PLAY | END
  const [coach, setCoach] = useState(true);
  const [banner, setBanner] = useState(null);

  // Speech
  function speak(t) {
    if (!coach) return;
    try {
      const u = new SpeechSynthesisUtterance(t);
      u.rate = 1; u.pitch = 1; u.volume = .95; u.lang = "en-IN";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  // ------------------- map model -------------------
  // kinds: road, high (road but elevated), shallow, deep, current, electric, bridge
  const baseMap = useMemo(() => {
    // start with all road
    const m = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ kind: "road" })));

    // elevation (high ground roads)
    [
      [1,2],[1,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
      [0,9],[1,9],[2,9],[3,9],[4,9],
    ].forEach(([r,c]) => m[r][c] = { kind: "high" });

    // shallow water (wading but risky)
    [
      [5,5],[5,6],[5,7],[6,5],[6,6],[6,7],
      [3,6],[3,7]
    ].forEach(([r,c]) => m[r][c] = { kind: "shallow" });

    // deep water (≥30cm)
    [
      [4,6],[4,7],[4,8],[5,8],[6,8]
    ].forEach(([r,c]) => m[r][c] = { kind: "deep" });

    // currents (arrows)
    [
      [3,5],[4,5],[5,5],[6,5]
    ].forEach(([r,c]) => m[r][c] = { kind: "current" });

    // downed electric hazard (⚡) — must avoid
    [
      [6,2],[5,2]
    ].forEach(([r,c]) => m[r][c] = { kind: "electric" });

    // bridge that spans deep/shallow safely
    // visually sits on [4,6]→[4,7]→[4,8]
    [
      [4,6],[4,7],[4,8]
    ].forEach(([r,c]) => m[r][c] = { kind: "bridge" });

    // mark start & goal overlays (still road/high underneath)
    m[START.r][START.c].start = true;
    m[GOAL.r][GOAL.c].goal = true;
    return m;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [path, setPath] = useState([{ r: START.r, c: START.c }]); // sequence of points
  const [score, setScore] = useState(0);
  const [electricTouched, setElectricTouched] = useState(false);
  const boardRef = useRef(null);

  // ------------------- timer -------------------
  useEffect(() => {
    if (state !== "PLAY") return;
    const t = setInterval(() => setTime(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => {
    if (state === "PLAY" && time === 0) {
      end(false, "Time’s up", "Plan a safer, quicker route next time.");
    }
  }, [time, state]);

  // ------------------- helpers -------------------
  const same = (a, b) => a.r === b.r && a.c === b.c;
  const adjacent = (a, b) => {
    const dr = Math.abs(a.r - b.r);
    const dc = Math.abs(a.c - b.c);
    return (dr + dc === 1); // 4-way adjacency only
  };

  function tileClass(cell) {
    const k = cell.kind;
    return `k-${k}` + (cell.start ? " k-start" : "") + (cell.goal ? " k-goal" : "");
  }

  // score calc for stepping *onto* tile p
  function scoreForStep(from, p) {
    const cell = baseMap[p.r][p.c];
    let s = SCORE.step;

    if (cell.kind === "high") s += SCORE.high;
    if (cell.kind === "shallow") s += SCORE.shallow;
    if (cell.kind === "deep") s += SCORE.deep;
    if (cell.kind === "current") s += SCORE.current;
    if (cell.kind === "electric") {
      s += SCORE.electric;
    }
    // If bridge, cancel water penalties & add bonus
    if (cell.kind === "bridge") {
      s -= SCORE.shallow < 0 ? SCORE.shallow : 0;
      s -= SCORE.deep < 0 ? SCORE.deep : 0;
      s += SCORE.bridgeBonus;
    }
    return s;
  }

  function startGame() {
    setState("PLAY");
    setTime(TIME);
    setPath([{ r: START.r, c: START.c }]);
    setScore(0);
    setElectricTouched(false);
    setBanner(null);
    speak("Draw a safe path to the shelter. Avoid deep water, current arrows, and electric areas. Bridges are safe.");
  }

  function clearPath() {
    setPath([{ r: START.r, c: START.c }]);
    setScore(0);
    setElectricTouched(false);
  }

  function undo() {
    if (path.length <= 1) return;
    setPath(p => p.slice(0, p.length - 1));
    // for simplicity, recompute score from scratch after undo
    setTimeout(() => recomputeScore(), 0);
  }

  function recomputeScore() {
    let s = 0;
    let touched = false;
    for (let i = 1; i < path.length; i++) {
      const stepPoint = path[i];
      const cell = baseMap[stepPoint.r][stepPoint.c];
      s += scoreForStep(path[i - 1], stepPoint);
      if (cell.kind === "electric") touched = true;
    }
    setScore(s);
    setElectricTouched(touched);
  }

  useEffect(() => {
    if (state !== "PLAY") return;
    recomputeScore();
    const last = path[path.length - 1];
    if (same(last, GOAL)) {
      // reached goal
      const finalScore = score + SCORE.reachShelter;
      const ok = !electricTouched; // hard fail if touched electric
      if (ok) confetti();
      end(
        ok,
        ok ? "Shelter reached!" : "Dangerous path",
        ok
          ? finalScore >= 12 ? "Great choices: bridge & high roads!" : "Safe route. Try for more bonus next time."
          : "Your route crossed ⚡. In floods, avoid downed wires."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  function end(win, title, sub) {
    setState("END");
    setBanner({ win, title, sub });
    if (win) speak("Well done. You reached shelter safely.");
    else speak("Let’s try a safer route next time.");
  }

  function confetti() {
    const holder = document.createElement("div");
    holder.className = "rvfa-confetti";
    document.body.appendChild(holder);
    const colors = ["#0ea5e9","#34d399","#fbbf24","#a78bfa","#ef4444"];
    for (let i=0;i<120;i++){
      const p=document.createElement("div");
      p.className="p"; p.style.left=Math.random()*100+"vw";
      p.style.top=(8+Math.random()*12)+"vh"; p.style.background=colors[i%colors.length];
      holder.appendChild(p);
    }
    setTimeout(()=>holder.remove(), 900);
  }

  // ------------------- interactions -------------------
  function onTileClick(r, c) {
    if (state !== "PLAY") return;
    const last = path[path.length - 1];
    const next = { r, c };
    if (!adjacent(last, next)) {
      speak("Pick tiles next to your path.");
      return;
    }
    // no revisiting same tile to avoid loops (optional)
    if (path.some(p => p.r === r && p.c === c)) {
      speak("Try a fresh tile.");
      return;
    }
    setPath(p => [...p, next]);
  }

  // ------------------- UI -------------------
  return (
    <div className="rv-flood-adv" ref={boardRef}>
      <div className="rvfa-card">
        <div className="rvfa-top">
          <div className="rvfa-title">🌊 Flood — Advanced: Safe Route Scout</div>
          <div className="rvfa-actions">
            <button className={`rvfa-chip ${coach ? "on":""}`} onClick={()=>setCoach(v=>!v)}>
              🔊 {coach ? "Coach On" : "Coach Off"}
            </button>
            <button className="rvfa-close" onClick={onExit}>✕</button>
          </div>
        </div>
        <div className="rvfa-sub">Draw a safe path from 🏠 to 🟩. Prefer high roads ⬆, use bridges, avoid deep water 💧 and ⚡.</div>

        <div className="rvfa-hud">
          <span className="rvfa-pill">⏱ {time}s</span>
          <span className="rvfa-pill">⭐ Score: {score}</span>
          {state !== "PLAY" ? (
            <button className="rvfa-btn cta" onClick={startGame}>Start</button>
          ) : (
            <div className="rvfa-row">
              <button className="rvfa-btn soft" onClick={undo}>Undo</button>
              <button className="rvfa-btn soft" onClick={clearPath}>Clear</button>
              <button className="rvfa-btn danger" onClick={()=>setState("END")}>Stop</button>
            </div>
          )}
        </div>

        <div className="rvfa-legend floaty-slow">
          <span>Legend:</span>
          <span><b className="lg k-road" /> Road</span>
          <span><b className="lg k-high" /> High Ground</span>
          <span><b className="lg k-shallow" /> Shallow</span>
          <span><b className="lg k-deep" /> Deep</span>
          <span><b className="lg k-current" /> Current</span>
          <span><b className="lg k-electric" /> ⚡ Electric</span>
          <span><b className="lg k-bridge" /> Bridge</span>
        </div>

        <div className="rvfa-grid">
          {baseMap.map((row, r) => (
            <div key={r} className="rvfa-row">
              {row.map((cell, c) => {
                const inPath = path.some(p => p.r === r && p.c === c);
                const last = path[path.length - 1];
                const isLast = same({ r, c }, last);
                return (
                  <button
                    key={c}
                    className={`rvfa-tile ${tileClass(cell)} ${inPath ? "path" : ""} ${isLast ? "last" : ""}`}
                    onClick={() => onTileClick(r, c)}
                    title={hint(cell)}
                  >
                    {cell.start && <span className="emo">🏠</span>}
                    {cell.goal  && <span className="emo">🟩</span>}
                    {cell.kind === "current" && <span className="arrow">➜</span>}
                    {cell.kind === "electric" && <span className="emo">⚡</span>}
                    {cell.kind === "bridge" && <span className="emo">🌉</span>}
                    {cell.kind === "high" && !cell.start && !cell.goal && <span className="up">⬆</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="rvfa-foot">
          <div className="rvfa-tip floaty">
            Tips: Deep water ≥30 cm is dangerous. Use bridges. Choose higher roads (⬆). Never go near ⚡.
          </div>
          <div>
            <button className="rvfa-btn soft" onClick={onExit}>← Back</button>
          </div>
        </div>

        {banner && (
          <div className="rvfa-overlay" onClick={()=>setBanner(null)}>
            <div className="rvfa-center">
              <div className={`rvfa-title2 ${banner.win ? "win":"lose"}`}>{banner.win ? "VICTORY" : "TRY AGAIN"}</div>
              <div className="rvfa-sub2">{banner.title}{banner.sub ? ` • ${banner.sub}` : ""}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function hint(cell) {
    switch (cell.kind) {
      case "high": return "High ground road: safer route (+score)";
      case "shallow": return "Shallow water: risky (-score)";
      case "deep": return "Deep water (≥30cm): dangerous (-score)";
      case "current": return "Strong current: avoid (-score)";
      case "electric": return "Downed wires ⚡: DANGEROUS (-lots)";
      case "bridge": return "Bridge: safe crossing (+bonus)";
      default: return "Road";
    }
  }
}

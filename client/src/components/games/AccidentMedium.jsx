import React, { useEffect, useRef, useState } from "react";
import "./accident-medium.css";

export default function AccidentMedium({ onBack }) {
  // ----- grid -----
  const CELL = 40;
  const ROWS = 12;
  const COLS = 26;
  const START = { r: 0, c: 0 };
  const EXIT  = { r: ROWS - 1, c: COLS - 1 };
  const START_TIME = 90;

  // ----- voice coach -----
  const [coachOn, setCoachOn] = useState(true);
  const speak = (t) => {
    if (!coachOn) return;
    try {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-US"; u.rate = 1; u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  };

  // ----- collectibles (fixed, visible) -----
  const fixedSupplies = [
    { id: "med",   emoji: "💊", tip: "First aid helps little injuries.", r: 1,  c: 2  },
    { id: "water", emoji: "💧", tip: "Clean water keeps you healthy.",   r: 3,  c: 5  },
    { id: "food",  emoji: "🍞", tip: "Food gives you energy.",           r: 5,  c: 9  },
    { id: "ext",   emoji: "🧯", tip: "Use only on small fires.",         r: 7,  c: 12 },
    { id: "torch", emoji: "🔦", tip: "A torch helps in the dark.",       r: 9,  c: 15 },
    { id: "pet",   emoji: "🐾", tip: "Don’t forget pet care!",           r: 10, c: 8  },
  ];

  // ----- hazards (moving blockers) -----
// MORE hazards: smokes (↔), waves (↕), booms (toggle on/off), twisters (diagonal bounce)
// MORE hazards: smokes (↔), waves (↕), booms (blink + patrol), twisters (diagonal)
const fixedHazards = [
  // 💨 smoke — horizontal lanes
  { kind: "smoke",   emoji: "💨", r: 2, c: 3,        dir: 1,  min: 2,        max: COLS - 3, speed: 1 },
  { kind: "smoke",   emoji: "💨", r: 5, c: COLS - 4, dir: -1, min: 1,        max: COLS - 2, speed: 1 },
  { kind: "smoke",   emoji: "💨", r: 9, c: 6,        dir: 1,  min: 1,        max: COLS - 2, speed: 1 },

  // 🌊 wave — vertical lanes
  { kind: "wave",    emoji: "🌊", r: 1,        c: 4,  dir: 1,  min: 1, max: ROWS - 2, speed: 1 },
  { kind: "wave",    emoji: "🌊", r: ROWS - 3, c: 11, dir: -1, min: 1, max: ROWS - 2, speed: 1 },

  // 💥 boom — blink on/off AND patrol a tiny lane (axis: 'h' or 'v')
  { kind: "boom",    emoji: "💥", r: 3,  c: 14, active: true,  toggleEvery: 2, tick: 0,
    axis: "h", minC: 13, maxC: 16, speed: 1 },
  { kind: "boom",    emoji: "💥", r: 8,  c: 2,  active: false, toggleEvery: 3, tick: 0,
    axis: "v", minR: 7,  maxR: 10, speed: 1 },

  // 🌀 twister — diagonal bounce inside a box
  { kind: "twister", emoji: "🌀", r: 6,  c: 12, dr: 1,  dc: -1, minR: 1, maxR: ROWS - 2, minC: 1, maxC: COLS - 2, speed: 1 },
  { kind: "twister", emoji: "🌀", r: 2,  c: 8,  dr: 1,  dc:  1, minR: 1, maxR: ROWS - 2, minC: 1, maxC: COLS - 2, speed: 1 },
];


  // ----- state -----
  const [mode, setMode]     = useState("IDLE"); // IDLE | PLAY | END
  const [time, setTime]     = useState(START_TIME);
  const [player, setPlayer] = useState({ ...START });
  const [supplies, setSupplies] = useState(fixedSupplies.map(s => ({ ...s, got: false })));
  const [hazards, setHazards]   = useState(fixedHazards);
  const [got, setGot] = useState({});       // id -> true
  const [gotCount, setGotCount] = useState(0);
  const [banner, setBanner] = useState(null);
  const boardRef = useRef(null);

  // helpers
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const totalSupplies = supplies.length;

  function end(win, msg) {
    setMode("END");
    setBanner({ win, msg });
    speak(msg);
  }

  function reset() {
    setTime(START_TIME);
    setPlayer({ ...START });
    setSupplies(fixedSupplies.map(s => ({ ...s, got: false })));
    setHazards([...fixedHazards]);
    setGot({});
    setGotCount(0);
    setBanner(null);
  }

  function startPlay() {
    reset();
    setMode("PLAY");
    speak("Use the arrow keys. Collect all items. Avoid smoke and waves. Then go to the green square.");
    setTimeout(() => boardRef.current?.focus(), 50);
  }
  function cellBlocked(r, c, list) {
  return list.some(h => {
    if (h.kind === "boom") return h.active && h.r === r && h.c === c;
    return h.r === r && h.c === c;
  });
}


  // ----- hazard movement tick -----
  useEffect(() => {
    if (mode !== "PLAY") return;
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) { end(false, "Time’s up! Try again."); return 0; }
        return t - 1;
      });

      setHazards(prev => prev.map(h => {
        if (h.kind === "smoke") {
          let nc = h.c + h.dir * h.speed, nd = h.dir;
          if (nc < h.min || nc > h.max) { nd = -nd; nc = h.c + nd * h.speed; }
          return { ...h, c: nc, dir: nd };
        } else {
          let nr = h.r + h.dir * h.speed, nd = h.dir;
          if (nr < h.min || nr > h.max) { nd = -nd; nr = h.r + nd * h.speed; }
          return { ...h, r: nr, dir: nd };
        }
      }));
    }, 800);
    return () => clearInterval(id);
  }, [mode]);

  // ----- controls (arrows) -----
  useEffect(() => {
    const onKey = (e) => {
      if (mode !== "PLAY") return;

      let dr = 0, dc = 0;
      if (e.key === "ArrowUp") dr = -1;
      else if (e.key === "ArrowDown") dr = 1;
      else if (e.key === "ArrowLeft") dc = -1;
      else if (e.key === "ArrowRight") dc = 1;
      else return;

      e.preventDefault();

      setPlayer(p => {
        const nr = clamp(p.r + dr, 0, ROWS - 1);
        const nc = clamp(p.c + dc, 0, COLS - 1);

        // collide with hazard?
if (cellBlocked(nr, nc, hazards)) {
  end(false, "Blocked by a hazard!");
  return p;
}


        // are we standing on a not-yet collected supply?
        const hit = supplies.find(s => !s.got && s.r === nr && s.c === nc);
        if (hit) {
          setSupplies(list => list.map(s => s.id === hit.id ? { ...s, got: true } : s));
          setGot(g => ({ ...g, [hit.id]: true }));
          setGotCount(n => n + 1);
          speak(hit.tip);
        }

        // reached exit?
        if (nr === EXIT.r && nc === EXIT.c) {
          if (gotCount + (hit ? 1 : 0) === totalSupplies) {
            end(true, "Great job! You collected everything and reached safety.");
          } else {
            speak("Collect all items before going home.");
          }
        }

        return { r: nr, c: nc };
      });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, hazards, supplies, gotCount, totalSupplies]);

  // ----- board style -----
  const boardStyle = {
    gridTemplateRows:    `repeat(${ROWS}, var(--cell))`,
    gridTemplateColumns: `repeat(${COLS}, var(--cell))`,
    width:  `calc(${COLS} * var(--cell))`,
    height: `calc(${ROWS} * var(--cell))`,
    ["--cell"]: `${CELL}px`,
  };

  return (
    <div className="am-wrap">
      <div className="am-top">
        <div className="am-title"><span className="dot" /> Accident — Medium Level</div>
        <div className="am-row">
          <span className="am-pill">⏱ {time}s</span>
          <span className="am-pill">🎒 {gotCount}/{totalSupplies}</span>
          <button className={`am-btn ${coachOn ? "on" : ""}`} onClick={()=>setCoachOn(v=>!v)}>🔊 {coachOn ? "On" : "Off"}</button>
          <button className="am-btn cta2" onClick={startPlay} disabled={mode==="PLAY"}>▶️ Play</button>
          <button className="am-btn" onClick={reset} disabled={mode==="PLAY"}>Reset</button>
          <button className="am-btn soft" onClick={onBack}>← Back</button>
        </div>
      </div>

            {/* Legend */} 
      <div className="am-legend"> 
        <div className="legend-pill"><span>🏃‍♀️</span> You</div> 
        <div className="legend-pill"><span>🟥</span> Start</div> 
        <div className="legend-pill"><span>🟩</span> Safe meeting spot</div> 
        <div className="legend-pill"><span>💨</span> Smoke (moves left↔right)</div> 
        <div className="legend-pill"><span>🌊</span> Wave (moves up↕down)</div> 
        <div className="legend-pill"><span>💥</span> Boom (blinks on/off)</div> 
        <div className="legend-pill"><span>🌀</span> Twister (bounces diagonal)</div> 
        <div className="legend-pill"><span>💊</span> First aid</div> 
        <div className="legend-pill"><span>💧</span> Water</div> 
        <div className="legend-pill"><span>🍞</span> Food</div> 
        <div className="legend-pill"><span>🔦</span> Torch</div> 
        <div className="legend-pill"><span>🐾</span> Pet care</div> 
      </div>

      {/* GRID */}
      <div className="grid-board" style={boardStyle} ref={boardRef} tabIndex={0}>
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const key = `${r}-${c}`;
            const isStart = r === START.r && c === START.c;
            const isExit  = r === EXIT.r  && c === EXIT.c;
            return (
              <div key={key} className="cell2">
                {isStart && <div className="pin start">🟥</div>}
                {isExit  && <div className="pin exit">🟩</div>}
              </div>
            );
          })
        )}

        {/* hazards */}
        {hazards.map((h, i) => (
          <div key={`h${i}`} className="piece"
               style={{ transform:`translate(calc(${h.c} * var(--cell)), calc(${h.r} * var(--cell)))` }}>
            <span className="emo hazard">{h.emoji}</span>
          </div>
        ))}

        {/* supplies */}
        {supplies.filter(s => !s.got).map(s => (
          <div key={s.id} className="piece"
               style={{ transform:`translate(calc(${s.c} * var(--cell)), calc(${s.r} * var(--cell)))` }}>
            <span className="emo supply">{s.emoji}</span>
          </div>
        ))}

        {/* player */}
        {mode !== "IDLE" && (
          <div className="piece"
               style={{ transform:`translate(calc(${player.c} * var(--cell)), calc(${player.r} * var(--cell)))` }}>
            <span className="emo player">🏃‍♀️</span>
          </div>
        )}
      </div>

      {banner && (
        <div className="center-overlay" onClick={() => setBanner(null)}>
          <div className="center-card">
            <div className={`center-title ${banner.win ? "center-win" : "center-lose"}`}>
              {banner.win ? "VICTORY" : "TRY AGAIN"}
            </div>
            <div className="center-sub">{banner.msg}</div>
          </div>
        </div>
      )}
    </div>
  );
}

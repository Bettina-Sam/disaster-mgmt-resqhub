import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

/** ------------------ tiny coach bubble (reuse flood styles .coach-bubble) ------------------ **/
function Coach({ text, onDone }) {
  useEffect(() => {
    if (!text) return;
    const t = setTimeout(() => onDone?.(), 2400);
    return () => clearTimeout(t);
  }, [text, onDone]);
  if (!text) return null;
  return <div className="coach-bubble">{text}</div>;
}

/** ------------------ helpers ------------------ **/
const TIME = 45;
const BOARD_W = 720, BOARD_H = 320;
const SPEED = 160;     // px/s
const SAFE_R = 54;     // radius for safe sweep around hotspot
const HOLD_SEC = 1.3;  // seconds to hold inside circle to cool it

function makeFires(n, w, h) {
  const a = [];
  for (let i = 0; i < n; i++) {
    a.push({
      id: i,
      x: 60 + Math.random() * (w - 120),
      y: 60 + Math.random() * (h - 120),
      cooled: 0,
      done: false,
    });
  }
  return a;
}

const startPt = { x: 60, y: BOARD_H - 40 };

function pathLength(points) {
  return points.reduce((acc, p, i) => (i ? acc + Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y) : 0), 0);
}

/** ================== FIRE — ADVANCED (Plan & Sweep) ================== **/
export default function FireAdvanced({ onExit }) {
  const [mode, setMode] = useState("IDLE"); // IDLE | PLAN | RUN | END
  const [sec, setSec] = useState(TIME);
  const [fires, setFires] = useState(() => makeFires(5, BOARD_W, BOARD_H));
  const [pts, setPts] = useState([startPt]);
  const [marker, setMarker] = useState(startPt);
  const [coach, setCoach] = useState(null);
  const [banner, setBanner] = useState(null);

  const firesRef = useRef(fires);
  useEffect(() => { firesRef.current = fires; }, [fires]);

  // timers
  useEffect(() => {
    if (mode === "PLAN" || mode === "RUN") {
      const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
  }, [mode]);

  useEffect(() => {
    if ((mode === "PLAN" || mode === "RUN") && sec === 0) {
      end(false, "Time’s up", "Route planning or sweep took too long.");
    }
  }, [sec, mode]);

  // RUN loop
  useEffect(() => {
    if (mode !== "RUN") return;

    let segIndex = 0;
    let segPos = 0; // distance progressed along current segment
    let lastT = performance.now();
    let rafId;

    const step = () => {
      const now = performance.now();
      const dt = (now - lastT) / 1000;
      lastT = now;

      let remaining = SPEED * dt;
      let current = marker;

      while (remaining > 0 && segIndex < pts.length - 1) {
        const a = pts[segIndex];
        const b = pts[segIndex + 1];
        const segLen = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const left = segLen - segPos;

        if (remaining < left) {
          segPos += remaining;
          const k = segPos / segLen;
          current = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
          remaining = 0;
        } else {
          remaining -= left;
          segIndex += 1;
          segPos = 0;
          current = { x: b.x, y: b.y };
        }
      }

      setMarker(current);

      // cooling logic using latest fires via ref
      setFires((fs) =>
        fs.map((f) => {
          if (f.done) return f;
          const d = Math.hypot(current.x - f.x, current.y - f.y);
          if (d < SAFE_R) {
            const cooled = Math.min(HOLD_SEC, f.cooled + dt);
            if (cooled >= HOLD_SEC && !f.done) {
              toast.success("Base cooled ✅");
              return { ...f, cooled, done: true };
            }
            return { ...f, cooled };
          }
          // moving away: decay progress a bit (teaches steady aim)
          const cooled = Math.max(0, f.cooled - dt * 0.4);
          return { ...f, cooled };
        })
      );

      // reached end of path?
      if (segIndex >= pts.length - 1) {
        const left = (firesRef.current || []).filter((f) => !f.done).length;
        end(left === 0, left === 0 ? "Fire out!" : "Missed hotspots", left === 0 ? "Area is safe." : `${left} left`);
        return;
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pts]); // use firesRef inside

  const end = (win, title, sub) => {
    setMode("END");
    setBanner({ win, title, sub });
    if (win) {
      confetti();
      toast.success(title);
    } else {
      toast.info(title);
    }
  };

  const confetti = () => {
    const holder = document.createElement("div");
    holder.className = "confetti";
    document.body.appendChild(holder);
    const colors = ["#22c55e", "#0ea5e9", "#f59e0b", "#a78bfa", "#ef4444"];
    for (let i = 0; i < 120; i++) {
      const p = document.createElement("div");
      p.className = "p";
      p.style.left = Math.random() * 100 + "vw";
      p.style.top = 8 + Math.random() * 12 + "vh";
      p.style.background = colors[i % colors.length];
      holder.appendChild(p);
    }
    setTimeout(() => holder.remove(), 900);
  };

  const start = () => {
    setMode("PLAN");
    setSec(TIME);
    const fresh = makeFires(5, BOARD_W, BOARD_H);
    setFires(fresh);
    firesRef.current = fresh;
    setPts([startPt]);
    setMarker(startPt);
    setCoach("Draw a route that visits each 🔥. Hold inside the dashed circle to cool the base.");
  };

  const run = () => {
    if (pts.length < 2) {
      setCoach("Add at least one checkpoint.");
      return;
    }
    setMode("RUN");
    setCoach("Squeeze & sweep at the BASE. Stay steady inside the dashed circle.");
  };

  const addPoint = (e) => {
    if (mode !== "PLAN") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;
    setPts((p) => [...p, { x, y }]);
    if (pts.length === 1) setCoach("Nice. Add more checkpoints to reach all hotspots, then press Run.");
  };

  const clearLast = () => {
    if (mode !== "PLAN") return;
    setPts((p) => (p.length > 1 ? p.slice(0, p.length - 1) : p));
  };

  const len = pathLength(pts);

  return (
    <div className="g-card p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h5 className="mb-0">🔥 Fire — Advanced (Plan & Sweep)</h5>
          <small className="g-muted">
            PLAN: draw a path that passes each hotspot. RUN: the crew follows it. Stay inside the dashed circle to cool the base.
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="g-pill">⏱ {sec}s</span>
          <span className="g-pill">📏 {Math.round(len)}px</span>
          {mode !== "RUN" ? (
            <>
              {mode !== "PLAN" ? (
                <button className="btn cta-btn btn-sm" onClick={start}>Start</button>
              ) : (
                <button className="btn cta-btn btn-sm" onClick={run}>Run</button>
              )}
              <button className="btn g-btn-soft btn-sm" onClick={onExit}>← Back</button>
            </>
          ) : (
            <button className="btn btn-outline-danger btn-sm" onClick={() => setMode("END")}>Stop</button>
          )}
        </div>
      </div>

      <div
        className="g-card-hi position-relative"
        style={{ height: BOARD_H, width: "100%", maxWidth: BOARD_W, cursor: mode === "PLAN" ? "crosshair" : "default", userSelect: "none" }}
        onClick={addPoint}
      >
        {/* start & nozzle marker */}
        <div style={{ position: "absolute", left: startPt.x - 12, top: startPt.y - 12 }}>
          <span className="emo-lg g-dance">🚒</span>
        </div>
        {(mode === "RUN" || mode === "PLAN") && (
          <div style={{ position: "absolute", left: marker.x - 12, top: marker.y - 12 }}>
            <span className="emo-lg">🚿</span>
          </div>
        )}

        {/* hotspots */}
        {fires.map((f) => (
          <div key={f.id} style={{ position: "absolute", left: f.x - 16, top: f.y - 16, textAlign: "center" }}>
            <span className="emo-lg g-dance">{f.done ? "🟢" : "🔥"}</span>
            <div
              style={{
                position: "absolute",
                left: 16 - SAFE_R,
                top: 16 - SAFE_R,
                width: SAFE_R * 2,
                height: SAFE_R * 2,
                borderRadius: "50%",
                border: "2px dashed rgba(255,255,255,.35)",
                background: f.done
                  ? "radial-gradient(circle, rgba(34,197,94,.18), transparent 60%)"
                  : "radial-gradient(circle, rgba(255,99,71,.12), transparent 60%)",
                pointerEvents: "none",
              }}
            />
            {!f.done && f.cooled > 0 && (
              <div className="g-pill" style={{ transform: "scale(.80)", marginTop: 50 }}>
                Cool {Math.round((f.cooled / HOLD_SEC) * 100)}%
              </div>
            )}
          </div>
        ))}

        {/* planned polyline */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <polyline
            fill="none"
            stroke={mode === "PLAN" ? "var(--g-accent)" : "#60a5fa"}
            strokeWidth="3"
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill={i === 0 ? "#22c55e" : "var(--g-accent)"} />
          ))}
        </svg>
      </div>

      {mode === "PLAN" && (
        <div className="d-flex justify-content-between mt-3">
          <div className="d-flex gap-2">
            <button className="btn g-btn-soft btn-sm" onClick={clearLast}>Undo point</button>
            <button className="btn g-btn-soft btn-sm" onClick={() => setPts([startPt])}>Clear path</button>
          </div>
          <button className="btn g-btn-soft btn-sm" onClick={onExit}>← Back</button>
        </div>
      )}

      <Coach text={coach} onDone={() => setCoach(null)} />

      {banner && (
        <div className="center-overlay" onClick={() => setBanner(null)}>
          <div className="center-card">
            <div className={`center-title ${banner.win ? "center-win" : "center-lose"}`}>{banner.win ? "VICTORY" : "TRY AGAIN"}</div>
            <div className="center-sub">
              {banner.title} {banner.sub && <>• {banner.sub}</>}
            </div>
            <div className="center-sub" style={{ marginTop: 6, opacity: 0.85 }}>
              Tip: Aim at the <b>base</b>, hold a steady sweep inside the dashed circle until it turns 🟢.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

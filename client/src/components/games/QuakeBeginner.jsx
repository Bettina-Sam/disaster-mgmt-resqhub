import React, { useEffect, useRef, useState } from "react";
import "./quake-beginner.css";

export default function QuakeBeginner({ onExit }) {
  const DURATION = 20;
  const HOLD_MS = 2000;
  const SAFE_IDS = ["table", "sofa"]; // which ones count as SAFE when time ends

  const [coach, setCoach] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(DURATION);
  const [hold, setHold] = useState(0);

  const roomRef = useRef(null);
  const [OBJ, setOBJ] = useState(300);
  const [objs, setObjs] = useState([]);
  const [kid, setKid] = useState({ x: 120, y: 120 });

  function speak(t) {
    if (!coach) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-IN"; u.rate = 1; u.pitch = 1; u.volume = .95;
      window.speechSynthesis.speak(u);
    } catch {}
  }

  // 6 objects (all same size)
  const baseObjs = [
    { id: "books",  label: "Bookshelf",  emoji: "📚" },
    { id: "tv",     label: "Television", emoji: "📺" },
    { id: "table",  label: "Table",      isTable: true },   // <— real table (CSS)
    { id: "sofa",   label: "Sofa",       emoji: "🛋️" },
    { id: "plant",  label: "Tall Plant", emoji: "🪴" },
    { id: "window", label: "Window",     emoji: "🪟" },
  ];

  const roomBox = () =>
    roomRef.current?.getBoundingClientRect() || { width: 1100, height: 540, left: 0, top: 0 };

  // lay out: 2 left, 2 center, 2 right with bigger gutters
  useEffect(() => {
    const layout = () => {
      const rr = roomBox();
      const size = Math.max(220, Math.min(Math.floor(rr.width * 0.22), 300)); // uniform size
      setOBJ(size);

      // bigger spacing
      const padX = Math.max(40, rr.width * 0.10);
      const padY = Math.max(40, rr.height * 0.14);

      const colLeft   = padX;
      const colCenter = rr.width / 2 - size / 2;
      const colRight  = rr.width - padX - size;

      const rowTop = padY;
      const rowBot = rr.height - padY - size;

      // 2 left, 2 center, 2 right (spaced)
      const positioned = [
        { ...baseObjs[0], x: colLeft,   y: rowTop  }, // books
        { ...baseObjs[1], x: colLeft,   y: rowBot  }, // tv
        { ...baseObjs[2], x: colCenter, y: rowTop  }, // table
        { ...baseObjs[3], x: colCenter, y: rowBot  }, // sofa
        { ...baseObjs[4], x: colRight,  y: rowTop  }, // plant
        { ...baseObjs[5], x: colRight,  y: rowBot  }, // window
      ].map(o => ({ ...o, w: size, h: size }));

      setObjs(positioned);

      // kid starts to the right of center top
      setKid({
        x: Math.min(rr.width - 110, colCenter + size + 90),
        y: Math.min(rr.height - 110, rowTop + size / 2 - 40),
      });
    };

    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);

  // timer
  useEffect(() => {
    if (!playing) return;
    setTime(DURATION);
    const t = setInterval(() => setTime(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    if (!playing || time > 0) return;
    setPlaying(false);
    const chosen = currentShelter();
    if (!chosen) { speak("Time up. Try to get under sturdy furniture next time."); return; }
    const safe = SAFE_IDS.includes(chosen.id);
    speak(safe ? "Great choice. You picked a safer shelter."
               : "That wasn’t ideal. Choose sturdy furniture next time.");
  }, [time, playing]);

  // HOLD loop (2s continuous inside any dotted zone)
  const holdRef = useRef({ t0: 0, inside: false });
  useEffect(() => {
    if (!playing) return;
    let raf;
    const tick = (ts) => {
      const inside = isInsideAnySafeZone();
      const H = holdRef.current;
      if (inside) {
        if (!H.inside) H.t0 = ts;
        setHold(Math.min(100, Math.round(((ts - H.t0) / HOLD_MS) * 100)));
      } else {
        setHold(0);
        H.t0 = ts;
      }
      H.inside = inside;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, kid, objs, OBJ]);

  // move / drag
  const dragging = useRef(false);
  const dragOff  = useRef({ x: 0, y: 0 });
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const point = (e) => e.touches?.[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                                      : { x: e.clientX, y: e.clientY };

  const onDown = (e) => {
    if (!playing) return;
    dragging.current = true;
    const rr = roomBox(); const p = point(e);
    dragOff.current = { x: p.x - rr.left - kid.x, y: p.y - rr.top - kid.y };
  };
  const onUp = () => (dragging.current = false);
  const onMove = (e) => {
    if (!playing || !dragging.current) return;
    const rr = roomBox(); const p = point(e);
    setKid(k => ({
      x: clamp(p.x - rr.left - dragOff.current.x, 8, rr.width - 108),
      y: clamp(p.y - rr.top  - dragOff.current.y, 8, rr.height - 108),
    }));
  };

  // arrow keys
  useEffect(() => {
    const onKey = (e) => {
      if (!playing) return;
      const rr = roomBox(); const step = 14;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      if (e.key==="ArrowUp")    setKid(k=>({ ...k, y: clamp(k.y-step, 8, rr.height-108) }));
      if (e.key==="ArrowDown")  setKid(k=>({ ...k, y: clamp(k.y+step, 8, rr.height-108) }));
      if (e.key==="ArrowLeft")  setKid(k=>({ ...k, x: clamp(k.x-step, 8, rr.width-108) }));
      if (e.key==="ArrowRight") setKid(k=>({ ...k, x: clamp(k.x+step, 8, rr.width-108) }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  const kidBox = () => ({ x: kid.x + 6, y: kid.y + 8, w: 80, h: 80 });

  const safeRects = () => objs.map(o => {
    const m = Math.floor(OBJ * 0.12);
    return { id:o.id, x:o.x + m, y:o.y + m, w:o.w - 2*m, h:o.h - 2*m };
  });

  const rectContains = (outer, inner) =>
    inner.x > outer.x && inner.y > outer.y &&
    inner.x + inner.w < outer.x + outer.w &&
    inner.y + inner.h < outer.y + outer.h;

  const isInsideAnySafeZone = () => safeRects().some(r => rectContains(r, kidBox()));
  const currentShelter       = () => safeRects().find(r => rectContains(r, kidBox())) || null;

  const start = () => {
    setPlaying(true); setTime(DURATION); setHold(0);
    speak("When shaking starts, get fully inside the dotted zone under any object and hold still.");
  };
  const stop  = () => { setPlaying(false); setHold(0); speak("Paused. Tap start when you’re ready."); };

  const insideId = (() => {
    if (!playing) return null;
    const r = safeRects().find(r => rectContains(r, kidBox()));
    return r?.id || null;
  })();

  return (
    <div className="qkb-wrap">
      <div className="qkb-top">
        <div className="qkb-title">🧠 Quake — Beginner: Reflex Hero</div>
        <div className="qkb-actions">
          <span className="qkb-pill">⏱ {time}s</span>
          {!playing ? (
            <button className="qkb-btn cta" onClick={start}>Start</button>
          ) : (
            <button className="qkb-btn danger" onClick={stop}>Stop</button>
          )}
          <button
            className={`qkb-btn soft ${coach ? "on":""}`}
            onClick={() => { setCoach(v=>!v); if (coach) window.speechSynthesis.cancel(); else speak("Coach on. I will guide you."); }}
          >
            🔊 {coach ? "Coach On" : "Coach Off"}
          </button>
          <button className="qkb-btn soft" onClick={onExit}>← Back</button>
        </div>
      </div>

      <div
        ref={roomRef}
        className={`qkb-room ${playing ? "shake":""}`}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        {objs.map(o => {
          const isIn = insideId === o.id;
          return (
            <div
              key={o.id}
              className={`qkb-obj ${o.isTable ? "is-table":""} ${playing ? "shakeObj":""}`}
              style={{ left:o.x, top:o.y, width:o.w, height:o.h, fontSize: Math.floor(OBJ*0.36) }}
              title={o.label}
            >
              <div className={`safe-zone ${isIn ? "in":""}`} />
              {o.isTable ? (
                <div className="table-emoji" aria-label="Table">
                  <div className="top" />
                  <div className="leg left" />
                  <div className="leg right" />
                </div>
              ) : (
                <span className="emo">{o.emoji}</span>
              )}
              <div className="label">{o.label}</div>
            </div>
          );
        })}

        <div
          className={`qkb-kid ${!playing ? "idle":""}`}
          style={{ left:kid.x, top:kid.y }}
          onMouseDown={onDown}
          onTouchStart={onDown}
          title="Drag me or use arrow keys"
        >
          <span className="emo">🧍</span>
        </div>
      </div>

      <div className="qkb-foot">
        <div className="qkb-tip">
          Tip: Drop under sturdy furniture. Cover head & neck. Hold on. Keep away from glass and tall shelves.
        </div>
        <div className="qkb-pill">Hold: {hold}%</div>
      </div>
    </div>
  );
}

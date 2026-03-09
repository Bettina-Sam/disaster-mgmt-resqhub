import React, { useEffect, useRef, useState } from "react";

export default function SnakeOverlay({
  opacity = 0.85,
  idleMs = 8000,
  speedMs = 200,   // 160–240 feels calm. Raise to slow more.
}) {
  const canvasRef = useRef(null);

  const COLS = 64;
  const ROWS = 36;

  const [body, setBody] = useState([
    { x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }
  ]);
  const [dir, setDir]   = useState({ x: 1, y: 0 });
  const [mode, setMode] = useState("auto"); // "auto" | "manual"
  const lastInputRef = useRef(0);

  const [apples, setApples] = useState([
    { x: 8, y: 3 }, { x: COLS - 10, y: 4 }, { x: 7, y: ROWS - 6 }, { x: COLS - 9, y: ROWS - 7 }
  ]);

  const path = [
    [0.08, 0.12], [0.30, 0.10], [0.70, 0.10], [0.92, 0.12],
    [0.96, 0.30], [0.94, 0.55],
    [0.82, 0.88], [0.50, 0.92], [0.18, 0.88],
    [0.06, 0.60], [0.06, 0.35],
  ].map(([nx, ny]) => ({
    x: Math.max(2, Math.min(COLS - 3, Math.round(nx * COLS))),
    y: Math.max(2, Math.min(ROWS - 3, Math.round(ny * ROWS))),
  }));
  const wpRef = useRef(0);

  // ---------- refs to keep draw() in sync ----------
  const bodyRef   = useRef(body);   useEffect(() => { bodyRef.current = body; }, [body]);
  const dirRef    = useRef(dir);    useEffect(() => { dirRef.current = dir; }, [dir]);
  const applesRef = useRef(apples); useEffect(() => { applesRef.current = apples; }, [apples]);
  const modeRef   = useRef(mode);   useEffect(() => { modeRef.current = mode; }, [mode]);
  const speedRef  = useRef(speedMs);useEffect(() => { speedRef.current = speedMs; }, [speedMs]);
  // --------------------------------------------------

  // keyboard (attach once)
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      let nd = null;
      if (k === "arrowup" || k === "w") nd = { x: 0, y: -1 };
      if (k === "arrowdown" || k === "s") nd = { x: 0, y: 1 };
      if (k === "arrowleft" || k === "a") nd = { x: -1, y: 0 };
      if (k === "arrowright" || k === "d") nd = { x: 1, y: 0 };
      if (!nd) return;

      setMode("manual"); modeRef.current = "manual";
      setDir((prev) => {
        if (bodyRef.current.length > 1 && nd.x === -prev.x && nd.y === -prev.y) return prev;
        dirRef.current = nd;
        return nd;
      });
      lastInputRef.current = performance.now();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // main loop (stable)
  useEffect(() => {
    const c   = canvasRef.current;
    const ctx = c.getContext("2d");
    let last = 0;
    let raf  = 0;

    const dpi = () => {
      const dpr = window.devicePixelRatio || 1;
      c.width  = Math.floor(window.innerWidth * dpr);
      c.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    dpi();
    const onResize = () => dpi();
    window.addEventListener("resize", onResize);

    const step = (ts) => {
      raf = requestAnimationFrame(step);
      if (ts - last < speedRef.current) { draw(); return; }
      last = ts;

      // return to auto if idle
      if (modeRef.current === "manual" && ts - lastInputRef.current > idleMs) {
        setMode("auto"); modeRef.current = "auto";
      }

      setBody((prev) => {
        const head = prev[0];

        // pick dir
        let nd = dirRef.current;
        if (modeRef.current === "auto") {
          const wp = path[wpRef.current];
          if (head.x === wp.x && head.y === wp.y) {
            wpRef.current = (wpRef.current + 1) % path.length;
          }
          const tgt = path[wpRef.current];
          const dx  = Math.sign(tgt.x - head.x);
          const dy  = Math.sign(tgt.y - head.y);
          nd = Math.abs(tgt.x - head.x) > Math.abs(tgt.y - head.y) ? { x: dx, y: 0 } : { x: 0, y: dy };
          if (nd.x !== dirRef.current.x || nd.y !== dirRef.current.y) {
            setDir(nd); dirRef.current = nd;
          }
        }

        // move & clamp
        const nx = Math.max(1, Math.min(COLS - 2, head.x + nd.x));
        const ny = Math.max(1, Math.min(ROWS - 2, head.y + nd.y));
        const newHead = { x: nx, y: ny };

        const next = [newHead, ...prev.slice(0, 5)];
        bodyRef.current = next;

        // apples
        setApples((old) => {
          let changed = false;
          const updated = old.map((a) => {
            if (a && a.x === newHead.x && a.y === newHead.y) {
              changed = true;
              const p  = path[Math.floor(Math.random() * path.length)];
              const ox = [-1, 0, 1][Math.floor(Math.random() * 3)];
              const oy = [-1, 0, 1][Math.floor(Math.random() * 3)];
              return {
                x: Math.max(2, Math.min(COLS - 3, p.x + ox)),
                y: Math.max(2, Math.min(ROWS - 3, p.y + oy)),
              };
            }
            return a;
          });
          if (changed) applesRef.current = updated;
          return changed ? updated : old;
        });

        return next;
      });

      draw();
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const cell = Math.floor(Math.min(w / COLS, h / ROWS));
      const offX = (w - cell * COLS) / 2;
      const offY = (h - cell * ROWS) / 2;

      ctx.globalAlpha = opacity;

      // light dotted field
      ctx.fillStyle = "rgba(255,255,255,.05)";
      for (let y = 2; y < ROWS; y += 2) {
        for (let x = 2; x < COLS; x += 2) {
          ctx.fillRect(offX + x * cell + cell / 2, offY + y * cell + cell / 2, 1, 1);
        }
      }

      // apples
      applesRef.current.forEach((a) => {
        if (!a) return;
        const cx = offX + a.x * cell + cell / 2;
        const cy = offY + a.y * cell + cell / 2;
        ctx.fillStyle = "#ff5d72";
        ctx.shadowColor = "#ff5d72";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(3, cell * 0.28), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#59c26b";
        ctx.beginPath();
        ctx.arc(cx - cell * .15, cy - cell * .35, Math.max(2, cell * .12), 0, Math.PI * 2);
        ctx.fill();
      });

      // snake body
      const segs = bodyRef.current;
      for (let i = segs.length - 1; i >= 0; i--) {
        const s = segs[i];
        const r = Math.max(4, cell * (i === 0 ? 0.48 : 0.42));
        const hue = 210 - i * 8;
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.shadowColor = `hsl(${hue}, 80%, 50%)`;
        ctx.shadowBlur = i === 0 ? 18 : 10;
        ctx.beginPath();
        ctx.arc(offX + s.x * cell + cell / 2, offY + s.y * cell + cell / 2, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // head face
      const head = bodyRef.current[0];
      if (head) {
        const hx = offX + head.x * cell + cell / 2;
        const hy = offY + head.y * cell + cell / 2;
        const ex = hx + Math.sign(dirRef.current.x || 0) * cell * 0.18;
        const ey = hy + Math.sign(dirRef.current.y || 0) * cell * 0.18;
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(ex - cell * 0.10, ey - cell * 0.05, cell * 0.14, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + cell * 0.10, ey + cell * 0.05, cell * 0.14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#121212";
        ctx.beginPath(); ctx.arc(ex - cell * 0.10, ey - cell * 0.05, cell * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + cell * 0.10, ey + cell * 0.05, cell * 0.06, 0, Math.PI * 2); ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [idleMs]); // only real external timing we rely on

  return <canvas ref={canvasRef} className="snake-overlay-canvas" aria-hidden />;
}

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * "Stock the kit" snake. Lives inside the hero (not full-screen).
 * - Idle: a calm snake wanders and eats supplies on its own, as decoration.
 * - Play: press the button, then use arrow keys / WASD, swipe, or the on-screen pad.
 *   Every supply you eat grows the snake; hitting yourself resets the run.
 * The keyboard is only captured while playing, so the page still scrolls normally.
 */
const SUPPLIES = ["💧", "🔦", "🩹", "🥫", "📻", "🔋"];
const CELL = 22;
const IDLE_MS = 190;
const PLAY_MS = 120;

const dirs = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

export default function SnakeBanner({ className = "" }) {
  const { t } = useLanguage();
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try { return Number(localStorage.getItem("rsq:snake:best")) || 0; } catch { return 0; }
  });

  // Mutable game state lives in a ref so the loop never re-renders React.
  const g = useRef({ cols: 30, rows: 12, snake: [], dir: dirs.right, next: dirs.right, supplies: [], len: 6, score: 0, playing: false });

  const placeSupply = useCallback(() => {
    const s = g.current;
    for (let i = 0; i < 40; i++) {
      const p = { x: 1 + Math.floor(Math.random() * (s.cols - 2)), y: 1 + Math.floor(Math.random() * (s.rows - 2)), icon: SUPPLIES[Math.floor(Math.random() * SUPPLIES.length)] };
      if (!s.snake.some((q) => q.x === p.x && q.y === p.y)) return p;
    }
    return { x: 2, y: 2, icon: "💧" };
  }, []);

  const reset = useCallback(() => {
    const s = g.current;
    s.snake = Array.from({ length: 6 }, (_, i) => ({ x: Math.max(6, Math.floor(s.cols / 3)) - i, y: Math.floor(s.rows / 2) }));
    s.dir = dirs.right;
    s.next = dirs.right;
    s.len = 6;
    s.score = 0;
    s.supplies = Array.from({ length: 4 }, placeSupply);
    setScore(0);
  }, [placeSupply]);

  const turn = useCallback((name) => {
    const s = g.current;
    const nd = dirs[name];
    if (!nd) return;
    if (nd.x === -s.dir.x && nd.y === -s.dir.y) return; // no U-turns
    s.next = nd;
  }, []);

  // size the grid to the hero
  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const fit = () => {
      const r = host.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
      canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      g.current.cols = Math.max(12, Math.floor(r.width / CELL));
      g.current.rows = Math.max(8, Math.floor(r.height / CELL));
      reset();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    return () => ro.disconnect();
  }, [reset]);

  // keyboard, only while playing
  useEffect(() => {
    if (!playing) return undefined;
    const map = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "escape") { setPlaying(false); return; }
      if (map[k]) {
        e.preventDefault();
        turn(map[k]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, turn]);

  // swipe
  useEffect(() => {
    const el = hostRef.current;
    let sx = 0, sy = 0;
    const down = (e) => { const p = e.touches[0]; sx = p.clientX; sy = p.clientY; };
    const up = (e) => {
      if (!g.current.playing) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - sx, dy = p.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    };
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchend", up, { passive: true });
    return () => { el.removeEventListener("touchstart", down); el.removeEventListener("touchend", up); };
  }, [turn]);

  useEffect(() => {
    g.current.playing = playing;
    reset();
  }, [playing, reset]);

  // game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let last = 0;
    let raf = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const step = () => {
      const s = g.current;
      const head = s.snake[0];

      if (!s.playing) {
        // wander toward the nearest supply
        const target = s.supplies.reduce((a, b) => (Math.abs(a.x - head.x) + Math.abs(a.y - head.y) <= Math.abs(b.x - head.x) + Math.abs(b.y - head.y) ? a : b));
        const dx = Math.sign(target.x - head.x), dy = Math.sign(target.y - head.y);
        const want = Math.abs(target.x - head.x) >= Math.abs(target.y - head.y) ? (dx > 0 ? dirs.right : dirs.left) : dy > 0 ? dirs.down : dirs.up;
        if (!(want.x === -s.dir.x && want.y === -s.dir.y)) s.next = want;
      }
      s.dir = s.next;
      let nx = head.x + s.dir.x;
      let ny = head.y + s.dir.y;
      // wrap around the edges so it never gets stuck
      nx = (nx + s.cols) % s.cols;
      ny = (ny + s.rows) % s.rows;

      if (s.playing && s.snake.slice(0, s.len - 1).some((p) => p.x === nx && p.y === ny)) {
        reset();
        return;
      }
      s.snake = [{ x: nx, y: ny }, ...s.snake].slice(0, s.len);

      const hit = s.supplies.findIndex((p) => p.x === nx && p.y === ny);
      if (hit >= 0) {
        s.supplies[hit] = placeSupply();
        if (s.playing) {
          s.len += 1;
          s.score += 1;
          setScore(s.score);
          setBest((b) => {
            const nb = Math.max(b, s.score);
            try { localStorage.setItem("rsq:snake:best", String(nb)); } catch { /* ignore */ }
            return nb;
          });
        }
      }
    };

    const draw = () => {
      const s = g.current;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const ox = (w - s.cols * CELL) / 2, oy = (h - s.rows * CELL) / 2;
      ctx.font = `${CELL - 4}px system-ui, "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      s.supplies.forEach((p) => ctx.fillText(p.icon, ox + p.x * CELL + CELL / 2, oy + p.y * CELL + CELL / 2 + 1));
      for (let i = s.snake.length - 1; i >= 0; i--) {
        const p = s.snake[i];
        const hue = 175 - i * 5;
        ctx.fillStyle = `hsl(${hue} 70% ${i === 0 ? 58 : 50}%)`;
        ctx.beginPath();
        ctx.arc(ox + p.x * CELL + CELL / 2, oy + p.y * CELL + CELL / 2, (i === 0 ? 0.48 : 0.4) * CELL, 0, Math.PI * 2);
        ctx.fill();
      }
      const hd = s.snake[0];
      if (hd) {
        ctx.fillStyle = "#fff";
        const ex = ox + hd.x * CELL + CELL / 2 + s.dir.x * 3, ey = oy + hd.y * CELL + CELL / 2 + s.dir.y * 3;
        ctx.beginPath(); ctx.arc(ex - 3, ey - 2, 2.4, 0, 7); ctx.arc(ex + 3, ey + 2, 2.4, 0, 7); ctx.fill();
      }
    };

    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      const every = g.current.playing ? PLAY_MS : IDLE_MS;
      if (!reduce && ts - last >= every) { last = ts; step(); }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reset, placeSupply]);

  return (
    <div ref={hostRef} className={`snake-banner ${playing ? "is-playing" : ""} ${className}`}>
      <canvas ref={canvasRef} aria-hidden />
      <div className="snake-controls">
        <button type="button" className="btn btn-sm btn-primary" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
          {playing ? `⏹ ${t("snake_stop")}` : `🐍 ${t("snake_play")}`}
        </button>
        {playing ? (
          <span className="snake-hud" role="status">🎒 {score} · {t("snake_best")} {best}</span>
        ) : (
          <span className="snake-hud">{t("snake_hint")}</span>
        )}
      </div>
      {playing && (
        <div className="snake-pad" aria-label="Direction pad">
          <button type="button" aria-label="Up" onClick={() => turn("up")}>▲</button>
          <button type="button" aria-label="Left" onClick={() => turn("left")}>◀</button>
          <button type="button" aria-label="Down" onClick={() => turn("down")}>▼</button>
          <button type="button" aria-label="Right" onClick={() => turn("right")}>▶</button>
        </div>
      )}
    </div>
  );
}

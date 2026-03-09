import React, { useEffect, useRef } from "react";
import "./floodScene.css";

/**
 * FloodScene
 * - Runners move around; wave emojis wander/chase
 * - Waterline oscillates; being below line too long "drowns" the runner
 * - Lifebuoy (🛟) can be dragged near a runner to grant temporary buoyancy
 */
export default function FloodScene() {
  const sceneRef = useRef(null);
  const rafRef = useRef(0);
  const boundsRef = useRef({ w: window.innerWidth, h: window.innerHeight });

  const runnersRef = useRef([]); // {el,x,y,vx,vy,alive,buoyUntil}
  const wavesRef   = useRef([]); // {el,x,y}
  const buoyRef    = useRef(null);
  const dragRef    = useRef({ dragging:false, dx:0, dy:0 });

  // Tunables
  const NUM_WAVES       = 3;         // 🌊 chasers
  const RUN_SPEED       = 1.0;       // runner speed
  const WAVE_SPEED      = 0.45;      // wave speed
  const WATER_MIN       = 0.62;      // % of height (min waterline)
  const WATER_MAX       = 0.72;      // % of height (max waterline)
  const WATER_PERIOD    = 6000;      // ms full oscillation period
  const DROWN_LATENCY   = 1100;      // ms a runner must be under water to drown
  const BUOY_DURATION   = 3500;      // ms immunity after lifebuoy
  const BUOY_RADIUS     = 70;        // px distance to apply buoyancy

  useEffect(() => {
    const scene = sceneRef.current;
    const onResize = () =>
      (boundsRef.current = { w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const rand  = (a, b) => Math.random() * (b - a) + a;

    // — visuals helpers —
    const bubbles = (x, y) => {
      for (let i = 0; i < 14; i++) {
        const b = document.createElement("span");
        b.className = "fl-bubble";
        b.textContent = "•";
        b.style.left = `${x}px`;
        b.style.top  = `${y}px`;
        const dx = (Math.random()-0.5) * 60;
        const dy = -40 - Math.random()*60;
        b.style.setProperty("--dx", `${dx}px`);
        b.style.setProperty("--dy", `${dy}px`);
        scene.appendChild(b);
        setTimeout(() => b.remove(), 900);
      }
    };

    // — runners —
    const spawnRunner = () => {
      const el = document.createElement("div");
      el.className = "fl-runner";
      el.textContent = Math.random() < 0.5 ? "🏃‍♂️" : "🏃‍♀️";
      scene.appendChild(el);

      const { w, h } = boundsRef.current;
      const x = rand(120, w-120);
      const y = rand(150, h-150);
      const vx = rand(-RUN_SPEED, RUN_SPEED);
      const vy = rand(-RUN_SPEED, RUN_SPEED);
      const r = { el, x, y, vx, vy, alive:true, drownAt:0, buoyUntil:0 };
      runnersRef.current.push(r);
      return r;
    };
    // two runners
    spawnRunner();
    spawnRunner();

    const removeRunner = (idx, cx, cy) => {
      const r = runnersRef.current[idx];
      if (!r) return;
      r.alive = false;
      r.el.classList.add("fl-fade");
      bubbles(cx, cy);
      setTimeout(() => r.el.remove(), 160);
      runnersRef.current.splice(idx, 1);
      // respawn new one
      setTimeout(spawnRunner, 400);
    };

    // — waves —
    const spawnWave = (x, y) => {
      const el = document.createElement("div");
      el.className = "fl-wave";
      el.textContent = "🌊";
      scene.appendChild(el);
      wavesRef.current.push({ el, x, y });
    };
    for (let i=0;i<NUM_WAVES;i++){
      const { w, h } = boundsRef.current;
      spawnWave(rand(100,w-100), rand(160,h-140));
    }

    // — lifebuoy —
    const buoy = document.createElement("div");
    buoy.className = "fl-buoy";
    buoy.textContent = "🛟";
    scene.appendChild(buoy);
    buoyRef.current = { el: buoy, x: 60, y: boundsRef.current.h - 100 };
    const dockBuoy = () => {
      buoyRef.current.x = 60;
      buoyRef.current.y = boundsRef.current.h - 100;
      buoy.style.left = `${buoyRef.current.x}px`;
      buoy.style.top  = `${buoyRef.current.y}px`;
    };
    dockBuoy();

    // drag
    const onDown = (e) => {
      dragRef.current.dragging = true;
      const t = e.touches?.[0] || e;
      dragRef.current.dx = t.pageX - buoyRef.current.x;
      dragRef.current.dy = t.pageY - buoyRef.current.y;
    };
    const onMove = (e) => {
      if (!dragRef.current.dragging) return;
      const t = e.touches?.[0] || e;
      const { w, h } = boundsRef.current;
      const x = clamp(t.pageX - dragRef.current.dx, 0, w-40);
      const y = clamp(t.pageY - dragRef.current.dy, 0, h-40);
      buoyRef.current.x = x; buoyRef.current.y = y;
      buoy.style.left = `${x}px`; buoy.style.top = `${y}px`;
    };
    const onUp = () => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      // grant buoyancy if close to a runner
      const bx = buoyRef.current.x + 12;
      const by = buoyRef.current.y + 12;
      let given = false;
      runnersRef.current.forEach(r => {
        const d = Math.hypot(r.x - bx, r.y - by);
        if (d < BUOY_RADIUS && r.alive) {
          r.buoyUntil = performance.now() + BUOY_DURATION;
          // small sparkle
          const s = document.createElement("span");
          s.className = "fl-spark";
          s.textContent = "✨";
          s.style.left = `${r.x}px`; s.style.top = `${r.y-18}px`;
          scene.appendChild(s);
          setTimeout(()=>s.remove(), 500);
          given = true;
        }
      });
      dockBuoy();
      if (given) { /* optional sound / haptic */ }
    };
    buoy.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    buoy.addEventListener("touchstart", onDown, { passive:true });
    window.addEventListener("touchmove", onMove, { passive:false });
    window.addEventListener("touchend", onUp);

    // main loop
    const t0 = performance.now();
    const step = () => {
      const now = performance.now();
      const { w, h } = boundsRef.current;

      // waterline (oscillating)
      const phase = (now - t0) / WATER_PERIOD;
      const frac  = (Math.sin(phase * Math.PI * 2) + 1) / 2; // 0..1
      const waterFrac = WATER_MIN + (WATER_MAX - WATER_MIN) * frac;
      const waterY = h * waterFrac;

      scene.style.setProperty("--waterY", `${waterY}px`);

      // runners
      runnersRef.current.forEach((r, idx) => {
        // wander
        if (Math.random() < 0.012) r.vx += (Math.random() - 0.5) * 0.6;
        if (Math.random() < 0.012) r.vy += (Math.random() - 0.5) * 0.6;
        r.vx = clamp(r.vx, -RUN_SPEED, RUN_SPEED);
        r.vy = clamp(r.vy, -RUN_SPEED, RUN_SPEED);

        r.x += r.vx;
        r.y += r.vy;

        // keep inside
        const margin = 60;
        if (r.x < margin || r.x > w - margin) r.vx *= -1;
        if (r.y < 140   || r.y > h - margin) r.vy *= -1;
        r.x = clamp(r.x, margin, w - margin);
        r.y = clamp(r.y, 140, h - margin);

        // drowning check
        const buoyed = now < r.buoyUntil;
        if (!buoyed) {
          if (r.y > waterY) {
            if (r.drownAt === 0) r.drownAt = now;
            if (now - r.drownAt > DROWN_LATENCY) {
              removeRunner(idx, r.x, r.y);
              return;
            }
          } else {
            r.drownAt = 0;
          }
        } else {
          r.drownAt = 0;
          r.el.classList.add("fl-buoyant");
          setTimeout(()=>r.el?.classList?.remove("fl-buoyant"), 200);
        }

        r.el.style.left = `${r.x}px`;
        r.el.style.top  = `${r.y}px`;
      });

      // waves chase nearest runner
      wavesRef.current.forEach((f) => {
        let nearest = null, nd = Infinity;
        runnersRef.current.forEach(r => {
          const d = Math.hypot(r.x - f.x, r.y - f.y);
          if (d < nd) { nd = d; nearest = r; }
        });
        if (nearest) {
          const dx = nearest.x - f.x;
          const dy = (nearest.y - 10) - f.y;
          const L = Math.hypot(dx, dy) || 1;
          f.x += (dx/L) * WAVE_SPEED;
          f.y += (dy/L) * WAVE_SPEED;
          // gentle bobble
          f.y += Math.sin(now/300 + f.x*0.02) * 0.2;

          f.x = clamp(f.x, 24, w-24);
          f.y = clamp(f.y, 140, h-24);
          f.el.style.left = `${f.x}px`;
          f.el.style.top  = `${f.y}px`;
        }
      });

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      buoy.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      buoy.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      if (scene) scene.innerHTML = "";
    };
  }, []);

  return <div className="flood-scene" ref={sceneRef} aria-hidden="true" />;
}
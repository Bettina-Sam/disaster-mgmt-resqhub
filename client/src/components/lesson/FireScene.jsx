import React, { useEffect, useRef } from "react";
import "./fireScene.css";

/**
 * FireScene v2
 * - 2 runners roam, flames (default 3) chase nearest
 * - Catch = smoke puff + particle dispersal, runner respawns
 * - One draggable extinguisher; drop near flame to remove & respawn elsewhere
 */
export default function FireScene() {
  const sceneRef   = useRef(null);
  const rafRef     = useRef(0);
  const boundsRef  = useRef({ w: window.innerWidth, h: window.innerHeight });

  const runnersRef = useRef([]); // [{el,x,y,vx,vy,alive}]
  const flamesRef  = useRef([]); // [{el,x,y,cooldown}]
  const extRef     = useRef(null);
  const dragRef    = useRef({ dragging:false, dx:0, dy:0 });

  // --- Tunables -------------------------------------------------------------
  const NUM_FLAMES         = 3;      // 🔥 count (2–3 per your ask)
  const RUN_SPEED          = 1.05;   // runner px/frame
  const FLAME_SPEED        = 0.55;   // flame px/frame
  const EXTINGUISH_RADIUS  = 64;     // extinguisher drop radius
  const CAPTURE_RADIUS     = 28;     // when flame catches runner
  const FLAME_COOLDOWN     = 600;    // ms: after catch, brief cooldown
  // -------------------------------------------------------------------------

  useEffect(() => {
    const scene = sceneRef.current;
    const onResize = () =>
      (boundsRef.current = { w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);

    
    // utils
    const rand   = (min, max) => Math.random() * (max - min) + min;
    const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // particles for “thin dispersal”
    const particleBurst = (x, y, count = 18) => {
      for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        p.className = "fs-particle";
        p.textContent = "•";                       // thin dot
        p.style.left = `${x}px`;
        p.style.top  = `${y}px`;
        // random vector
        const angle  = Math.random() * Math.PI * 2;
        const power  = 40 + Math.random() * 70;
        p.style.setProperty("--dx", `${Math.cos(angle) * power}px`);
        p.style.setProperty("--dy", `${Math.sin(angle) * power}px`);
        scene.appendChild(p);
        setTimeout(() => p.remove(), 700);
      }
    };

    const smokePuff = (x, y) => {
      const s = document.createElement("div");
      s.className = "fs-smoke";
      s.textContent = "💨";
      s.style.left = `${x - 8}px`;
      s.style.top  = `${y - 8}px`;
      scene.appendChild(s);
      setTimeout(() => s.remove(), 500);
    };

    // runners
    const makeRunner = () => {
      const el = document.createElement("div");
      el.className = "fs-runner";
      el.textContent = Math.random() < 0.5 ? "🏃‍♂️" : "🏃‍♀️";
      el.setAttribute("aria-hidden", "true");
      scene.appendChild(el);

      const { w, h } = boundsRef.current;
      const x = rand(120, w - 120);
      const y = rand(160, h - 160);
      const vx = rand(-RUN_SPEED, RUN_SPEED);
      const vy = rand(-RUN_SPEED, RUN_SPEED);
      return { el, x, y, vx, vy, alive: true };
    };

    const spawnRunner = () => {
      const r = makeRunner();
      runnersRef.current.push(r);
      return r;
    };

    // start with 2 runners
    spawnRunner();
    spawnRunner();

    const removeRunner = (idx, cx, cy) => {
      const r = runnersRef.current[idx];
      if (!r) return;
      r.alive = false;
      if (r.el) {
        r.el.classList.add("fs-fade");
        setTimeout(() => r.el.remove(), 120);
      }
      smokePuff(cx, cy);
      particleBurst(cx, cy);
      // remove from list
      runnersRef.current.splice(idx, 1);
      // respawn a new one soon
      setTimeout(spawnRunner, 350);
    };

    // flames
    const makeFlame = (x, y) => {
      const el = document.createElement("div");
      el.className = "fs-flame";
      el.textContent = "🔥";
      el.setAttribute("aria-hidden", "true");
      scene.appendChild(el);
      return { el, x, y, cooldown: 0 };
    };

    for (let i = 0; i < NUM_FLAMES; i++) {
      const { w, h } = boundsRef.current;
      flamesRef.current.push(makeFlame(rand(100, w - 100), rand(180, h - 140)));
    }

    // extinguisher (dock bottom-left)
    const ext = document.createElement("div");
    ext.className = "fs-ext";
    ext.textContent = "🧯";
    ext.setAttribute("role", "button");
    ext.setAttribute("aria-label", "Fire extinguisher");
    scene.appendChild(ext);

    const extDock = () => {
      const { h } = boundsRef.current;
      extRef.current.x = 48;
      extRef.current.y = h - 96;
      ext.style.left = `${extRef.current.x}px`;
      ext.style.top  = `${extRef.current.y}px`;
    };
    extRef.current = { el: ext, x: 0, y: 0 };
    extDock();

    // drag logic
    const onDown = (e) => {
      dragRef.current.dragging = true;
      const isTouch = e.type.startsWith("touch");
      const pageX = isTouch ? e.touches[0].pageX : e.pageX;
      const pageY = isTouch ? e.touches[0].pageY : e.pageY;
      dragRef.current.dx = pageX - extRef.current.x;
      dragRef.current.dy = pageY - extRef.current.y;
    };
    const onMove = (e) => {
      if (!dragRef.current.dragging) return;
      const isTouch = e.type.startsWith("touch");
      const pageX = isTouch ? e.touches[0].pageX : e.pageX;
      const pageY = isTouch ? e.touches[0].pageY : e.pageY;
      const { w, h } = boundsRef.current;
      const nx = clamp(pageX - dragRef.current.dx, 0, w - 40);
      const ny = clamp(pageY - dragRef.current.dy, 0, h - 40);
      extRef.current.x = nx;
      extRef.current.y = ny;
      ext.style.left = `${nx}px`;
      ext.style.top  = `${ny}px`;
    };
    const onUp = () => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      // extinguish one nearby flame
      const ex = extRef.current.x + 12;
      const ey = extRef.current.y + 12;
      for (let i = 0; i < flamesRef.current.length; i++) {
        const f = flamesRef.current[i];
        const d = Math.hypot(ex - (f.x + 10), ey - (f.y + 10));
        if (d < EXTINGUISH_RADIUS) {
          f.el.classList.add("fs-poof");
          setTimeout(() => {
            f.el.remove();
            flamesRef.current.splice(i, 1);
            // respawn elsewhere
            const { w, h } = boundsRef.current;
            flamesRef.current.push(
              makeFlame(rand(100, w - 100), rand(180, h - 140))
            );
          }, 300);
          break;
        }
      }
      extDock();
    };

    ext.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    ext.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    // main loop
    const tick = (t) => {
      const { w, h } = boundsRef.current;

      // move runners
      runnersRef.current.forEach((r) => {
        // wander
        if (Math.random() < 0.01) r.vx += (Math.random() - 0.5) * 0.6;
        if (Math.random() < 0.01) r.vy += (Math.random() - 0.5) * 0.6;
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

        r.el.style.left = `${r.x}px`;
        r.el.style.top  = `${r.y}px`;
      });

      // move flames (toward nearest runner)
      flamesRef.current.forEach((f) => {
        if (f.cooldown > 0) f.cooldown -= 16;

        // pick nearest runner
        let nearest = null, nd = Infinity, nx = 0, ny = 0;
        runnersRef.current.forEach((r) => {
          const d = Math.hypot(r.x - f.x, r.y - f.y);
          if (d < nd) { nd = d; nearest = r; nx = r.x; ny = r.y; }
        });

        if (nearest) {
          const dx = nx - f.x;
          const dy = ny - f.y;
          const len = Math.hypot(dx, dy) || 1;
          const sp  = (FLAME_SPEED) * (f.cooldown > 0 ? 0.4 : 1); // slow briefly after catch
          f.x += (dx / len) * sp;
          f.y += (dy / len) * sp;

          // tiny jitter to feel alive
          f.x += (Math.random() - 0.5) * 0.25;
          f.y += (Math.random() - 0.5) * 0.25;

          f.x = clamp(f.x, 24, w - 24);
          f.y = clamp(f.y, 140, h - 24);

          f.el.style.left = `${f.x}px`;
          f.el.style.top  = `${f.y}px`;

          // catch?
          if (f.cooldown <= 0) {
            for (let i = 0; i < runnersRef.current.length; i++) {
              const r = runnersRef.current[i];
              const d = Math.hypot(r.x - f.x, r.y - f.y);
              if (d < CAPTURE_RADIUS) {
                // consume runner
                removeRunner(i, r.x, r.y);
                f.cooldown = FLAME_COOLDOWN; // brief pause so it doesn't instantly re-catch
                break;
              }
            }
          }
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // cleanup
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      ext.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      ext.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      if (scene) scene.innerHTML = "";
    };
  }, []);

  return <div ref={sceneRef} className="fire-scene" aria-hidden="true" />;
}

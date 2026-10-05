import React, { useEffect, useRef } from "react";
import "./earthquakeScene.css";
import { emitScene } from "../../utils/sceneEvents";

/**
 * EarthquakeScene: runs in the background of the lesson.
 * People wander around. Every few seconds the ground shakes and rocks fall.
 * Tap a person to make them Drop, Cover and Hold On under the nearest table.
 * Covered people are safe; people caught in the open get hit.
 */
export default function EarthquakeScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    const NUM_PEOPLE = 4;
    const CALM_MS = 7000;
    const SHAKE_MS = 5500;
    const COVER_MS = 7500; // how long a tapped person stays under the table
    const rand = (a, b) => Math.random() * (b - a) + a;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const size = () => ({ w: window.innerWidth, h: window.innerHeight });

    let phase = "calm";
    let phaseUntil = performance.now() + 3500; // first quake comes a little sooner
    const people = [];
    const rocks = [];
    const tables = [];
    let raf = 0;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };

    // tables sit along the bottom so they are easy to reach
    const makeTable = (fx) => {
      const el = document.createElement("div");
      el.className = "eq-table";
      el.setAttribute("aria-hidden", "true");
      scene.appendChild(el);
      tables.push({ el, fx });
    };
    const placeTables = () => {
      const { w, h } = size();
      tables.forEach((t) => {
        t.x = w * t.fx;
        t.y = h - 110;
        t.el.style.left = `${t.x}px`;
        t.el.style.top = `${t.y}px`;
      });
    };
    makeTable(0.22); makeTable(0.5); makeTable(0.78);
    placeTables();

    const cover = (p) => {
      if (p.covered || p.down) return;
      let best = null, bd = Infinity;
      tables.forEach((t) => { const d = Math.hypot(t.x - p.x, t.y - p.y); if (d < bd) { bd = d; best = t; } });
      p.table = best;
      p.covered = performance.now() + COVER_MS;
      p.el.textContent = "🧎";
      p.el.classList.add("eq-covered");
      if (phase !== "shake") emitScene("tip", "quake");
    };
    const uncover = (p) => {
      p.covered = 0; p.table = null;
      p.el.textContent = "🧍";
      p.el.classList.remove("eq-covered");
    };

    const spawnPerson = () => {
      const { w, h } = size();
      const el = document.createElement("div");
      el.className = "eq-person";
      el.textContent = "🧍";
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "Person: tap to drop, cover and hold on");
      scene.appendChild(el);
      const p = { el, x: rand(120, w - 120), y: rand(170, h - 220), vx: rand(-0.7, 0.7), vy: rand(-0.5, 0.5), covered: 0, table: null, savedThisQuake: false, down: false };
      el.addEventListener("pointerdown", (e) => { e.preventDefault(); cover(p); });
      people.push(p);
    };
    for (let i = 0; i < NUM_PEOPLE; i++) spawnPerson();

    const spawnRocks = () => {
      const { w } = size();
      for (let i = 0; i < 9; i++) {
        const el = document.createElement("div");
        el.className = "eq-rock";
        el.textContent = Math.random() < 0.5 ? "🪨" : "🧱";
        el.setAttribute("aria-hidden", "true");
        scene.appendChild(el);
        rocks.push({ el, x: rand(60, w - 60), y: -40 - Math.random() * 400, vy: 2.4 + Math.random() * 1.6, hit: false });
      }
    };

    const startShake = () => {
      phase = "shake";
      phaseUntil = performance.now() + SHAKE_MS;
      scene.classList.add("eq-shaking");
      people.forEach((p) => { p.savedThisQuake = false; });
      spawnRocks();
      emitScene("phase", "quake", { phase: "shake" });
    };
    const endShake = () => {
      phase = "calm";
      phaseUntil = performance.now() + CALM_MS;
      scene.classList.remove("eq-shaking");
      rocks.splice(0).forEach((r) => r.el.remove());
      people.forEach((p) => {
        if (p.covered && !p.savedThisQuake) { p.savedThisQuake = true; emitScene("save", "quake"); }
      });
      emitScene("phase", "quake", { phase: "calm" });
    };

    const tick = () => {
      const now = performance.now();
      const { w, h } = size();
      if (now >= phaseUntil) (phase === "calm" ? startShake : endShake)();

      people.forEach((p) => {
        if (p.down) return;
        if (p.covered) {
          if (p.table) { p.x += (p.table.x + 10 - p.x) * 0.12; p.y += (p.table.y + 6 - p.y) * 0.12; }
          if (now > p.covered && phase !== "shake") uncover(p);
        } else {
          if (Math.random() < 0.015) p.vx += (Math.random() - 0.5) * 0.6;
          if (Math.random() < 0.015) p.vy += (Math.random() - 0.5) * 0.4;
          p.vx = clamp(p.vx, -0.9, 0.9); p.vy = clamp(p.vy, -0.6, 0.6);
          p.x = clamp(p.x + p.vx, 40, w - 60);
          p.y = clamp(p.y + p.vy, 150, h - 150);
        }
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
      });

      if (phase === "shake") {
        rocks.forEach((r) => {
          r.y += r.vy;
          r.el.style.left = `${r.x}px`;
          r.el.style.top = `${r.y}px`;
          if (r.y > 0 && !r.hit) {
            people.forEach((p) => {
              if (!p.covered && !p.down && Math.hypot(p.x - r.x, p.y - r.y) < 32) {
                r.hit = true;
                p.down = true;
                p.el.textContent = "🤕";
                p.el.classList.add("eq-hit");
                emitScene("lose", "quake");
                later(() => {
                  p.down = false;
                  p.el.classList.remove("eq-hit");
                  p.el.textContent = "🧍";
                  p.x = rand(120, w - 120);
                  p.y = rand(170, h - 220);
                }, 1400);
              }
            });
          }
          if (r.y > h + 40) { r.y = -40 - Math.random() * 300; r.hit = false; }
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", placeTables);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", placeTables);
      scene.classList.remove("eq-shaking");
      scene.innerHTML = "";
    };
  }, []);

  return <div ref={sceneRef} className="earthquake-scene" />;
}

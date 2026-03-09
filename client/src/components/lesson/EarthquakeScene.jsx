import React, { useEffect, useRef } from "react";
import "./earthquakeScene.css";

export default function EarthquakeScene() {
  const sceneRef = useRef(null);
  const rafRef   = useRef(0);
  const boundsRef = useRef({ w: window.innerWidth, h: window.innerHeight });

  const peopleRef = useRef([]);
  const debrisRef  = useRef([]);
  const shelterRef = useRef(null);

  // --- Tunables ---
  const NUM_PEOPLE = 3;
  const NUM_DEBRIS = 5;
  const PERSON_SPEED = 0.6;
  const DEBRIS_SPEED = 1.2;

  useEffect(() => {
    const scene = sceneRef.current;
    const { w, h } = boundsRef.current;

    const rand = (min, max) => Math.random() * (max - min) + min;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // --- People ---
    const spawnPerson = () => {
      const p = document.createElement("div");
      p.className = "eq-person glow";
      p.textContent = "🧍";
      const x = rand(120, w - 120);
      const y = rand(160, h - 160);
      const vx = rand(-PERSON_SPEED, PERSON_SPEED);
      const vy = rand(-PERSON_SPEED, PERSON_SPEED);
      scene.appendChild(p);
      peopleRef.current.push({ el: p, x, y, vx, vy, alive: true });
      return { el: p, x, y, vx, vy, alive: true };
    };
    for (let i = 0; i < NUM_PEOPLE; i++) spawnPerson();

    // --- Shelter ---
    const shelter = document.createElement("div");
    shelter.className = "eq-shelter";
    shelter.textContent = "🏠";
    shelterRef.current = { el: shelter, x: w - 150, y: h - 150 };
    shelter.style.left = `${shelterRef.current.x}px`;
    shelter.style.top  = `${shelterRef.current.y}px`;
    scene.appendChild(shelter);

    // --- Falling debris ---
    const spawnDebris = () => {
      const d = document.createElement("div");
      d.className = "eq-debris";
      d.textContent = "💥";
      const x = rand(50, w - 50);
      const y = -50; // start above screen
      scene.appendChild(d);
      debrisRef.current.push({ el: d, x, y, vy: DEBRIS_SPEED });
      return { el: d, x, y, vy: DEBRIS_SPEED };
    };
    for (let i = 0; i < NUM_DEBRIS; i++) spawnDebris();

    // --- Animation loop ---
    const tick = () => {
      // Move people
      peopleRef.current.forEach(p => {
        if (!p.alive) return;
        p.x += p.vx;
        p.y += p.vy;
        // Bounce off edges
        p.x = clamp(p.x, 0, w - 40);
        p.y = clamp(p.y, 140, h - 40);
        p.el.style.left = `${p.x}px`;
        p.el.style.top  = `${p.y}px`;

        // Check if in shelter
        const s = shelterRef.current;
        const dx = p.x - s.x;
        const dy = p.y - s.y;
        if (Math.hypot(dx, dy) < 50) {
          // Safe! respawn
          p.el.style.opacity = 0;
          setTimeout(() => {
            p.x = rand(120, w - 120);
            p.y = rand(160, h - 160);
            p.el.style.opacity = 1;
          }, 500);
        }
      });

      // Move debris
      debrisRef.current.forEach((d, i) => {
        d.y += d.vy;
        d.el.style.top = `${d.y}px`;

        // Check collision with people
        peopleRef.current.forEach((p) => {
          const dist = Math.hypot(d.x - p.x, d.y - p.y);
          if (dist < 30 && p.alive) {
            p.alive = false;
            d.el.classList.add("eq-poof");
            setTimeout(() => {
              p.el.style.opacity = 1;
              p.x = rand(120, w - 120);
              p.y = rand(160, h - 160);
              p.alive = true;
            }, 500);
          }
        });

        // Reset debris if off screen
        if (d.y > h) d.y = -50;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (scene) scene.innerHTML = "";
    };
  }, []);

  return <div ref={sceneRef} className="earthquake-scene" aria-hidden="true" />;
}

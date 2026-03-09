import React, { useEffect, useRef } from "react";
import "./cycloneScene.css";

export default function CycloneScene() {
  const sceneRef = useRef(null);
  const rafRef = useRef(0);
  const peopleRef = useRef([]);
  const cycloneRef = useRef(null);
  const shelterRef = useRef(null);
  const boundsRef = useRef({ w: window.innerWidth, h: window.innerHeight });
  const dragRef = useRef({ dragging: false, person: null, dx: 0, dy: 0 });

  useEffect(() => {
    const scene = sceneRef.current;
    const rand = (min, max) => Math.random() * (max - min) + min;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const { w, h } = boundsRef.current;

    // 🌪 Cyclone emoji
    const cyclone = document.createElement("div");
    cyclone.className = "cy-cyclone";
    cyclone.textContent = "🌪";
    scene.appendChild(cyclone);
    cycloneRef.current = { el: cyclone, x: w / 2, y: h / 2, vx: 1, vy: 1 };

    // 🏠 Shelter (fixed bottom-left)
    const shelter = document.createElement("div");
    shelter.className = "cy-shelter";
    shelter.textContent = "🏠";
    scene.appendChild(shelter);
    shelterRef.current = { el: shelter, x: 80, y: h - 140, w: 60, h: 60 };

    // 🧍 People roaming
    const spawnPerson = () => {
      const p = document.createElement("div");
      p.className = "cy-person glow";
      p.textContent = "🧍";
      const x = rand(120, w - 120);
      const y = rand(200, h - 160);
      const vx = rand(-0.6, 0.6);
      const vy = rand(-0.6, 0.6);
      scene.appendChild(p);
      peopleRef.current.push({ el: p, x, y, vx, vy, alive: true });
      return { el: p, x, y, vx, vy, alive: true };
    };

    for (let i = 0; i < 6; i++) spawnPerson();

    // Particle effect for engulf
    const particleBurst = (x, y, count = 15) => {
      for (let i = 0; i < count; i++) {
        const particle = document.createElement("span");
        particle.className = "cy-particle";
        particle.textContent = "•";
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        const angle = Math.random() * Math.PI * 2;
        const power = 30 + Math.random() * 50;
        particle.style.setProperty("--dx", `${Math.cos(angle) * power}px`);
        particle.style.setProperty("--dy", `${Math.sin(angle) * power}px`);
        scene.appendChild(particle);
        setTimeout(() => particle.remove(), 700);
      }
    };

    // Drag logic
    const onDown = (e) => {
      const target = e.target.closest(".cy-person");
      if (!target) return;
      dragRef.current.dragging = true;
      dragRef.current.person = peopleRef.current.find(p => p.el === target);
      const pageX = e.type.startsWith("touch") ? e.touches[0].pageX : e.pageX;
      const pageY = e.type.startsWith("touch") ? e.touches[0].pageY : e.pageY;
      dragRef.current.dx = pageX - dragRef.current.person.x;
      dragRef.current.dy = pageY - dragRef.current.person.y;
    };
    const onMove = (e) => {
      if (!dragRef.current.dragging) return;
      const pageX = e.type.startsWith("touch") ? e.touches[0].pageX : e.pageX;
      const pageY = e.type.startsWith("touch") ? e.touches[0].pageY : e.pageY;
      const p = dragRef.current.person;
      p.x = clamp(pageX - dragRef.current.dx, 0, w - 40);
      p.y = clamp(pageY - dragRef.current.dy, 140, h - 40);
      p.el.style.left = `${p.x}px`;
      p.el.style.top = `${p.y}px`;
    };
    const onUp = () => {
      if (!dragRef.current.dragging) return;
      const p = dragRef.current.person;
      dragRef.current.dragging = false;
      dragRef.current.person = null;

      // Check if in shelter
      const s = shelterRef.current;
      if (p.x + 20 > s.x && p.x < s.x + s.w &&
          p.y + 20 > s.y && p.y < s.y + s.h) {
        // saved
        p.el.style.opacity = 0;
        p.alive = false;
        setTimeout(() => {
          const np = spawnPerson();
          np.el.style.opacity = 1;
        }, 1500);
      }
    };

    scene.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    scene.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    // Main loop
    const tick = () => {
      const { w, h } = boundsRef.current;
      const cyclone = cycloneRef.current;

      // Move people randomly
      peopleRef.current.forEach((p) => {
        if (!p.alive) return;
        if (!dragRef.current.dragging || dragRef.current.person !== p) {
          if (Math.random() < 0.02) p.vx += (Math.random() - 0.5) * 0.4;
          if (Math.random() < 0.02) p.vy += (Math.random() - 0.5) * 0.4;
          p.x = clamp(p.x + p.vx, 60, w - 60);
          p.y = clamp(p.y + p.vy, 140, h - 60);
          p.el.style.left = `${p.x}px`;
          p.el.style.top = `${p.y}px`;
        }
      });

      // Cyclone chases nearest alive person
      let nearest = null, nd = Infinity;
      peopleRef.current.forEach((p) => {
        if (!p.alive) return;
        const d = Math.hypot(p.x - cyclone.x, p.y - cyclone.y);
        if (d < nd) { nd = d; nearest = p; }
      });

      if (nearest) {
        const dx = nearest.x - cyclone.x;
        const dy = nearest.y - cyclone.y;
        const len = Math.hypot(dx, dy) || 1;
        cyclone.vx = (dx / len) * 1.2;
        cyclone.vy = (dy / len) * 1.2;
        cyclone.x = clamp(cyclone.x + cyclone.vx, 60, w - 60);
        cyclone.y = clamp(cyclone.y + cyclone.vy, 140, h - 60);
        cyclone.el.style.left = `${cyclone.x}px`;
        cyclone.el.style.top = `${cyclone.y}px`;

        // Sometimes engulf nearest person
        if (Math.random() < 0.004 && nearest.alive) {
          nearest.el.style.opacity = 0;
          nearest.alive = false;
          particleBurst(nearest.x, nearest.y);
          setTimeout(() => {
            const np = spawnPerson();
            np.el.style.opacity = 1;
          }, 1800);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      scene.innerHTML = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return <div ref={sceneRef} className="cyclone-scene" aria-hidden="true" />;
}

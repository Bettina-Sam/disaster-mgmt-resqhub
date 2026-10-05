import React, { useEffect, useRef } from "react";
import "./accidentScene.css";
import { emitScene } from "../../utils/sceneEvents";

/**
 * AccidentScene: runs in the background of the lesson.
 * Cars drive along a road. Every so often there is a crash with an injured person.
 * Help in the right order before the timer runs out:
 *   1) drag the 🔺 warning triangle up the road from the crash (make it safe),
 *   2) tap 📞 to call 112,
 *   3) tap 🩹 to give first aid.
 */
const STEP_MS = 24000; // time to finish one incident
const GAP_MS = 6000;

export default function AccidentScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;
    const rand = (a, b) => Math.random() * (b - a) + a;
    const size = () => ({ w: window.innerWidth, h: window.innerHeight });
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
    let raf = 0;

    const road = document.createElement("div");
    road.className = "ac-road";
    scene.appendChild(road);

    // traffic
    const cars = [];
    const makeCar = (i) => {
      const el = document.createElement("div");
      el.className = "ac-car";
      el.textContent = ["🚗", "🚕", "🚙", "🚌"][i % 4];
      el.setAttribute("aria-hidden", "true");
      scene.appendChild(el);
      cars.push({ el, x: rand(-200, window.innerWidth), v: rand(1.2, 2.6) });
    };
    for (let i = 0; i < 5; i++) makeCar(i);

    // the triangle lives in a dock until you drag it
    const tri = document.createElement("div");
    tri.className = "ac-tri";
    tri.textContent = "🔺";
    tri.setAttribute("role", "button");
    tri.setAttribute("aria-label", "Warning triangle: drag it up the road from the crash");
    scene.appendChild(tri);
    const tr = { x: 70, y: 0, dragging: false, dx: 0, dy: 0, placed: false };

    // incident state
    let inc = null; // { x, y, step, until, els }
    const roadY = () => size().h * 0.5;

    const buttons = document.createElement("div");
    buttons.className = "ac-actions";
    const callBtn = document.createElement("button");
    callBtn.className = "ac-btn";
    callBtn.textContent = "📞 112";
    const aidBtn = document.createElement("button");
    aidBtn.className = "ac-btn";
    aidBtn.textContent = "🩹";
    buttons.append(callBtn, aidBtn);
    scene.appendChild(buttons);
    buttons.style.display = "none";

    const dockTri = () => { tr.x = 70; tr.y = size().h - 100; tr.placed = false; tri.style.left = `${tr.x}px`; tri.style.top = `${tr.y}px`; };
    dockTri();

    const markStep = () => {
      if (!inc) return;
      inc.crash.dataset.step = String(inc.step);
      callBtn.classList.toggle("ac-next", inc.step === 1);
      aidBtn.classList.toggle("ac-next", inc.step === 2);
      tri.classList.toggle("ac-next", inc.step === 0);
    };

    const startIncident = () => {
      const { w } = size();
      const x = rand(w * 0.3, w * 0.7);
      const y = roadY();
      const crash = document.createElement("div");
      crash.className = "ac-crash";
      crash.innerHTML = '<span class="ac-boom">💥🚗</span><span class="ac-vic">🤕</span><span class="ac-bar"><i></i></span>';
      crash.style.left = `${x}px`;
      crash.style.top = `${y}px`;
      scene.appendChild(crash);
      inc = { x, y, step: 0, until: performance.now() + STEP_MS, crash, bar: crash.querySelector(".ac-bar i") };
      buttons.style.display = "flex";
      buttons.style.left = `${x}px`;
      buttons.style.top = `${y + 62}px`;
      dockTri();
      markStep();
      emitScene("phase", "accident", { phase: "crash" });
    };

    const finishIncident = (ok) => {
      if (!inc) return;
      const c = inc.crash;
      inc = null;
      buttons.style.display = "none";
      tri.classList.remove("ac-next"); callBtn.classList.remove("ac-next"); aidBtn.classList.remove("ac-next");
      emitScene(ok ? "save" : "lose", "accident");
      c.classList.add(ok ? "ac-ok" : "ac-bad");
      later(() => { c.remove(); }, 1100);
      dockTri();
      later(startIncident, GAP_MS);
    };

    const needSafe = () => emitScene("tip", "accident", { tip: "safe" });
    callBtn.addEventListener("click", () => {
      if (!inc) return;
      if (inc.step === 0) { needSafe(); return; }
      if (inc.step === 1) { inc.step = 2; markStep(); }
    });
    aidBtn.addEventListener("click", () => {
      if (!inc) return;
      if (inc.step < 2) { emitScene("tip", "accident", { tip: inc.step === 0 ? "safe" : "call" }); return; }
      finishIncident(true);
    });

    // drag the triangle
    const pt = (e) => (e.touches ? e.touches[0] : e);
    const onDown = (e) => { tr.dragging = true; const p = pt(e); tr.dx = p.clientX - tr.x; tr.dy = p.clientY - tr.y; e.preventDefault?.(); };
    const onMove = (e) => {
      if (!tr.dragging) return;
      const p = pt(e);
      tr.x = p.clientX - tr.dx; tr.y = p.clientY - tr.dy;
      tri.style.left = `${tr.x}px`; tri.style.top = `${tr.y}px`;
    };
    const onUp = () => {
      if (!tr.dragging) return;
      tr.dragging = false;
      if (!inc) { dockTri(); return; }
      // correct place: on the road, 70-260 px before the crash (to its left, where traffic arrives from)
      const onRoad = Math.abs(tr.y - inc.y) < 70;
      const before = inc.x - tr.x > 70 && inc.x - tr.x < 300;
      if (inc.step === 0 && onRoad && before) { tr.placed = true; inc.step = 1; markStep(); }
      else { emitScene("tip", "accident", { tip: "place" }); dockTri(); }
    };
    tri.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const tick = (t) => {
      const { w } = size();
      const y = roadY();
      road.style.top = `${y - 38}px`;
      cars.forEach((c, i) => {
        // traffic slows near a placed triangle and a crash
        let v = c.v;
        if (tr.placed && inc && c.x > tr.x - 120 && c.x < tr.x) v *= 0.35;
        c.x += v;
        if (c.x > w + 80) c.x = -100 - Math.random() * 300;
        c.el.style.left = `${c.x}px`;
        c.el.style.top = `${y + (i % 2 ? -10 : 14)}px`;
      });
      if (inc) {
        const left = Math.max(0, inc.until - t);
        inc.bar.style.width = `${(left / STEP_MS) * 100}%`;
        if (left <= 0) finishIncident(false);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    later(startIncident, 2500);

    const onResize = () => { if (!inc) dockTri(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
      scene.innerHTML = "";
    };
  }, []);

  return <div ref={sceneRef} className="accident-scene" />;
}

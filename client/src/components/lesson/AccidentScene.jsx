import { useEffect, useRef } from "react";
import "./accidentScene.css";

/**
 * AccidentScene — minimal render sanity check
 * - Spawns 2 "cars" and 3 "cones"
 * - Cars move left→right and wrap
 * - You can drag cones
 * - Console logs mount/unmount + child count
 */
export default function AccidentScene() {
  const sceneRef = useRef(null);
  const rafRef = useRef(0);
  const objsRef = useRef([]); // {el, x, y, vx, vy, type}
  const dragRef = useRef({ active:false, target:null, dx:0, dy:0 });

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    console.log("[AccidentScene] mount");
    scene.style.setProperty("--w", scene.clientWidth + "px");
    scene.style.setProperty("--h", scene.clientHeight + "px");

    const W = scene.clientWidth || window.innerWidth;
    const H = scene.clientHeight || window.innerHeight;

    const make = (cls, x, y, vx=0, vy=0, type="misc") => {
      const el = document.createElement("div");
      el.className = cls;
      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;
      scene.appendChild(el);
      objsRef.current.push({ el, x, y, vx, vy, type });
      return el;
    };

    // spawn 2 cars
    make("car", 40,  H*0.35, 1.8, 0, "car");
    make("car", 140, H*0.6,  2.4, 0, "car");

    // spawn 3 cones (draggable)
    make("cone", W*0.45, H*0.55, 0, 0, "cone");
    make("cone", W*0.50, H*0.58, 0, 0, "cone");
    make("cone", W*0.55, H*0.61, 0, 0, "cone");

    console.log("[AccidentScene] children:", scene.children.length);

    const onDown = (e) => {
      const target = e.target.closest(".cone");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      dragRef.current.active = true;
      dragRef.current.target = objsRef.current.find(o => o.el === target);
      dragRef.current.dx = e.clientX - rect.left;
      dragRef.current.dy = e.clientY - rect.top;
      e.preventDefault();
    };
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d.active || !d.target) return;
      const x = e.clientX - d.dx;
      const y = e.clientY - d.dy;
      d.target.x = x; d.target.y = y;
      d.target.el.style.left = x + "px";
      d.target.el.style.top  = y + "px";
    };
    const onUp = () => { dragRef.current.active = false; dragRef.current.target = null; };

    scene.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    const tick = () => {
      const W = scene.clientWidth, H = scene.clientHeight;
      for (const o of objsRef.current) {
        if (o.type === "car") {
          o.x += o.vx;
          if (o.x > W + 60) o.x = -120; // wrap
          o.el.style.left = o.x + "px";
          o.el.style.top  = o.y + "px";
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      scene.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      objsRef.current.forEach(o => o.el.remove());
      objsRef.current = { current: [] };
      console.log("[AccidentScene] unmount");
    };
  }, []);

  return (
    <div className="accident-scene" ref={sceneRef}>
      {/* Debug overlay */}
      <div className="hud">Accident — debug on</div>
    </div>
  );
}

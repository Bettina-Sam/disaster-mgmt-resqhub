import React from "react";

/**
 * ResQHub Animated Background
 * - particle constellation + soft glow
 * - gentle hatch drift
 * - hazard-driven ripples and emoji floats
 * - respects prefers-reduced-motion
 * - non-blocking (pointerEvents: none)
 *
 * Dispatch custom events anywhere:
 *   window.dispatchEvent(new CustomEvent("rsq:hazard", { detail: "FIRE" }));
 *   window.dispatchEvent(new Event("rsq:critical"));
 *
 * Make sure your app content sits above the canvas:
 *   #root { position: relative; z-index: 1; }
 */

export default function BackgroundFX() {
  const ref = React.useRef(null);
  const S = React.useRef({
    w: 0,
    h: 0,
    ctx: null,
    parts: [],
    floats: [],
    ripples: [],
    mouse: { x: -9999, y: -9999 },
    color: "rgba(99,102,241,0.7)",
    running: true,
    rpm:
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  });

  const HAZ = React.useRef({
    FLOOD: { color: "rgba(59,130,246,0.75)", emoji: "🌊" },
    FIRE: { color: "rgba(239,68,68,0.8)", emoji: "🔥" },
    CYCLONE: { color: "rgba(56,189,248,0.75)", emoji: "🌀" },
    EARTHQUAKE: { color: "rgba(245,158,11,0.8)", emoji: "💥" },
    ACCIDENT: { color: "rgba(99,102,241,0.75)", emoji: "🚑" },
    OTHER: { color: "rgba(34,197,94,0.75)", emoji: "🧰" },
  });

  React.useEffect(() => {
    const cv = ref.current;
    if (!cv) return;

    const s = S.current;
    const ctx = cv.getContext("2d");
    s.ctx = ctx;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      s.w = cv.clientWidth;
      s.h = cv.clientHeight;
      cv.width = Math.floor(s.w * dpr);
      cv.height = Math.floor(s.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = s.rpm
        ? 40
        : Math.max(90, Math.min(180, Math.floor((s.w * s.h) / 8000)));

      while (s.parts.length < target) s.parts.push(spawnParticle(s));
      while (s.parts.length > target) s.parts.pop();
    };

    // Observe size
    let ro = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(resize);
      ro.observe(cv);
    } else {
      // Fallback
      window.addEventListener("resize", resize);
    }
    resize();

    // Mouse
    const mm = (e) => {
      const r = cv.getBoundingClientRect();
      s.mouse.x = e.clientX - r.left;
      s.mouse.y = e.clientY - r.top;
    };
    const ml = () => {
      s.mouse.x = -9999;
      s.mouse.y = -9999;
    };
    cv.addEventListener("mousemove", mm);
    cv.addEventListener("mouseleave", ml);

    // Hazard events
    const onHaz = (ev) => {
      const type = ev.detail || "OTHER";
      const h = HAZ.current[type] || HAZ.current.OTHER;
      s.color = h.color;
      for (let i = 0; i < 10; i++) s.floats.push(spawnFloat(s, h.emoji));
      spawnRipple(s, { strong: false }); // gentle pulse on type change
    };
    const onCritical = () => {
      spawnRipple(s, { strong: true }); // stronger pulse on critical
      for (let i = 0; i < 8; i++) s.floats.push(spawnFloat(s, "⚠️"));
    };
    window.addEventListener("rsq:hazard", onHaz);
    window.addEventListener("rsq:critical", onCritical);

    // Raf loop
    s.running = true;
    let raf = 0;
    const tick = () => {
      if (!s.running) return;
      raf = requestAnimationFrame(tick);
      draw(s);
    };
    raf = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      s.running = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", resize);
      cv.removeEventListener("mousemove", mm);
      cv.removeEventListener("mouseleave", ml);
      window.removeEventListener("rsq:hazard", onHaz);
      window.removeEventListener("rsq:critical", onCritical);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0, // canvas below app content, above body
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
      aria-hidden
    />
  );
}

/* ---------------- helpers ---------------- */

const R = (min, max) => Math.random() * (max - min) + min;

const withAlpha = (rgba, a) =>
  rgba.replace(
    /rgba\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*[0-9.]+\s*\)/,
    (_, r, g, b) => `rgba(${r},${g},${b},${a})`
  );

function spawnParticle(s) {
  const sp = s.rpm ? 0.08 : 0.18;
  return { x: R(0, s.w), y: R(0, s.h), vx: R(-sp, sp), vy: R(-sp, sp), r: R(0.6, 1.8) };
}

function spawnFloat(s, emoji) {
  return {
    emoji,
    x: R(0, s.w),
    y: s.h + R(0, 80),
    vy: R(-0.9, -0.5),
    life: R(1200, 2000),
    a: 1,
    size: R(16, 24),
  };
}

function spawnRipple(s, { strong }) {
  const cx = s.w * 0.5;
  const cy = s.h * 0.42;
  s.ripples.push({
    x: cx,
    y: cy,
    r: 8,
    vr: strong ? 3.4 : 2.0,
    a: strong ? 0.35 : 0.22,
    color: withAlpha(s.color, 0.9),
  });
}

function draw(s) {
  const { ctx, w, h, parts, floats, ripples, mouse, color } = s;
  if (!ctx) return;

  ctx.clearRect(0, 0, w, h);

  // big glow
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 40, w * 0.5, h * 0.42, Math.max(w, h) * 0.8);
  g.addColorStop(0, withAlpha(color, 0.16));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // subtle moving hatch
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.translate((Date.now() / 12000) % w, 0);
  for (let y = 0; y < h; y += 26) ctx.fillRect(0, y, w, 1);
  ctx.restore();

  // constellation particles + links
  const maxD = 120;
  for (let i = 0; i < parts.length; i++) {
    const a = parts[i];
    a.x += a.vx;
    a.y += a.vy;
    if (a.x < -10) a.x = w + 10;
    if (a.x > w + 10) a.x = -10;
    if (a.y < -10) a.y = h + 10;
    if (a.y > h + 10) a.y = -10;

    // mouse repel
    const dx = a.x - mouse.x,
      dy = a.y - mouse.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < 220 * 220) {
      const f = -0.02 / Math.max(60, d2);
      a.vx += dx * f;
      a.vy += dy * f;
    }

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < parts.length; j++) {
      const b = parts[j];
      const ddx = a.x - b.x,
        ddy = a.y - b.y;
      const d = Math.hypot(ddx, ddy);
      if (d < maxD) {
        const al = (1 - d / maxD) * 0.16;
        ctx.strokeStyle = `rgba(255,255,255,${al})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.r += r.vr;
    r.a *= 0.985;

    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = withAlpha(r.color, r.a);
    ctx.stroke();

    if (r.a < 0.02 || r.r > Math.max(w, h)) ripples.splice(i, 1);
  }

  // emoji floats
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i];
    f.y += f.vy;
    f.life -= 16;
    f.a = Math.max(0, f.life / 2000);
    ctx.globalAlpha = f.a;
    ctx.font = `${f.size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
    ctx.fillText(f.emoji, f.x, f.y);
    ctx.globalAlpha = 1;
    if (f.life <= 0 || f.y < -40) floats.splice(i, 1);
  }

  // cap float count just in case
  if (floats.length > 140) floats.splice(0, floats.length - 140);
}

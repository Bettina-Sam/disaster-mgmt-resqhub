import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * The ResQ crew: four friendly shapes whose eyes follow the cursor.
 *
 * mood:  "idle"  - calm, blinks now and then
 *        "dance" - bounces (used when hovering the login card)
 *        "happy" - big smiles, a small hop
 *        "alert" - wide eyes, round mouths, a gentle shake (used when something serious is happening)
 * lookAway: pupils turn away from the cursor.
 * onClick:  fires when the crew is clicked (it also does a small hop).
 */
const MOUTHS = {
  smile: ["M62,202 q12,10 24,0", "M118,118 q10,6 20,0", "M205,152 q10,6 20,0", "M296,168 q8,5 16,0"],
  flat: ["M64,206 h20", "M120,122 h18", "M207,156 h18", "M298,172 h14"],
  open: ["M74,198 a8,9 0 1,0 0.1,0", "M128,116 a6,7 0 1,0 0.1,0", "M215,150 a5,6 0 1,0 0.1,0", "M304,166 a5,6 0 1,0 0.1,0"],
};
const MOUTH_COLORS = ["#3b1d13", "#1e142a", "#c9c9c9", "#3a2800"];

export default function Mascot({ size = 520, lookAway = false, mood = "idle", onClick, className = "" }) {
  const svgRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [hop, setHop] = useState(false);

  const eyes = useMemo(
    () => [
      { cx: 115, cy: 145, r: 12 },
      { cx: 210, cy: 155, r: 11 },
      { cx: 305, cy: 170, r: 11 },
      { cx: 75, cy: 195, r: 10 },
    ],
    []
  );

  useEffect(() => {
    const onMove = (e) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Blink every few seconds (not when alarmed: eyes stay wide).
  useEffect(() => {
    if (mood === "alert") return undefined;
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3800);
    return () => clearInterval(id);
  }, [mood]);

  const pupilOffset = (eye) => {
    const MAX = 7.5;
    const dx = mouse.x - eye.cx;
    const dy = mouse.y - eye.cy;
    const len = Math.hypot(dx, dy) || 1;
    const dir = lookAway ? -1.25 : 1.0;
    return { dx: (dx / len) * MAX * dir, dy: (dy / len) * MAX * dir };
  };

  const mouths = mood === "alert" ? MOUTHS.open : MOUTHS.smile;

  const handleClick = () => {
    setHop(true);
    setTimeout(() => setHop(false), 450);
    onClick?.();
  };

  const cls = `rsq-crew rsq-crew-${hop ? "hop" : mood} ${className}`;

  return (
    <div className={cls} style={{ width: size, maxWidth: "min(95vw, 680px)" }} onClick={handleClick} role={onClick ? "button" : undefined} aria-hidden={onClick ? undefined : true} aria-label={onClick ? "Safety tip from the ResQ crew" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && handleClick() : undefined}>
      <style>{`
        .rsq-crew { cursor: ${onClick ? "pointer" : "default"}; }
        .rsq-crew svg { overflow: visible; }
        .rsq-crew .p1, .rsq-crew .p2, .rsq-crew .p3, .rsq-crew .p4 { transform-box: fill-box; transform-origin: 50% 100%; }
        @keyframes rsq-bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes rsq-hop { 0% { transform: translateY(0) } 40% { transform: translateY(-22px) scaleY(1.05) } 100% { transform: translateY(0) } }
        @keyframes rsq-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-3px) } 75% { transform: translateX(3px) } }
        .rsq-crew-dance .p1 { animation: rsq-bounce .7s ease-in-out infinite }
        .rsq-crew-dance .p2 { animation: rsq-bounce .7s ease-in-out .12s infinite }
        .rsq-crew-dance .p3 { animation: rsq-bounce .7s ease-in-out .24s infinite }
        .rsq-crew-dance .p4 { animation: rsq-bounce .7s ease-in-out .36s infinite }
        .rsq-crew-happy .p1, .rsq-crew-happy .p2, .rsq-crew-happy .p3, .rsq-crew-happy .p4 { animation: rsq-hop 1.8s ease-in-out infinite }
        .rsq-crew-hop .p1, .rsq-crew-hop .p2, .rsq-crew-hop .p3, .rsq-crew-hop .p4 { animation: rsq-hop .45s ease-out 1 }
        .rsq-crew-alert .p1, .rsq-crew-alert .p2, .rsq-crew-alert .p3, .rsq-crew-alert .p4 { animation: rsq-shake .35s linear infinite }
        @media (prefers-reduced-motion: reduce) { .rsq-crew * { animation: none !important } }
      `}</style>
      <svg ref={svgRef} viewBox="0 0 380 260" width="100%" height="100%" role="img">
        <g className="p4"><path d="M30,220 Q95,130 170,200 T330,220 Z" fill="#ff7a45" /></g>
        <g className="p1"><rect x="80" y="40" width="110" height="120" rx="18" fill="#6f4cff" /></g>
        <g className="p2"><rect x="185" y="70" width="60" height="130" rx="14" fill="#0d0f14" /></g>
        <g className="p3"><rect x="270" y="95" width="70" height="120" rx="22" fill="#ffd049" /></g>

        {mouths.map((d, i) => (
          <path key={i} d={d} stroke={MOUTH_COLORS[i]} strokeWidth={mood === "alert" ? 3 : 3.6} fill={mood === "alert" ? MOUTH_COLORS[i] : "none"} fillOpacity={mood === "alert" ? 0.55 : 0} strokeLinecap="round" />
        ))}

        {eyes.map((e, i) => {
          const { dx, dy } = pupilOffset(e);
          const r = mood === "alert" ? e.r * 1.2 : e.r;
          return (
            <g key={i}>
              <ellipse cx={e.cx} cy={e.cy} rx={r} ry={blink ? 1.5 : r} fill="#fff" />
              {!blink && (
                <>
                  <circle cx={e.cx + dx} cy={e.cy + dy} r={r * 0.52} fill="#151515" />
                  <circle cx={e.cx + dx - r * 0.18} cy={e.cy + dy - r * 0.18} r={Math.max(1.2, r * 0.12)} fill="#fff" opacity="0.9" />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

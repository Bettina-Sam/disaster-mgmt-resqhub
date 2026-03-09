import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Minimal Mascot
 * - Eyes follow cursor.
 * - If lookAway === true, pupils point away (opposite the cursor) a bit further.
 * - No blinks, no winks, no extras.
 */
export default function Mascot({ size = 520, lookAway = false, className = "" }) {
  const svgRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // eyes (centers & radii) in SVG coords
  const eyes = useMemo(
    () => [
      { cx: 115, cy: 145, r: 12 }, // purple
      { cx: 210, cy: 155, r: 11 }, // black
      { cx: 305, cy: 170, r: 11 }, // yellow
      { cx: 75,  cy: 195, r: 10 }, // orange
    ],
    []
  );

  // track mouse relative to SVG
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

  // compute pupil offset
  const pupilOffset = (eye) => {
    const MAX = 7.5;
    const dx = mouse.x - eye.cx;
    const dy = mouse.y - eye.cy;
    const len = Math.hypot(dx, dy) || 1;

    // normal: toward cursor; lookAway: push opposite (a tiny bit further)
    const dir = lookAway ? -1.25 : 1.0;
    return { dx: (dx / len) * MAX * dir, dy: (dy / len) * MAX * dir };
  };

  return (
    <div className={className} style={{ width: size, maxWidth: "min(95vw, 680px)" }} aria-hidden>
      <svg ref={svgRef} viewBox="0 0 380 260" width="100%" height="100%" role="img">
        {/* simple shapes */}
        <path d="M30,220 Q95,130 170,200 T330,220 Z" fill="#ff7a45" />
        <rect x="80"  y="40" width="110" height="120" rx="18" fill="#6f4cff" />
        <rect x="185" y="70" width="60"  height="130" rx="14" fill="#0d0f14" />
        <rect x="270" y="95" width="70"  height="120" rx="22" fill="#ffd049" />

        {/* tiny mouths */}
        <path d="M62,202 q12,10 24,0" stroke="#3b1d13" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M118,118 q10,6 20,0"  stroke="#1e142a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M205,152 q10,6 20,0"  stroke="#c9c9c9" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M296,168 q8,5 16,0"    stroke="#3a2800" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* eyes */}
        {eyes.map((e, i) => {
          const { dx, dy } = pupilOffset(e);
          const r = e.r;
          return (
            <g key={i}>
              <circle cx={e.cx} cy={e.cy} r={r} fill="#fff" />
              <circle cx={e.cx + dx} cy={e.cy + dy} r={r * 0.52} fill="#151515" />
              <circle cx={e.cx + dx - r * 0.18} cy={e.cy + dy - r * 0.18} r={Math.max(1.2, r * 0.12)} fill="#fff" opacity="0.9" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

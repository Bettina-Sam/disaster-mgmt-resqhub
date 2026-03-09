import React, { useMemo } from "react";

export default function ScoreRing({ label, value=0, big=false }) {
  const v = Math.max(0, Math.min(100, value));
  const R = big ? 46 : 34;
  const C = 2 * Math.PI * R;
  const dash = useMemo(() => `${(v/100)*C} ${C}`, [v, C]);
  return (
    <div className={`qa-ring ${big?"big":""}`}>
      <svg width={R*2+8} height={R*2+8}>
        <circle cx={R+4} cy={R+4} r={R} className="bg" />
        <circle cx={R+4} cy={R+4} r={R} className="fg" style={{ strokeDasharray: dash }} />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">{v}</text>
      </svg>
      <div className="qa-ring-label">{label}</div>
    </div>
  );
}

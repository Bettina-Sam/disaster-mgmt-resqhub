import React from "react";
export default function RiskMeter({ value=0 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="qa-meter" title={`Risk: ${Math.round(pct)}%`}>
      <div className="qa-meter-fill" style={{ width: `${pct}%` }} />
      <span className="qa-meter-cap">⚠ {Math.round(pct)}%</span>
    </div>
  );
}

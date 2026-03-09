import React from "react";

export default function StepChips({ phases, active }) {
  return (
    <div className="qa-steps">
      {phases.map(p => (
        <span key={p} className={`qa-stepchip ${active===p?"active":""}`}>{p}</span>
      ))}
    </div>
  );
}

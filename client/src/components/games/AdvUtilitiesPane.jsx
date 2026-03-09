import React, { useState } from "react";

export default function AdvUtilitiesPane({ correctOrder, onDone }) {
  const options = [
    { id: "electric", label: "Electric", icon: "⚡" },
    { id: "gas",      label: "Gas",      icon: "🔥" },
    { id: "water",    label: "Water",    icon: "💧" },
  ];

  const [picked, setPicked] = useState([]);
  const [msg, setMsg] = useState("Pick the safe order: tap 3 buttons.");

  function pick(id) {
    if (picked.includes(id) || picked.length >= 3) return;
    const next = [...picked, id];
    setPicked(next);
    if (next.length === 3) {
      const ok = JSON.stringify(next) === JSON.stringify(correctOrder);
      setMsg(ok ? "Correct order!" : "That order raised the risk.");
      setTimeout(() => onDone(next), 500);
    }
  }

  function reset() {
    setPicked([]);
    setMsg("Pick the safe order: tap 3 buttons.");
  }

  return (
    <div className="qa-card qa-center-pane">
      <div className="qa-title2">Utilities Panel</div>
      <div className="qa-sub">Turn things OFF in the safe order.</div>
      <div className="qa-grid-3">
        {options.map(o => (
          <button
            key={o.id}
            className={`qa-bigbtn ${picked.includes(o.id) ? "picked":""}`}
            onClick={() => pick(o.id)}
          >
            <div className="qa-big-emo">{o.icon}</div>
            <div>{o.label}</div>
            {picked.includes(o.id) && <div className="qa-step">#{picked.indexOf(o.id)+1}</div>}
          </button>
        ))}
      </div>
      <div className="qa-note">{msg}</div>
      <div className="qa-row">
        <button className="qa-btn soft" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

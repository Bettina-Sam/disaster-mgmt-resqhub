// src/components/VisitorCounter.jsx
import React, { useEffect, useState } from "react";
import { incrementVisitorCount } from "../services/mockService";

export default function VisitorCounter() {
  const [count, setCount] = useState(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const total = incrementVisitorCount();
    setCount(total);
  }, []);

  // Animate count-up
  useEffect(() => {
    if (count === null) return;
    const start = Math.max(0, count - 30);
    let current = start;
    const step = () => {
      current = Math.min(current + Math.ceil((count - current) / 6), count);
      setDisplay(current);
      if (current < count) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [count]);

  if (count === null) return null;

  return (
    <div 
      className="rsq-visitor-counter d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm bg-glass border border-secondary"
      style={{
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <span className="rsq-visitor-dot shadow-sm" style={{ boxShadow: "0 0 8px currentColor" }} />
      <span className="rsq-visitor-label d-flex align-items-center gap-1">
        <span className="rsq-visitor-num fw-bold fs-6 text-primary">{display.toLocaleString()}</span>
        <span className="rsq-visitor-text text-secondary small fw-medium"> visitors</span>
      </span>
    </div>
  );
}

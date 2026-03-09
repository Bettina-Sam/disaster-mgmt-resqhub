import React from "react";

export function CoachButton({ onToggle }) {
  return <button className="coach-btn" onClick={onToggle} aria-label="Coach">🧠</button>;
}

export function CoachBubble({ visible, text, onClose }) {
  if (!visible) return null;
  return (
    <div className="coach-bubble">
      <span>{text}</span>
      <button className="coach-x" onClick={onClose}>Got it</button>
    </div>
  );
}

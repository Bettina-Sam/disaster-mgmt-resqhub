import React, { useState } from "react";
import TalkPanel from "./resqvoice/TalkPanel";

export default function GlobalVoiceFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center p-0 rsq-hover-lift"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          zIndex: 9999,
          fontSize: "1.5rem"
        }}
        title="Open Voice Assistant"
        aria-label="Open Voice Assistant"
      >
        🎙️
      </button>

      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", height: "100%" }}>
            <TalkPanel onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

import React from "react";

const COLORS = ["GREEN","YELLOW","RED"];

export default function AdvTaggingPane({ rooms, tags, onTag, onNext }) {
  const allTagged = rooms.every(r => tags[r.id]);

  return (
    <div className="qa-card qa-center-pane">
      <div className="qa-title2">Tag Rooms (Rapid Assessment)</div>
      <div className="qa-sub">Tap a room, then pick a color using the clues.</div>

      <div className="qa-rooms">
        {rooms.map(r => (
          <div key={r.id} className="qa-room">
            <div className="qa-room-top">
              <div className="qa-room-name">{r.label}</div>
              <div className="qa-hints">
                {r.hints.includes("chem_spill")   && <span title="Chemical Spill">🧪</span>}
                {r.hints.includes("crack_pillar") && <span title="Cracked Pillar">🧱</span>}
                {r.hints.includes("ok")           && <span title="Looks OK">✅</span>}
              </div>
            </div>
            <div className="qa-tags">
              {COLORS.map(c => (
                <button
                  key={c}
                  className={`qa-badge ${c.toLowerCase()} ${tags[r.id]===c?"sel":""}`}
                  onClick={() => onTag(r.id, c)}
                >
                  {c==="GREEN" && "🟢 GREEN"}
                  {c==="YELLOW"&& "🟡 YELLOW"}
                  {c==="RED"   && "🔴 RED"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="qa-row">
        <button className="qa-btn cta" onClick={onNext} disabled={!allTagged}>Continue</button>
      </div>
    </div>
  );
}

import React from "react";

export default function AdvFlowPane({ groups, assemblies, corridors, placements, onPlace, onNext }) {
  return (
    <div className="qa-card qa-center-pane">
      <div className="qa-title2">People Flow</div>
      <div className="qa-sub">Place groups at safe destinations. Avoid moving through risky corridors if risk is high.</div>

      <div className="qa-flex">
        <div className="qa-col">
          <div className="qa-label">Groups</div>
          {groups.map(g => (
            <div key={g.id} className="qa-chip">{g.label} • {g.size}</div>
          ))}
        </div>

        <div className="qa-col">
          <div className="qa-label">Corridors</div>
          {corridors.map(c => (
            <div key={c.id} className={`qa-chip ${c.status.toLowerCase()}`}>{c.label}: {c.status}</div>
          ))}
        </div>

        <div className="qa-col">
          <div className="qa-label">Destinations</div>
          {assemblies.map(a => (
            <div key={a.id} className="qa-dropzone">{a.name}</div>
          ))}
        </div>
      </div>

      <div className="qa-placements">
        {groups.map(g => (
          <div key={g.id} className="qa-place-row">
            <div className="qa-place-name">{g.label}</div>
            <div className="qa-place-actions">
              {assemblies.map(a => (
                <button
                  key={a.id}
                  className={`qa-btn ${placements[g.id]===a.id?"on":""}`}
                  onClick={() => onPlace(g.id, a.id)}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="qa-row">
        <button className="qa-btn cta" onClick={onNext}>Trigger Event</button>
      </div>
    </div>
  );
}

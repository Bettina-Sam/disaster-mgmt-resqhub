import React from "react";

export default function PlaybackBar({
  enabled, setEnabled,
  value, setValue,          // minutes from window start (0..1440)
  playing, setPlaying,
}) {
  const windowMinutes = 1440; // 24h
  const now = Date.now();
  const windowStart = now - windowMinutes * 60 * 1000;
  const cutoff = windowStart + value * 60 * 1000;

  const fmt = (ts) =>
    new Date(ts).toLocaleString(undefined, {
      hour: "2-digit", minute: "2-digit",
      day: "2-digit", month: "short"
    });

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="pbSwitch"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="pbSwitch">
          Playback (last 24h)
        </label>
      </div>

      <div className="d-flex align-items-center gap-2" style={{ minWidth: 280 }}>
        <button
          type="button"
          className={`btn btn-sm btn-${playing ? "outline-danger" : "outline-primary"}`}
          onClick={() => setPlaying((p) => !p)}
          disabled={!enabled}
        >
          {playing ? "Pause" : "Play"}
        </button>

        <input
          type="range"
          className="form-range"
          min={0}
          max={windowMinutes}
          step={5}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          disabled={!enabled}
          style={{ width: 220 }}
        />

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setValue(0)}
          disabled={!enabled}
        >
          Reset
        </button>
      </div>

      <div className="small text-muted">
        {enabled ? (
          <>
            {fmt(windowStart)} → <b>{fmt(cutoff)}</b>
          </>
        ) : (
          <>Playback off</>
        )}
      </div>
    </div>
  );
}

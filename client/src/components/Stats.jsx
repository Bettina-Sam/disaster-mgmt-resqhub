import React, { useMemo, useEffect, useRef, useState } from "react";
import { cueOpen, cueCritical } from "../utils/sound";

export default function Stats({ items }) {
  // compute counts
  const counts = useMemo(() => {
    const s = { total: items.length, open: 0, ack: 0, resolved: 0, critical: 0 };
    for (const e of items) {
      if (e.status === "OPEN") s.open++;
      if (e.status === "ACK") s.ack++;
      if (e.status === "RESOLVED") s.resolved++;
      if (e.severity === "CRITICAL") s.critical++;
    }
    return s;
  }, [items]);

  // previous counts to detect increases
  const prev = useRef(counts);
  useEffect(() => {
    // Play cues only when numbers go UP (not down)
    if (counts.open > prev.current.open) {
      cueOpen();
    }
    if (counts.critical > prev.current.critical) {
      cueCritical();
      // optional: dispatch a visual pulse for your BackgroundFX if you wired it
      try { window.dispatchEvent(new Event("rsq:critical")); } catch {}
    }
    prev.current = counts;
  }, [counts]);

  // bump effect on any change (forces re-anim via key)
  const [bumpKey, setBumpKey] = useState(0);
  useEffect(() => setBumpKey((k) => k + 1), [counts]);

  // Emoji + animation classes, bigger pill/emoji handled by CSS
  const KPIS = [
    { key: "total",    label: "Total",        value: counts.total,    tone: "primary", icon: "📊", anim: "hz-float"   },
    { key: "open",     label: "Open",         value: counts.open,     tone: "warning", icon: "🚨", anim: "hz-pulse"   },
    { key: "ack",      label: "Acknowledged", value: counts.ack,      tone: "info",    icon: "👀", anim: "hz-blink"   },
    { key: "resolved", label: "Resolved",     value: counts.resolved, tone: "success", icon: "🛠️", anim: "hz-bob"     },
    { key: "critical", label: "Critical",     value: counts.critical, tone: "danger",  icon: "🔥", anim: "hz-flicker" },
  ];

  return (
    <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-5 mb-3">
      {KPIS.map((k) => (
        <div className="col" key={k.label}>
          <div className="card rsq-kpi border-0 h-100 shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="small text-muted">{k.label}</div>
                <div className={`display-6 m-0 bump-anim-${k.key}-${bumpKey}`}>
                  {k.value}
                </div>
              </div>
              <div className={`rsq-kpi-pill text-bg-${k.tone}`}>
                <span className={`rsq-emoji ${k.anim}`} aria-hidden>
                  {k.icon}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

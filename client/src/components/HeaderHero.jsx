import React, { useMemo } from "react";
import HazardIcon from "./HazardIcon";

export default function HeaderHero({ items }) {
  const stats = useMemo(() => {
    const out = { total: items.length, open:0, ack:0, resolved:0, critical:0 };
    for (const e of items) {
      if (e.status === "OPEN") out.open++;
      else if (e.status === "ACK") out.ack++;
      else if (e.status === "RESOLVED") out.resolved++;
      if (e.severity === "CRITICAL") out.critical++;
    }
    return out;
  }, [items]);

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center gap-2">
        <div className="display-6 m-0">ResQHub</div>
        <div className="fs-6 text-muted">See. Assign. Resolve.</div>
      </div>
      <div className="text-muted mt-1">
        Operational: <b>{stats.open}</b> open • <b>{stats.critical}</b> critical
        <span className="ms-2"><HazardIcon type={stats.critical ? "FIRE" : "OTHER"} /></span>
      </div>
    </div>
  );
}

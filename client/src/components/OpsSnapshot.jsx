import React, { useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";

/** Small, data-only “ops” card: avg ACK/RESOLVE + 24h sparkline */
export default function OpsSnapshot({ items }) {
  const { t } = useLanguage();
  const now = Date.now();
  const last24 = items.filter(e => now - new Date(e.createdAt).getTime() <= 24*60*60*1000);

  // crude averages (uses updatedAt as event time for current status)
  const avg = (arr) => {
    if (!arr.length) return "-";
    const m = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
    return m >= 60 ? `${Math.round(m/60)}h` : `${m}m`;
  };

  const { ackMin, resMin, byHour } = useMemo(() => {
    const ack = items
      .filter(e => e.status === "ACK")
      .map(e => (new Date(e.updatedAt) - new Date(e.createdAt)) / 60000);
    const res = items
      .filter(e => e.status === "RESOLVED")
      .map(e => (new Date(e.updatedAt) - new Date(e.createdAt)) / 60000);

    // 24 buckets (local hour)
    const buckets = new Array(24).fill(0);
    last24.forEach(e => {
      const h = new Date(e.createdAt).getHours();
      buckets[h] += 1;
    });
    return { ackMin: avg(ack), resMin: avg(res), byHour: buckets };
  }, [items]); // eslint-disable-line

  // simple sparkline
  const max = Math.max(1, ...byHour);
  const points = byHour.map((v,i)=>`${(i/23)*100},${100 - (v/max)*100}`).join(" ");

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="mb-3">{t("ops_snapshot")}</h6>
        <div className="d-flex gap-3 flex-wrap">
          <div className="flex-grow-1">
            <div className="small text-muted">Avg time to ACK</div>
            <div className="fs-4">{ackMin}</div>
          </div>
          <div className="flex-grow-1">
            <div className="small text-muted">Avg time to resolve</div>
            <div className="fs-4">{resMin}</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="small text-muted mb-1">Incidents by hour (last 24h)</div>
          <svg viewBox="0 0 100 40" width="100%" height="40">
            <polyline
              fill="none"
              stroke="var(--rsq-primary)"
              strokeWidth="1.8"
              points={points}
              transform="translate(0,5) scale(1,0.7)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const TYPES = ["FLOOD", "FIRE", "EARTHQUAKE", "ACCIDENT", "CYCLONE", "OTHER"];
const COLORS = {
  FLOOD: "#3b82f6", FIRE: "#ef4444", EARTHQUAKE: "#f59e0b",
  ACCIDENT: "#6366f1", CYCLONE: "#38bdf8", OTHER: "#22c55e",
};

export default function InsightsPanel({ items, setFilter }) {
  const { t } = useLanguage();
  const [hover, setHover] = useState(null);

  const stats = useMemo(() => {
    const map = Object.fromEntries(TYPES.map(t=>[t,0]));
    for (const it of items) if (map[it.type] != null) map[it.type]++;
    const total = items.length || 1;
    return { map, total };
  }, [items]);

  const bars = TYPES.map(t=>({
    type:t, count:stats.map[t], pct:Math.round((stats.map[t]/stats.total)*100)
  })).sort((a,b)=>b.count-a.count);

  const focus = (t)=> setFilter(f=>({...f, type: f.type===t ? "ALL" : t }));

  return (
    <div className="vstack gap-3">
     

      <div className="card">
        <div className="card-body">
          <h6 className="mb-3">{t("insights_dist")}</h6>
          <div className="vstack gap-2">
            {bars.map(b=>(
              <div key={b.type} className="rsq-bar"
                   title={`${b.type}: ${b.count} (${b.pct}%)`}
                   onMouseEnter={()=>setHover(b.type)} onMouseLeave={()=>setHover(null)}
                   onClick={()=>focus(b.type)}>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="fw-semibold" style={{color:COLORS[b.type]}}>
                    {b.type} {hover===b.type ? t("insights_click_filter") : ""}
                  </span>
                  <span>{b.count}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar"
                       style={{width:`${b.pct}%`, backgroundColor:COLORS[b.type], transition:"width .35s ease"}}/>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 d-flex gap-2 flex-wrap">
            {TYPES.map(type=>(
              <button key={type}
                className="btn btn-sm btn-outline-secondary"
                onClick={()=>focus(type)}
                style={{borderColor:COLORS[type], color:COLORS[type]}}>
                {t("insights_toggle")} {type}
              </button>
            ))}
            <button className="btn btn-sm btn-outline-primary" onClick={()=>setFilter(f=>({...f, type:"ALL"}))}>
              {t("insights_clear")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

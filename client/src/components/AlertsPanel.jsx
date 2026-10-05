import React, { useMemo } from "react";
import { pointOf, inIndia } from "../services/liveService";
import { useLanguage } from "../contexts/LanguageContext";

const SEV_COLOR = { CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#6366f1", LOW: "#10b981" };
const TYPE_ICON = { CYCLONE: "🌀", FLOOD: "🌊", FIRE: "🔥", EARTHQUAKE: "🌍", ACCIDENT: "🚗", OTHER: "⚡" };
const RANK = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };

export function timeAgo(isoStr) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000));
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// The most serious current events, taken from the live feeds (not hand-written alerts).
export default function AlertsPanel({ items = [], region = "IN", onOpen }) {
  const { t } = useLanguage();
  const top = useMemo(
    () =>
      items
        .filter((i) => i.status === "OPEN" && i.source !== "COMMUNITY")
        .filter((i) => region === "WORLD" || inIndia(pointOf(i)))
        .sort((a, b) => RANK[b.severity] - RANK[a.severity] || new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [items, region]
  );

  return (
    <div className="card glass">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0 fw-bold">{t("live_alerts")}</h6>
          <span className="badge rsq-live-badge"><span className="rsq-live-dot" /> LIVE</span>
        </div>
        <div className="vstack gap-2" style={{ maxHeight: 320, overflowY: "auto" }}>
          {top.length === 0 && <div className="text-muted small">{t("no_alerts")}</div>}
          {top.map((a) => (
            <button key={a._id} type="button" className="rsq-alert-item text-start border-0" style={{ borderLeftColor: SEV_COLOR[a.severity] }} onClick={() => onOpen?.(a)}>
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div className="d-flex align-items-start gap-2">
                  <span style={{ fontSize: 16 }}>{TYPE_ICON[a.type] || "⚡"}</span>
                  <div>
                    <div className="fw-semibold small">{a.title}</div>
                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>{a.source}</div>
                  </div>
                </div>
                <div className="text-end flex-shrink-0">
                  <span className="badge" style={{ background: SEV_COLOR[a.severity], color: "#fff", fontSize: "0.65rem" }}>{a.severity}</span>
                  <div className="text-muted" style={{ fontSize: "0.68rem", marginTop: 2 }}>{timeAgo(a.createdAt)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

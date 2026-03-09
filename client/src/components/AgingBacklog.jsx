import React, { useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";

function diffHours(from, to = Date.now()) {
  return Math.max(0, (to - new Date(from).getTime()) / (1000 * 60 * 60));
}

export default function AgingBacklog({ items, onOpen }) {
  const { t } = useLanguage();
  // Only OPEN incidents
  const open = useMemo(() => items.filter(i => i.status === "OPEN"), [items]);

  // Buckets (you can tune these)
  const buckets = useMemo(() => {
    const b = { "<1h": 0, "1–6h": 0, "6–24h": 0, ">24h": 0 };
    for (const it of open) {
      const h = diffHours(it.createdAt);
      if (h < 1) b["<1h"]++;
      else if (h < 6) b["1–6h"]++;
      else if (h < 24) b["6–24h"]++;
      else b[">24h"]++;
    }
    return b;
  }, [open]);

  // Oldest 3 OPEN incidents
  const oldest = useMemo(() => {
    return [...open]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(0, 3)
      .map((i) => ({
        ...i,
        ageH: Math.floor(diffHours(i.createdAt)),
        ageM: Math.floor((diffHours(i.createdAt) % 1) * 60),
      }));
  }, [open]);

  const totalOpen = open.length || 1; // avoid /0
  const pct = (n) => Math.round((n / totalOpen) * 100);

  return (
    <div className="card glass">
      <div className="card-body">
        <h6 className="mb-3">{t("aging_bl_title")}</h6>

        <div className="vstack gap-2 mb-3">
          {[
            { label: t("aging_bl_1h"), key: "<1h" },
            { label: t("aging_bl_6h"), key: "1–6h" },
            { label: t("aging_bl_24h"), key: "6–24h" },
            { label: t("aging_bl_24h_plus"), key: ">24h" },
          ].map(({ label, key }) => (
            <div key={key}>
              <div className="d-flex justify-content-between small mb-1">
                <span>{label}</span>
                <span>{buckets[key]} • {pct(buckets[key])}%</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar bg-warning"
                  role="progressbar"
                  style={{ width: `${pct(buckets[key])}%` }}
                  aria-valuenow={pct(buckets[key])}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="small text-muted mb-2">{t("aging_bl_oldest")}</div>
        <div className="vstack gap-2">
          {oldest.length ? (
            oldest.map((i) => (
              <div
                key={i._id}
                className="d-flex justify-content-between align-items-center p-2 rounded border"
                style={{ borderColor: "rgba(255,255,255,.1)" }}
              >
                <div className="me-2">
                  <div className="fw-semibold text-truncate" title={i.title}>
                    {i.title}
                  </div>
                  <div className="small text-muted">
                    {i.type} • {i.severity} • {i.ageH}h {i.ageM}m
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onOpen?.(i)}
                >
                  {t("aging_bl_view")}
                </button>
              </div>
            ))
          ) : (
            <div className="text-muted small">{t("aging_bl_none")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

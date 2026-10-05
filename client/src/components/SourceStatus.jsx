import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

function ago(ts) {
  if (!ts) return "never";
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} h ago`;
}

// Shows where the data comes from, whether each feed answered, and how fresh it is.
export default function SourceStatus({ meta, loading, onRefresh }) {
  const { t } = useLanguage();
  return (
    <div className="rsq-source-status d-flex align-items-center flex-wrap gap-2 small mb-3" role="status" aria-live="polite">
      <span className="text-muted">{t("data_from")}</span>
      {meta.sources.length === 0 && <span className="text-muted">…</span>}
      {meta.sources.map((s) => (
        <span key={s.name} className={`badge ${s.ok ? "text-bg-success" : "text-bg-danger"}`} title={s.ok ? `${s.count} events` : s.error}>
          {s.ok ? "●" : "○"} {s.name}{s.ok ? ` (${s.count})` : ""}
        </span>
      ))}
      <span className="text-muted">
        · {t("updated")} {ago(meta.updatedAt)}
        {meta.stale && <strong className="text-warning"> · {t("offline_cached")}</strong>}
      </span>
      <button className="btn btn-sm btn-outline-secondary py-0" onClick={onRefresh} disabled={loading}>
        {loading ? t("loading") : `↻ ${t("refresh")}`}
      </button>
      <span className="text-muted ms-auto">{t("not_official")}</span>
    </div>
  );
}

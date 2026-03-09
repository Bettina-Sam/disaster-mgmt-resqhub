// QuickFilters.jsx
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function QuickFilters({ filter, setFilter }) {
  const { t } = useLanguage();
  const chips = [
    { label: t("filter_critical"), set: f => ({ ...f, severity: "CRITICAL" }) },
    { label: t("filter_open"), set: f => ({ ...f, status: "OPEN" }) },
    { label: t("filter_floods"), set: f => ({ ...f, type: "FLOOD" }) },
    { label: t("filter_reset"), set: _ => ({ q:"", type:"ALL", severity:"ALL", status:"ALL" }) },
  ];

  return (
    <div className="card glass">
      <div className="card-body">
        <h6 className="mb-2">{t("quick_filters")}</h6>
        <div className="d-flex flex-wrap gap-2">
          {chips.map(c => (
            <button
              key={c.label}
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setFilter(prev => c.set(prev))}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

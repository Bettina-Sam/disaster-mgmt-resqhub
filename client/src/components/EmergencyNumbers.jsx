import React, { useState } from "react";
import { EMERGENCY_NUMBERS } from "../data/emergencyNumbers";
import { useLanguage } from "../contexts/LanguageContext";

const KEY = "rsq:country";

export default function EmergencyNumbers() {
  const { t } = useLanguage();
  const [code, setCode] = useState(() => {
    try { return localStorage.getItem(KEY) || "IN"; } catch { return "IN"; }
  });
  const c = EMERGENCY_NUMBERS[code] || EMERGENCY_NUMBERS.IN;

  const change = (e) => {
    setCode(e.target.value);
    try { localStorage.setItem(KEY, e.target.value); } catch { /* ignore */ }
  };

  return (
    <div className="card glass rsq-numbers">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <h6 className="mb-0 fw-bold">☎️ {t("emergency_numbers")}</h6>
          <select className="form-select form-select-sm w-auto" value={code} onChange={change} aria-label="Country">
            {Object.entries(EMERGENCY_NUMBERS).map(([k, v]) => (
              <option key={k} value={k}>{v.flag} {v.name}</option>
            ))}
          </select>
        </div>
        <div className="vstack gap-1">
          {c.numbers.map((n) => (
            <a key={n.tel + n.label} href={`tel:${n.tel}`} className="rsq-number-row d-flex justify-content-between align-items-center text-decoration-none">
              <span className="small">{n.label}</span>
              <span className="badge text-bg-danger fs-6">{n.tel}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// src/components/ShelterPanel.jsx
import React, { useEffect, useState } from "react";
import { getShelters } from "../services/mockService";
import { useLanguage } from "../contexts/LanguageContext";

const STATUS_COLOR = { ACTIVE: "#10b981", STANDBY: "#f59e0b" };

export default function ShelterPanel() {
  const { t } = useLanguage();
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    getShelters().then(setShelters);
  }, []);

  return (
    <div className="card glass">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0 fw-bold">🏕️ {t("shelter_status")}</h6>
          <span className="badge text-bg-info">{shelters.filter(s => s.status === "ACTIVE").length} Active</span>
        </div>

        <div className="vstack gap-2" style={{ maxHeight: 260, overflowY: "auto" }}>
          {shelters.map((s) => {
            const pct = Math.round((s.occupied / s.capacity) * 100);
            const barColor = pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#10b981";
            return (
              <div key={s.id} className="rsq-shelter-item">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <div className="fw-semibold small">{s.name}</div>
                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>{s.type}</div>
                  </div>
                  <span className="badge" style={{ background: STATUS_COLOR[s.status] || "#9ca3af", color: "#fff", fontSize: "0.62rem" }}>
                    {s.status}
                  </span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">{s.occupied}/{s.capacity} Capacity</span>
                  <span className="fw-semibold" style={{ color: barColor }}>{pct}%</span>
                </div>
                <div className="progress" style={{ height: 5, borderRadius: 99 }}>
                  <div className="progress-bar" style={{ width: `${pct}%`, background: barColor, transition: "width 0.4s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

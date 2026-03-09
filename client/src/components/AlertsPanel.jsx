// src/components/AlertsPanel.jsx
import React, { useEffect, useState } from "react";
import { getAlerts } from "../services/mockService";
import { useLanguage } from "../contexts/LanguageContext";

const SEV_COLOR = { CRITICAL: "#ef4444", HIGH: "#f59e0b", MEDIUM: "#6366f1", LOW: "#10b981" };
const TYPE_ICON = { CYCLONE: "🌀", FLOOD: "🌊", FIRE: "🔥", EARTHQUAKE: "🌍", ACCIDENT: "🚗", OTHER: "⚡" };

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AlertsPanel() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getAlerts().then(setAlerts);
  }, []);

  return (
    <div className="card glass">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0 fw-bold">{t("live_alerts")}</h6>
          <span className="badge rsq-live-badge">
            <span className="rsq-live-dot" />
            LIVE
          </span>
        </div>

        <div className="vstack gap-2" style={{ maxHeight: 280, overflowY: "auto" }}>
          {alerts.map((a) => (
            <div key={a.id} className="rsq-alert-item" style={{ borderLeftColor: SEV_COLOR[a.severity] || "#6366f1" }}>
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: 16 }}>{TYPE_ICON[a.type] || "⚡"}</span>
                  <div>
                    <div className="fw-semibold small">{a.title}</div>
                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>{a.issuedBy}</div>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge" style={{ background: SEV_COLOR[a.severity], color: "#fff", fontSize: "0.65rem" }}>{a.severity}</span>
                  <div className="text-muted" style={{ fontSize: "0.68rem", marginTop: 2 }}>{timeAgo(a.issuedAt)}</div>
                </div>
              </div>
              <div className="text-muted small mt-1" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>{a.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

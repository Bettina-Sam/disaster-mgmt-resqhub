import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const sevClass = (s) =>
  ({ LOW: "badge-sev-low", MEDIUM: "badge-sev-medium", HIGH: "badge-sev-high", CRITICAL: "badge-sev-critical" }[s] || "badge-sev-low");

const TYPE_ICON = { FLOOD: "🌊", FIRE: "🔥", EARTHQUAKE: "🌍", ACCIDENT: "🚗", CYCLONE: "🌀", OTHER: "⚡" };

export default function EmergencyList({ items, onOpen, onStatusChange, onDelete }) {
  const { t } = useLanguage();

  const del = (row) => {
    if (window.confirm(`Delete "${row.title}"?`)) onDelete(row._id);
  };

  return (
    <div className="card glass">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <div>
            <h5 className="mb-0 fw-bold">{t("list_title")}</h5>
            <div className="text-muted small">{items.length} {t("list_records")}</div>
          </div>
        </div>
        <div className="text-muted small mb-3">{t("triage_note")}</div>

        {items.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div>{t("no_match")}</div>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: 520, overflowY: "auto" }}>
            <table className="table table-sm align-middle rsq-table">
              <thead>
                <tr>
                  <th>{t("col_incident")}</th>
                  <th>{t("col_type")}</th>
                  <th>{t("col_severity")}</th>
                  <th>{t("col_status")}</th>
                  <th>{t("col_when")}</th>
                  <th>{t("col_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row._id} className="rsq-table-row">
                    <td>
                      <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{row.title}</div>
                      <div className="small text-muted">
                        {row.source}{row.verified ? "" : ` · ${t("unverified")}`}
                      </div>
                    </td>
                    <td><span>{TYPE_ICON[row.type] || "⚡"} {row.type}</span></td>
                    <td><span className={`badge ${sevClass(row.severity)}`}>{row.severity}</span></td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ minWidth: 110 }}
                        value={row.status}
                        onChange={(ev) => onStatusChange(row._id, ev.target.value)}
                        aria-label="Status"
                      >
                        <option value="OPEN">{t("status_open")}</option>
                        <option value="ACK">{t("status_ack")}</option>
                        <option value="RESOLVED">{t("status_resolved")}</option>
                      </select>
                    </td>
                    <td>
                      <span className="small text-muted">
                        {new Date(row.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => onOpen(row)}>{t("btn_view")}</button>
                        {row.source === "COMMUNITY" && (
                          <button className="btn btn-outline-danger btn-sm" onClick={() => del(row)} aria-label="Delete report">✕</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

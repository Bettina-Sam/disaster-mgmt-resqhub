// src/components/EmergencyList.jsx — SHOWCASE MODE (no backend)
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { updateIncident, deleteIncident } from "../services/mockService";
import { useLanguage } from "../contexts/LanguageContext";

const sevClass = (s) =>
  ({ LOW: "badge-sev-low", MEDIUM: "badge-sev-medium", HIGH: "badge-sev-high", CRITICAL: "badge-sev-critical" }[s] || "badge-sev-low");

const TYPE_ICON = { FLOOD: "🌊", FIRE: "🔥", EARTHQUAKE: "🌍", ACCIDENT: "🚗", CYCLONE: "🌀", OTHER: "⚡" };

export default function EmergencyList({ items, setItems, onOpen }) {
  const { t } = useLanguage();
  // eslint-disable-next-line no-unused-vars
  const { hasRole } = useAuth();

  const updateStatus = async (id, status) => {
    try {
      const updated = await updateIncident(id, { status });
      setItems((prev) => prev.map((x) => (x._id === id ? updated : x)));
    } catch {
      toast.error("Update failed");
    }
  };

  const del = async (row) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    try {
      await deleteIncident(row._id);
      setItems((prev) => prev.filter((x) => x._id !== row._id));
      toast.success("Incident removed ✔");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="card glass">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="mb-0 fw-bold">{t("list_title")}</h5>
            <div className="text-muted small">{items.length} {t("list_records")}</div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div>No incidents match your filters</div>
          </div>
        ) : (
          <div className="table-responsive">
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
                      {row.address && <div className="small text-muted">{row.address}</div>}
                    </td>
                    <td>
                      <span>{TYPE_ICON[row.type] || "⚡"} {row.type}</span>
                    </td>
                    <td>
                      <span className={`badge ${sevClass(row.severity)}`}>{row.severity}</span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ minWidth: 110 }}
                        value={row.status}
                        onChange={(ev) => updateStatus(row._id, ev.target.value)}
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
                        <button className="btn btn-outline-danger btn-sm" onClick={() => del(row)}>✕</button>
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

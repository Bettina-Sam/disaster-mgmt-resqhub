import React, { useEffect, useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const sevClass = (s) =>
  ({ LOW: "badge-sev-low", MEDIUM: "badge-sev-medium", HIGH: "badge-sev-high", CRITICAL: "badge-sev-critical" }[s] || "badge-sev-low");

export default function IncidentModal({ item, onClose, onStatusChange, onDelete, canEdit, canDelete }) {
  const { t } = useLanguage();

  const coords = useMemo(() => {
    const lat = item?.location?.lat;
    const lng = item?.location?.lng;
    return (lat || lat === 0) && (lng || lng === 0) ? [lat, lng] : null;
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  const del = () => {
    if (window.confirm("Delete this report?")) onDelete?.(item._id);
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={onClose} />
      <div className="card" role="dialog" aria-modal="true" aria-label={item.title}
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(720px,95vw)", maxHeight: "90vh", overflowY: "auto", zIndex: 1060 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <h5 className="mb-2">{item.title}</h5>
            <div className="d-flex gap-2 align-items-center flex-shrink-0">
              <span className="badge text-bg-secondary">{item.type}</span>
              <span className={`badge ${sevClass(item.severity)}`}>{item.severity}</span>
            </div>
          </div>

          {!item.verified && <div className="alert alert-warning py-1 small">{t("unverified_note")}</div>}

          <div className="row g-3">
            <div className="col-md-7">
              <div className="mb-2">{item.description || "—"}</div>
              {item.address && <div className="mb-2"><b>{t("form_address")}:</b> {item.address}</div>}
              {item.phone && <div className="mb-2"><b>{t("form_phone")}:</b> <a href={`tel:${item.phone}`}>{item.phone}</a></div>}
              <div className="mb-2"><b>{t("source")}:</b> {item.source}{item.reportedBy && item.source === "COMMUNITY" ? ` (${item.reportedBy})` : ""}</div>
              <div className="mb-2 small text-muted">
                {t("created")}: {new Date(item.createdAt).toLocaleString()}<br />
                {t("updated")}: {new Date(item.updatedAt).toLocaleString()}
              </div>
              {item.sourceUrl && (
                <a className="btn btn-sm btn-outline-secondary" href={item.sourceUrl} target="_blank" rel="noreferrer">{t("source_page")} ↗</a>
              )}
            </div>
            <div className="col-md-5">
              {canEdit && (
                <div className="mb-2">
                  <b>{t("col_status")}:</b>{" "}
                  <select className="form-select form-select-sm d-inline-block w-auto" value={item.status} onChange={(e) => onStatusChange?.(item._id, e.target.value)}>
                    <option value="OPEN">{t("status_open")}</option>
                    <option value="ACK">{t("status_ack")}</option>
                    <option value="RESOLVED">{t("status_resolved")}</option>
                  </select>
                </div>
              )}
              <div className="mb-2"><b>{t("location")}:</b> {coords ? `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}` : "—"}</div>
              {coords && (
                <a className="btn btn-sm btn-outline-primary" href={`https://www.openstreetmap.org/?mlat=${coords[0]}&mlon=${coords[1]}#map=9/${coords[0]}/${coords[1]}`} target="_blank" rel="noreferrer">
                  {t("open_map")} ↗
                </a>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-outline-secondary" onClick={onClose}>{t("close")}</button>
            {canDelete && <button className="btn btn-outline-danger" onClick={del}>{t("delete")}</button>}
          </div>
        </div>
      </div>
    </>
  );
}

import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const TYPES = ["ALL", "FLOOD", "FIRE", "EARTHQUAKE", "ACCIDENT", "CYCLONE", "OTHER"];
const SEVERITY = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS = ["ALL", "OPEN", "ACK", "RESOLVED"];

export default function Filters({ filter, setFilter, me, onLocate }) {
  const { t } = useLanguage();
  const set = (k) => (e) => setFilter({ ...filter, [k]: e.target.value });
  const reset = () => setFilter({ q: "", type: "ALL", severity: "ALL", status: "ALL", km: "", region: filter.region });

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder={t("search_ph")} value={filter.q || ""} onChange={set("q")} aria-label="Search" />
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filter.type} onChange={set("type")} aria-label="Type">
              {TYPES.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filter.severity} onChange={set("severity")} aria-label="Severity">
              {SEVERITY.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filter.status} onChange={set("status")} aria-label="Status">
              {STATUS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder={t("within_km")}
              value={filter.km || ""}
              onChange={set("km")}
              disabled={!me}
              title={me ? "" : t("km_needs_location")}
              aria-label="Within km"
            />
          </div>
        </div>

        <div className="row g-2 mt-2">
          <div className="col-6 col-md-3">
            <button type="button" className={`btn w-100 ${me ? "btn-success" : "btn-outline-primary"}`} onClick={onLocate}>
              {me ? `✓ ${t("location_on")}` : `📍 ${t("use_location")}`}
            </button>
          </div>
          <div className="col-6 col-md-2">
            <button type="button" className="btn btn-outline-secondary w-100" onClick={reset}>{t("filter_reset")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

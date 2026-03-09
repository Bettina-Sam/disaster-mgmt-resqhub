import React from "react";

const TYPES = ["ALL","FLOOD","FIRE","EARTHQUAKE","ACCIDENT","CYCLONE","OTHER"];
const SEVERITY = ["ALL","LOW","MEDIUM","HIGH","CRITICAL"];
const STATUS = ["ALL","OPEN","ACK","RESOLVED"];

export default function Filters({ filter, setFilter }) {
  const set = (k) => (e) => setFilter({ ...filter, [k]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      localStorage.setItem("me_lat", pos.coords.latitude);
      localStorage.setItem("me_lng", pos.coords.longitude);
    });
  };

  const reset = () =>
    setFilter({ q: "", type: "ALL", severity: "ALL", status: "ALL", km: "" });

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row g-2">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Search title/address…"
              value={filter.q || ""}
              onChange={set("q")}
            />
          </div>

          <div className="col-md-2">
            <select className="form-select" value={filter.type} onChange={set("type")}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="col-md-2">
            <select className="form-select" value={filter.severity} onChange={set("severity")}>
              {SEVERITY.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-md-2">
            <select className="form-select" value={filter.status} onChange={set("status")}>
              {STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder="Within km"
              value={filter.km || ""}
              onChange={set("km")}
            />
          </div>
        </div>

        <div className="row g-2 mt-2">
          <div className="col-md-2">
            <button type="button" className="btn btn-outline-primary w-100" onClick={useMyLocation}>
              Use my location
            </button>
          </div>
          <div className="col-md-2">
            <button type="button" className="btn btn-outline-secondary w-100" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

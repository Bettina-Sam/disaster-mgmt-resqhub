import React, { useEffect, useState } from "react";
import { findNearby, KINDS } from "../services/nearbyService";
import { useLanguage } from "../contexts/LanguageContext";

// Nearest hospitals, police, fire stations and shelters around the user (OpenStreetMap data).
export default function ShelterPanel({ me, onLocate }) {
  const { t } = useLanguage();
  const [places, setPlaces] = useState([]);
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [kind, setKind] = useState("ALL");

  useEffect(() => {
    if (!me) return;
    let alive = true;
    setState("loading");
    findNearby(me)
      .then((r) => { if (alive) { setPlaces(r); setState("done"); } })
      .catch(() => { if (alive) setState("error"); });
    return () => { alive = false; };
  }, [me]);

  const shown = places.filter((p) => kind === "ALL" || p.kind === kind).slice(0, 12);

  return (
    <div className="card glass">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0 fw-bold">🏥 {t("nearby_help")}</h6>
          {!me && <button className="btn btn-sm btn-primary" onClick={onLocate}>📍 {t("find_near_me")}</button>}
        </div>

        {!me && <div className="text-muted small">{t("nearby_hint")}</div>}
        {state === "loading" && <div className="text-muted small">{t("loading")}…</div>}
        {state === "error" && <div className="text-danger small">{t("nearby_error")}</div>}

        {state === "done" && (
          <>
            <div className="d-flex flex-wrap gap-1 mb-2">
              {["ALL", ...Object.keys(KINDS)].map((k) => (
                <button key={k} className={`btn btn-sm py-0 ${kind === k ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setKind(k)}>
                  {k === "ALL" ? t("all") : KINDS[k].icon}
                </button>
              ))}
            </div>
            <div className="vstack gap-2" style={{ maxHeight: 280, overflowY: "auto" }}>
              {shown.length === 0 && <div className="text-muted small">{t("nearby_none")}</div>}
              {shown.map((p) => (
                <div key={p.id} className="rsq-shelter-item">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-semibold small">{KINDS[p.kind].icon} {p.name}</div>
                      <div className="text-muted" style={{ fontSize: "0.72rem" }}>{KINDS[p.kind].label} · {p.km.toFixed(1)} km</div>
                    </div>
                    <div className="d-flex gap-1 flex-shrink-0">
                      {p.phone && <a className="btn btn-sm btn-outline-danger py-0" href={`tel:${p.phone.split(/[;,]/)[0].replace(/\s/g, "")}`}>📞</a>}
                      <a className="btn btn-sm btn-outline-primary py-0" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/directions?to=${p.lat}%2C${p.lng}`}>➜</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-muted mt-2" style={{ fontSize: "0.68rem" }}>{t("osm_credit")}</div>
          </>
        )}
      </div>
    </div>
  );
}

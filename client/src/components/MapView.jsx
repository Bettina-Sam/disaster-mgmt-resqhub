import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../leafletFix";
import HeatLayer from "./HeatLayer";
import L from "leaflet";
import { useLanguage } from "../contexts/LanguageContext";
import { pointOf } from "../services/liveService";

const hazardClass = (t = "OTHER") =>
  ({ FLOOD: "pin-flood", FIRE: "pin-fire", ACCIDENT: "pin-accident", EARTHQUAKE: "pin-earthquake", CYCLONE: "pin-cyclone", OTHER: "pin-other" }[t] || "pin-other");

const sevPulse = (s = "LOW") =>
  ({ LOW: "pin-sev-low", MEDIUM: "pin-sev-medium", HIGH: "pin-sev-high", CRITICAL: "pin-sev-critical" }[s] || "pin-sev-low");

const makePulseIcon = (type, severity, unverified) =>
  L.divIcon({
    className: "",
    html: `<div class="rsq-pin ${hazardClass(type)} ${sevPulse(severity)}${unverified ? " rsq-pin-unverified" : ""}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -6],
  });

const sevClass = (s) =>
  ({ LOW: "badge-sev-low", MEDIUM: "badge-sev-medium", HIGH: "badge-sev-high", CRITICAL: "badge-sev-critical" }[s] || "badge-sev-low");

function ClickToPick({ enabled, setCoords }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      setCoords([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const INDIA_VIEW = { center: [22.5, 80], zoom: 5 };

// Re-frames the map when the region or the visible set changes.
function FitBounds({ items, coords, region, me }) {
  const map = useMap();
  const pts = useMemo(() => items.map(pointOf).filter(Boolean), [items]);

  useEffect(() => {
    if (coords?.length === 2) {
      map.setView(coords, Math.max(map.getZoom(), 13), { animate: true });
      return;
    }
    if (me) {
      map.setView(me, Math.max(map.getZoom(), 7), { animate: true });
      return;
    }
    if (region === "IN") {
      map.setView(INDIA_VIEW.center, INDIA_VIEW.zoom);
    } else if (pts.length >= 2) {
      map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 6 });
    } else {
      map.setView([20, 10], 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, region, coords, me, pts.length === 0]);

  return null;
}

const BASEMAPS = {
  street: { name: "Street (OSM)", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' },
  dark: { name: "Dark (CARTO)", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' },
  topo: { name: "Topo (OpenTopoMap)", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap" },
};

const SEV_WEIGHTS = { CRITICAL: 1, HIGH: 0.8, MEDIUM: 0.5, LOW: 0.3 };

export default function MapView({ items, region = "IN", me, pickOnMap, coords, setCoords, onOpen }) {
  const { t } = useLanguage();
  const [base, setBase] = useState(() => {
    try { return localStorage.getItem("basemap") || "dark"; } catch { return "dark"; }
  });
  const bm = BASEMAPS[base] || BASEMAPS.dark;

  const heatPoints = useMemo(
    () => items.map((e) => { const pt = pointOf(e); return pt ? [...pt, SEV_WEIGHTS[e.severity] ?? 0.4] : null; }).filter(Boolean),
    [items]
  );

  const onChangeBase = (e) => {
    setBase(e.target.value);
    try { localStorage.setItem("basemap", e.target.value); } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h5 className="mb-0">{t("map_live")} <span className="text-muted small">· {items.length}</span></h5>
        <div className="d-flex align-items-center gap-2">
          {pickOnMap && <span className="badge text-bg-primary">{t("map_click")}</span>}
          <select className="form-select form-select-sm" style={{ width: 170 }} value={base} onChange={onChangeBase} aria-label="Basemap">
            {Object.entries(BASEMAPS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <MapContainer center={INDIA_VIEW.center} zoom={INDIA_VIEW.zoom} minZoom={2} worldCopyJump style={{ height: 420, width: "100%", borderRadius: 12 }}>
        <TileLayer key={base} url={bm.url} attribution={bm.attribution} />
        <FitBounds items={items} coords={coords} region={region} me={me} />
        <HeatLayer points={heatPoints} />

        {items.map((e) => {
          const pt = pointOf(e);
          if (!pt) return null;
          return (
            <Marker key={e._id} position={pt} icon={makePulseIcon(e.type, e.severity, e.source === "COMMUNITY")} eventHandlers={{ click: () => onOpen?.(e) }}>
              <Popup>
                <b>{e.title}</b><br />
                {e.type} • <span className={`badge ${sevClass(e.severity)}`}>{e.severity}</span><br />
                <small>{e.source}{e.verified ? "" : ` · ${t("unverified")}`}</small>
                <div className="mt-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onOpen?.(e)}>{t("map_details")}</button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {me && (
          <CircleMarker center={me} radius={8} pathOptions={{ color: "#fff", weight: 2, fillColor: "#2563eb", fillOpacity: 1 }}>
            <Popup>{t("you_are_here")}</Popup>
          </CircleMarker>
        )}
        {coords && <Marker position={coords}><Popup>{t("map_picked")}</Popup></Marker>}
        <ClickToPick enabled={pickOnMap} setCoords={setCoords} />
      </MapContainer>
    </div>
  );
}

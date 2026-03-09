// client/src/components/MapView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../leafletFix";
import HeatLayer from "./HeatLayer";
import L from "leaflet";
import { useLanguage } from "../contexts/LanguageContext";

// normalize coordinates from either `coords` (new) or `location` (old)
const getPoint = (it) => {
  const lat = Number(it?.coords?.lat ?? it?.location?.lat);
  const lng = Number(it?.coords?.lng ?? it?.location?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

// map hazard -> color class
const hazardClass = (t = "OTHER") =>
  ({
    FLOOD: "pin-flood",
    FIRE: "pin-fire",
    ACCIDENT: "pin-accident",
    EARTHQUAKE: "pin-earthquake",
    CYCLONE: "pin-cyclone",
    OTHER: "pin-other",
  }[t] || "pin-other");

// map severity -> strength class
const sevPulse = (s = "LOW") =>
  ({
    LOW: "pin-sev-low",
    MEDIUM: "pin-sev-medium",
    HIGH: "pin-sev-high",
    CRITICAL: "pin-sev-critical",
  }[s] || "pin-sev-low");

// build a Leaflet divIcon for pulsing dot
const makePulseIcon = (type, severity) =>
  L.divIcon({
    className: "", // we’ll style the inner HTML, not the wrapper
    html: `<div class="rsq-pin ${hazardClass(type)} ${sevPulse(severity)}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -6],
  });


const sevClass = (s) =>
  ({
    LOW: "badge-sev-low",
    MEDIUM: "badge-sev-medium",
    HIGH: "badge-sev-high",
    CRITICAL: "badge-sev-critical",
  }[s] || "badge-sev-low");

function ClickToPick({ enabled, setCoords }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      const { lat, lng } = e.latlng;
      setCoords([lat, lng]);
    },
  });
  return null;
}

function FitBounds({ items, coords }) {
  const map = useMap();

  const pts = useMemo(() => items.map(getPoint).filter(Boolean), [items]);

  useEffect(() => {
    if (!map) return;

    // if user is picking on map / form has coords, prioritize that view
    if (coords && Array.isArray(coords) && coords.length === 2) {
      map.setView(coords, Math.max(map.getZoom(), 13), { animate: true });
      return;
    }

    if (pts.length >= 2) {
      const b = window.L.latLngBounds(pts);
      map.fitBounds(b, { padding: [30, 30] });
    } else if (pts.length === 1) {
      map.setView(pts[0], 13);
    }
  }, [map, pts, coords]);

  return null;
}

const BASEMAPS = {
  street: {
    name: "Street (OSM)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  dark: {
    name: "Dark (CARTO)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  topo: {
    name: "Topo (OpenTopoMap)",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap",
  },
};

const SEV_WEIGHTS = { CRITICAL: 1, HIGH: 0.8, MEDIUM: 0.5, LOW: 0.3 };

export default function MapView({ items, pickOnMap, coords, setCoords, onOpen }) {
  const { t } = useLanguage();
  const [base, setBase] = useState(() => localStorage.getItem("basemap") || "street");
  const bm = BASEMAPS[base] || BASEMAPS.street;

  // pick a sensible initial center: picked coords -> first incident -> fallback
  const firstPt = useMemo(() => items.map(getPoint).find(Boolean), [items]);
  const center = coords || firstPt || [8.713, 77.756]; // Tirunelveli-ish fallback

  const heatPoints = useMemo(
    () =>
      items
        .map((e) => {
          const pt = getPoint(e);
          return pt ? [...pt, SEV_WEIGHTS[e.severity] ?? 0.4] : null;
        })
        .filter(Boolean),
    [items]
  );

  const onChangeBase = (e) => {
    const v = e.target.value;
    setBase(v);
    localStorage.setItem("basemap", v);
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="mb-2">{t("map_live")}</h5>
          <div className="d-flex align-items-center gap-2">
            {pickOnMap && <span className="badge text-bg-primary">{t("map_click")}</span>}
            <select
              className="form-select form-select-sm"
              style={{ width: 200 }}
              value={base}
              onChange={onChangeBase}
            >
              {Object.entries(BASEMAPS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MapContainer center={center} zoom={12} style={{ height: 380, width: "100%" }}>
          <TileLayer key={base} url={bm.url} attribution={bm.attribution} />

          <FitBounds items={items} coords={coords} />
          <HeatLayer points={heatPoints} />

          {items.map((e) => {
            const pt = getPoint(e);
            if (!pt) return null;
            const icon = makePulseIcon(e.type, e.severity);
            return (
              <Marker
                key={e._id}
                position={pt}
                icon={icon}
                eventHandlers={{ click: () => onOpen?.(e) }}
              >
                <Popup>
                  <b>{e.title}</b><br/>
                  {e.type} • <span className={`badge ${sevClass(e.severity)}`}>{e.severity}</span><br/>
                  {e.address || t("map_no_address")}<br/>
                  <small>{t("map_status")}: {e.status}</small>
                  <div className="mt-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onOpen?.(e)}>{t("map_details")}</button>
                  </div>
                </Popup>
              </Marker>
            );
          })}


          {coords && (
            <Marker position={coords}>
              <Popup>{t("map_picked")}</Popup>
            </Marker>
          )}
          <ClickToPick enabled={pickOnMap} setCoords={setCoords} />
        </MapContainer>
      </div>
    </div>
  );
}

// src/pages/Dashboard.jsx — SHOWCASE MODE (backend-free)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getIncidents } from "../services/mockService";

import Stats from "../components/Stats";
import Filters from "../components/Filters";
import ExportCSV from "../components/ExportCSV";
import ExportPNG from "../components/ExportPNG";
import PlaybackBar from "../components/PlaybackBar";
import OpsSnapshot from "../components/OpsSnapshot";
import InsightsPanel from "../components/InsightsPanel";
import MapView from "../components/MapView";
import EmergencyForm from "../components/EmergencyForm";
import EmergencyList from "../components/EmergencyList";
import IncidentModal from "../components/IncidentModal";
import AgingBacklog from "../components/AgingBacklog";
import QuickFilters from "../components/QuickFilters";
import AlertBar from "../components/AlertBar";
import AlertsPanel from "../components/AlertsPanel";
import ShelterPanel from "../components/ShelterPanel";

import useAlertSounds from "../hooks/useAlertSounds";
import { useLanguage } from "../contexts/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [, setLoading] = useState(true);
  const [filter, setFilter] = useState({ q: "", type: "ALL", severity: "ALL", status: "ALL" });
  const { playForIncident, muted, toggleMuted } = useAlertSounds();

  const [pickOnMap, setPickOnMap] = useState(false);
  const [coords, setCoords] = useState(null);
  const [ticker, setTicker] = useState(null);
  const tickerTimerRef = useRef(null);

  // Playback state
  const [pbEnabled, setPbEnabled] = useState(false);
  const [pbValue, setPbValue] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Modal state
  const [active, setActive] = useState(null);
  const openIncident = (doc) => setActive(doc);
  const closeIncident = () => setActive(null);

  const showTicker = (item) => {
    setTicker({ title: item.title, severity: item.severity, item });
    if (tickerTimerRef.current) clearTimeout(tickerTimerRef.current);
    tickerTimerRef.current = setTimeout(() => setTicker(null), 4500);
  };

  // Load mock incidents on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getIncidents();
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Simulate a "new incident" arriving every ~45 seconds for demo realism
  useEffect(() => {
    const DEMO_INCIDENTS = [
      {
        _id: `demo-${Date.now()}-a`,
        title: "Flash Flood Warning — Velachery",
        description: "Storm drain overflow; street flooding reported by residents.",
        type: "FLOOD", severity: "HIGH", status: "OPEN",
        address: "100 Feet Road, Velachery, Chennai",
        phone: "044-100", reportedBy: "Resident App", rescueTeam: "Dispatching...",
        location: { lat: 12.978, lng: 80.218 },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      },
      {
        _id: `demo-${Date.now()}-b`,
        title: "Smoke Detected — Industrial Area",
        description: "Smoke plume visible from chemical storage unit. Fire team alerted.",
        type: "FIRE", severity: "MEDIUM", status: "OPEN",
        address: "SIPCOT Phase II, Siruseri, Chennai",
        phone: "101", reportedBy: "SIPCOT Security", rescueTeam: "Fire Station #7",
        location: { lat: 12.828, lng: 80.199 },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      },
    ];
    let idx = 0;
    const timer = setInterval(() => {
      const doc = { ...DEMO_INCIDENTS[idx % DEMO_INCIDENTS.length], _id: `demo-${Date.now()}` };
      setItems((prev) => (prev.some((x) => x.title === doc.title) ? prev : [doc, ...prev]));
      playForIncident(doc.severity);
      showTicker(doc);
      idx++;
    }, 45000);
    return () => clearInterval(timer);
  }, [playForIncident]);

  useEffect(() => {
    return () => { if (tickerTimerRef.current) clearTimeout(tickerTimerRef.current); };
  }, []);

  // Auto-advance playback slider
  useEffect(() => {
    if (!pbEnabled || !playing) return;
    const id = setInterval(() => {
      setPbValue((v) => (v >= 1440 ? 1440 : v + 5));
    }, 500);
    return () => clearInterval(id);
  }, [pbEnabled, playing]);

  const filtered = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return items.filter((e) => {
      if (filter.type !== "ALL" && e.type !== filter.type) return false;
      if (filter.severity !== "ALL" && e.severity !== filter.severity) return false;
      if (filter.status !== "ALL" && e.status !== filter.status) return false;
      if (q) {
        const hay = (e.title + " " + (e.address || "")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, filter]);

  const playbackItems = useMemo(() => {
    if (!pbEnabled) return filtered;
    const now = Date.now();
    const windowStart = now - 1440 * 60 * 1000;
    const cutoff = windowStart + pbValue * 60 * 1000;
    return filtered.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return !Number.isNaN(t) ? t <= cutoff : true;
    });
  }, [filtered, pbEnabled, pbValue]);

  // Modal actions — now purely local state
  const onStatusChange = async (id, status) => {
    const { updateIncident } = await import("../services/mockService");
    const updated = await updateIncident(id, { status });
    setItems((p) => p.map((x) => (x._id === id ? updated : x)));
    setActive((a) => (a && a._id === id ? updated : a));
  };

  const onDelete = async (id) => {
    const { deleteIncident } = await import("../services/mockService");
    await deleteIncident(id);
    setItems((p) => p.filter((x) => x._id !== id));
    if (active?._id === id) setActive(null);
  };

  return (
    <div className="rsq-dashboard-root">
      <div className="container-xxl page-gap">
        {/* Dashboard header */}
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="mb-0 fw-bold">{t("dashboard_title")}</h3>
            <div className="text-muted small">{t("dashboard_sub")}</div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm ${muted ? "btn-outline-secondary" : "btn-outline-warning"}`}
              onClick={toggleMuted}
              title={muted ? "Alerts muted" : "Alerts enabled"}
              style={{ borderRadius: 999 }}
            >
              {muted ? t("btn_mute") : t("btn_unmute")}
            </button>
            <ExportCSV items={playbackItems} />
            <ExportPNG rootId="capture-root" />
          </div>
        </div>

        {/* Alert ticker */}
        <AlertBar
          notice={ticker}
          onClose={() => setTicker(null)}
          onView={() => { if (ticker?.item) openIncident(ticker.item); setTicker(null); }}
        />

        {/* KPI Row */}
        <Stats items={playbackItems} />

        {/* Filters + Playback */}
        <Filters filter={filter} setFilter={setFilter} />
        <PlaybackBar
          enabled={pbEnabled} setEnabled={setPbEnabled}
          value={pbValue} setValue={setPbValue}
          playing={playing} setPlaying={setPlaying}
        />

        {/* Main grid */}
        <div id="capture-root" className="row g-3 mt-1">
          {/* LEFT: Map + Form + List */}
          <div className="col-lg-8">
            <div className="card glass mb-3">
              <div className="card-body p-3">
                <MapView
                  items={playbackItems}
                  pickOnMap={pickOnMap}
                  coords={coords}
                  setCoords={(c) => { setCoords(c); setPickOnMap(false); }}
                  onOpen={openIncident}
                />
              </div>
            </div>

            <EmergencyForm
              onCreated={(doc) => setItems((prev) => (prev.some((x) => x._id === doc._id) ? prev : [doc, ...prev]))}
              pickOnMap={pickOnMap}
              setPickOnMap={setPickOnMap}
              coords={coords}
              setPreCoords={setCoords}
            />

            <EmergencyList
              items={playbackItems}
              setItems={(updater) =>
                setItems((prev) => typeof updater === "function" ? updater(prev) : updater)
              }
              onOpen={openIncident}
            />
          </div>

          {/* RIGHT: Ops + Insights Stack */}
          <div className="col-lg-4">
            <OpsSnapshot items={playbackItems} />

            <div className="mt-3">
              <AlertsPanel />
            </div>

            <div className="mt-3">
              <ShelterPanel />
            </div>

            {typeof AgingBacklog === "function" && (
              <div className="mt-3">
                <AgingBacklog items={playbackItems} onOpen={openIncident} />
              </div>
            )}

            {typeof QuickFilters === "function" && (
              <div className="mt-3">
                <QuickFilters filter={filter} setFilter={setFilter} />
              </div>
            )}

            <div className="mt-3">
              <InsightsPanel items={playbackItems} setFilter={setFilter} />
            </div>
          </div>
        </div>

        {/* Incident modal */}
        <IncidentModal
          item={active}
          onClose={closeIncident}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          canEdit={true}
          canDelete={true}
        />
      </div>
    </div>
  );
}
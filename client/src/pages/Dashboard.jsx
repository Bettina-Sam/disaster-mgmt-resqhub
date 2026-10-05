// Live dashboard: real hazard feeds (USGS, GDACS, NASA EONET) plus community reports.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setTriage, deleteReport, inIndia, pointOf } from "../services/liveService";
import { kmBetween } from "../utils/geo";
import { useLiveData } from "../contexts/LiveDataContext";

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
import AlertBar from "../components/AlertBar";
import AlertsPanel from "../components/AlertsPanel";
import ShelterPanel from "../components/ShelterPanel";
import SourceStatus from "../components/SourceStatus";
import EmergencyNumbers from "../components/EmergencyNumbers";
import PlaceSearch from "../components/PlaceSearch";

import useAlertSounds from "../hooks/useAlertSounds";
import { useLanguage } from "../contexts/LanguageContext";

const DEFAULT_FILTER = { q: "", type: "ALL", severity: "ALL", status: "ALL", km: "", region: "IN" };

export default function Dashboard() {
  const { t } = useLanguage();
  const { items, setItems, meta, loading, load, fresh } = useLiveData();
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [me, setMe] = useState(null); // [lat, lng] once the user shares their location
  const [pin, setPin] = useState(null); // a searched place: { lat, lng, label }
  const [locating, setLocating] = useState(false);
  const { playForIncident, muted, toggleMuted } = useAlertSounds();

  const [pickOnMap, setPickOnMap] = useState(false);
  const [coords, setCoords] = useState(null);
  const [ticker, setTicker] = useState(null);
  const tickerTimerRef = useRef(null);

  const [pbEnabled, setPbEnabled] = useState(false);
  const [pbValue, setPbValue] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(null);

  // Announce serious events that arrive after the first load.
  useEffect(() => {
    if (!fresh.length) return;
    playForIncident(fresh[0].severity);
    setTicker({ title: fresh[0].title, severity: fresh[0].severity, item: fresh[0] });
    clearTimeout(tickerTimerRef.current);
    tickerTimerRef.current = setTimeout(() => setTicker(null), 6000);
    return () => clearTimeout(tickerTimerRef.current);
  }, [fresh, playForIncident]);

  useEffect(() => {
    if (!pbEnabled || !playing) return;
    const id = setInterval(() => setPbValue((v) => (v >= 1440 ? 1440 : v + 5)), 500);
    return () => clearInterval(id);
  }, [pbEnabled, playing]);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMe([pos.coords.latitude, pos.coords.longitude]); setPin(null); setLocating(false); },
      () => setLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const origin = pin ? [pin.lat, pin.lng] : me;

  const filtered = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    const km = Number(filter.km);
    return items.filter((e) => {
      if (filter.type !== "ALL" && e.type !== filter.type) return false;
      if (filter.severity !== "ALL" && e.severity !== filter.severity) return false;
      if (filter.status !== "ALL" && e.status !== filter.status) return false;
      if (q && !(e.title + " " + (e.address || "")).toLowerCase().includes(q)) return false;
      const pt = pointOf(e);
      if (filter.region === "IN" && !inIndia(pt)) return false;
      if (km > 0 && origin) {
        if (!pt || kmBetween(origin, pt) > km) return false;
      }
      return true;
    });
  }, [items, filter, origin]);

  const playbackItems = useMemo(() => {
    if (!pbEnabled) return filtered;
    const cutoff = Date.now() - 1440 * 60 * 1000 + pbValue * 60 * 1000;
    return filtered.filter((e) => {
      const ts = new Date(e.createdAt).getTime();
      return Number.isNaN(ts) ? true : ts <= cutoff;
    });
  }, [filtered, pbEnabled, pbValue]);

  const indiaCount = useMemo(() => items.filter((i) => inIndia(pointOf(i))).length, [items]);

  const onStatusChange = (id, status) => {
    const at = setTriage(id, status);
    setItems((p) => p.map((x) => (x._id === id ? { ...x, status, updatedAt: at } : x)));
    setActive((a) => (a && a._id === id ? { ...a, status, updatedAt: at } : a));
  };

  const onDelete = (id) => {
    deleteReport(id);
    setItems((p) => p.filter((x) => x._id !== id));
    setActive((a) => (a?._id === id ? null : a));
  };

  return (
    <div className="rsq-dashboard-root" id="dashboard">
      <div className="container-xxl page-gap">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="mb-0 fw-bold">{t("dashboard_title")}</h3>
            <div className="text-muted small">{t("dashboard_sub")}</div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="btn-group btn-group-sm" role="group" aria-label="Region">
              <button type="button" className={`btn ${filter.region === "IN" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setFilter((f) => ({ ...f, region: "IN" }))}>
                🇮🇳 {t("region_india")}
              </button>
              <button type="button" className={`btn ${filter.region === "WORLD" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setFilter((f) => ({ ...f, region: "WORLD" }))}>
                🌍 {t("region_world")}
              </button>
            </div>
            <button type="button" className={`btn btn-sm ${muted ? "btn-outline-secondary" : "btn-outline-warning"}`} onClick={toggleMuted} style={{ borderRadius: 999 }}>
              {muted ? t("btn_mute") : t("btn_unmute")}
            </button>
            <ExportCSV items={playbackItems} />
            <ExportPNG rootId="capture-root" />
          </div>
        </div>

        <SourceStatus meta={meta} loading={loading} onRefresh={() => load(true)} />

        {filter.region === "IN" && !loading && indiaCount === 0 && items.length > 0 && (
          <div className="alert alert-success d-flex justify-content-between align-items-center flex-wrap gap-2 py-2">
            <span>✅ {t("india_quiet")}</span>
            <button className="btn btn-sm btn-success" onClick={() => setFilter((f) => ({ ...f, region: "WORLD" }))}>{t("show_world")}</button>
          </div>
        )}

        <AlertBar notice={ticker} onClose={() => setTicker(null)} onView={() => { if (ticker?.item) setActive(ticker.item); setTicker(null); }} />

        <Stats items={playbackItems} />
        <Filters filter={filter} setFilter={setFilter} me={origin} onLocate={locateMe} />
        <PlaybackBar enabled={pbEnabled} setEnabled={setPbEnabled} value={pbValue} setValue={setPbValue} playing={playing} setPlaying={setPlaying} />

        <div id="capture-root" className="row g-3 mt-1 align-items-start">
          <div className="col-lg-8">
            <div className="card glass mb-3">
              <div className="card-body p-3">
                <PlaceSearch pin={pin} me={me} locating={locating} onLocate={locateMe} onPick={setPin} onClear={() => setPin(null)} />
                <MapView
                  items={playbackItems}
                  region={filter.region}
                  me={me}
                  pin={pin}
                  pickOnMap={pickOnMap}
                  coords={coords}
                  setCoords={(c) => { setCoords(c); setPickOnMap(false); }}
                  onOpen={setActive}
                />
              </div>
            </div>
            <EmergencyList items={playbackItems} onOpen={setActive} onStatusChange={onStatusChange} onDelete={onDelete} />
          </div>

          <div className="col-lg-4">
            <AlertsPanel items={items} region={filter.region} onOpen={setActive} />
            <div className="mt-3"><ShelterPanel me={origin} onLocate={locateMe} /></div>
            <div className="mt-3"><EmergencyNumbers /></div>
          </div>
        </div>

        <div className="row g-3 mt-1 align-items-start">
          <div className="col-lg-7"><EmergencyForm onCreated={(doc) => setItems((prev) => [doc, ...prev])} pickOnMap={pickOnMap} setPickOnMap={setPickOnMap} coords={coords} setPreCoords={setCoords} /></div>
          <div className="col-lg-5"><InsightsPanel items={playbackItems} setFilter={setFilter} /></div>
        </div>

        <div className="row g-3 align-items-start">
          <div className="col-md-6"><AgingBacklog items={playbackItems} onOpen={setActive} /></div>
          <div className="col-md-6"><OpsSnapshot items={playbackItems} /></div>
        </div>

        <IncidentModal item={active} onClose={() => setActive(null)} onStatusChange={onStatusChange} onDelete={onDelete} canEdit canDelete={active?.source === "COMMUNITY"} />
      </div>
    </div>
  );
}

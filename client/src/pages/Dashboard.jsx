// Live dashboard: real hazard feeds (USGS, GDACS, NASA EONET) plus community reports.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLiveIncidents, setTriage, deleteReport, inIndia, pointOf } from "../services/liveService";
import { kmBetween } from "../utils/geo";

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
import SourceStatus from "../components/SourceStatus";
import EmergencyNumbers from "../components/EmergencyNumbers";

import useAlertSounds from "../hooks/useAlertSounds";
import { useLanguage } from "../contexts/LanguageContext";

const REFRESH_MS = 5 * 60 * 1000;
const DEFAULT_FILTER = { q: "", type: "ALL", severity: "ALL", status: "ALL", km: "", region: "IN" };

export default function Dashboard() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ sources: [], updatedAt: null, stale: false });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [me, setMe] = useState(null); // [lat, lng] once the user shares their location
  const { playForIncident, muted, toggleMuted } = useAlertSounds();

  const [pickOnMap, setPickOnMap] = useState(false);
  const [coords, setCoords] = useState(null);
  const [ticker, setTicker] = useState(null);
  const tickerTimerRef = useRef(null);
  const seenIds = useRef(null);

  const [pbEnabled, setPbEnabled] = useState(false);
  const [pbValue, setPbValue] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [active, setActive] = useState(null);

  const showTicker = (item) => {
    setTicker({ title: item.title, severity: item.severity, item });
    clearTimeout(tickerTimerRef.current);
    tickerTimerRef.current = setTimeout(() => setTicker(null), 6000);
  };

  const load = useCallback(
    async (force = false) => {
      setLoading(true);
      try {
        const res = await getLiveIncidents({ force });
        setItems(res.items);
        setMeta({ sources: res.sources, updatedAt: res.updatedAt, stale: !!res.stale });

        // Announce genuinely new serious events that appear after the first load.
        if (seenIds.current) {
          const fresh = res.items.filter((i) => !seenIds.current.has(i._id) && (i.severity === "HIGH" || i.severity === "CRITICAL"));
          if (fresh[0]) {
            playForIncident(fresh[0].severity);
            showTicker(fresh[0]);
          }
        }
        seenIds.current = new Set(res.items.map((i) => i._id));
      } finally {
        setLoading(false);
      }
    },
    [playForIncident]
  );

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => {
      clearInterval(id);
      clearTimeout(tickerTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Playback slider
  useEffect(() => {
    if (!pbEnabled || !playing) return;
    const id = setInterval(() => setPbValue((v) => (v >= 1440 ? 1440 : v + 5)), 500);
    return () => clearInterval(id);
  }, [pbEnabled, playing]);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 8000 }
    );
  }, []);

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
      if (km > 0 && me) {
        if (!pt || kmBetween(me, pt) > km) return false;
      }
      return true;
    });
  }, [items, filter, me]);

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
    <div className="rsq-dashboard-root">
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
            <button
              type="button"
              className={`btn btn-sm ${muted ? "btn-outline-secondary" : "btn-outline-warning"}`}
              onClick={toggleMuted}
              style={{ borderRadius: 999 }}
            >
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
            <button className="btn btn-sm btn-success" onClick={() => setFilter((f) => ({ ...f, region: "WORLD" }))}>
              {t("show_world")}
            </button>
          </div>
        )}

        <AlertBar notice={ticker} onClose={() => setTicker(null)} onView={() => { if (ticker?.item) setActive(ticker.item); setTicker(null); }} />

        <Stats items={playbackItems} />

        <Filters filter={filter} setFilter={setFilter} me={me} onLocate={locateMe} />
        <PlaybackBar enabled={pbEnabled} setEnabled={setPbEnabled} value={pbValue} setValue={setPbValue} playing={playing} setPlaying={setPlaying} />

        <div id="capture-root" className="row g-3 mt-1">
          <div className="col-lg-8">
            <div className="card glass mb-3">
              <div className="card-body p-3">
                <MapView
                  items={playbackItems}
                  region={filter.region}
                  me={me}
                  pickOnMap={pickOnMap}
                  coords={coords}
                  setCoords={(c) => { setCoords(c); setPickOnMap(false); }}
                  onOpen={setActive}
                />
              </div>
            </div>

            <EmergencyForm
              onCreated={(doc) => setItems((prev) => [doc, ...prev])}
              pickOnMap={pickOnMap}
              setPickOnMap={setPickOnMap}
              coords={coords}
              setPreCoords={setCoords}
            />

            <EmergencyList items={playbackItems} onOpen={setActive} onStatusChange={onStatusChange} onDelete={onDelete} />
          </div>

          <div className="col-lg-4">
            <EmergencyNumbers />
            <div className="mt-3"><AlertsPanel items={items} region={filter.region} onOpen={setActive} /></div>
            <div className="mt-3"><ShelterPanel me={me} onLocate={locateMe} /></div>
            <div className="mt-3"><OpsSnapshot items={playbackItems} /></div>
            <div className="mt-3"><AgingBacklog items={playbackItems} onOpen={setActive} /></div>
            <div className="mt-3"><QuickFilters filter={filter} setFilter={setFilter} /></div>
            <div className="mt-3"><InsightsPanel items={playbackItems} setFilter={setFilter} /></div>
          </div>
        </div>

        <IncidentModal
          item={active}
          onClose={() => setActive(null)}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          canEdit
          canDelete={active?.source === "COMMUNITY"}
        />
      </div>
    </div>
  );
}

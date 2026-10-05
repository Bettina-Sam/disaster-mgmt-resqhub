// Live hazard feeds. All sources are free and keyless:
//   USGS      earthquakes          https://earthquake.usgs.gov
//   GDACS     floods/cyclones/fire https://www.gdacs.org   (UN + EU)
//   NASA EONET wildfires/volcanoes  https://eonet.gsfc.nasa.gov
// Everything is normalised to the incident shape the dashboard already uses.
import { kmBetween } from "../utils/geo";

const CACHE_KEY = "rsq:live:v2";
const CACHE_MS = 5 * 60 * 1000;
const REPORTS_KEY = "rsq:reports:v1";
// Storms drift hundreds of km between reports; fires barely move. 150 km is a compromise.
const DEDUPE_KM = 150;
const TRIAGE_KEY = "rsq:triage:v1";

// Rough bounding box for India incl. Andaman & Nicobar and Lakshadweep.
export const INDIA_BOX = { minLat: 5.5, maxLat: 37.5, minLng: 67, maxLng: 98.5 };

export function inIndia(pt) {
  if (!pt) return false;
  const [lat, lng] = pt;
  return lat >= INDIA_BOX.minLat && lat <= INDIA_BOX.maxLat && lng >= INDIA_BOX.minLng && lng <= INDIA_BOX.maxLng;
}

export const pointOf = (it) => {
  const lat = Number(it?.location?.lat);
  const lng = Number(it?.location?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the app still works without it */
  }
};

async function getJSON(url, ms = 15000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---------- USGS -----------------------------------------------------------
export function quakeSeverity(mag) {
  if (mag >= 6.5) return "CRITICAL";
  if (mag >= 5.5) return "HIGH";
  if (mag >= 4.5) return "MEDIUM";
  return "LOW";
}

export function normalizeUSGS(geo) {
  return (geo?.features || [])
    .filter((f) => f.geometry?.coordinates && f.properties?.mag != null)
    .map((f) => {
      const [lng, lat, depth] = f.geometry.coordinates;
      const p = f.properties;
      const when = new Date(p.time).toISOString();
      return {
        _id: `usgs-${f.id}`,
        title: `M${Number(p.mag).toFixed(1)} earthquake: ${p.place || "unknown location"}`,
        description: `Magnitude ${Number(p.mag).toFixed(1)}, depth ${Math.round(depth)} km.${p.tsunami ? " Tsunami flag set by USGS." : ""}`,
        type: "EARTHQUAKE",
        severity: quakeSeverity(p.mag),
        status: "OPEN",
        address: p.place || "",
        location: { lat, lng },
        createdAt: when,
        updatedAt: when,
        source: "USGS",
        sourceUrl: p.url,
        verified: true,
      };
    });
}

// ---------- GDACS ----------------------------------------------------------
const GDACS_TYPE = { FL: "FLOOD", TC: "CYCLONE", WF: "FIRE" };
const GDACS_LABEL = { FL: "Flood", TC: "Tropical cyclone", WF: "Wildfire" };
const GDACS_SEV = { Green: "LOW", Orange: "HIGH", Red: "CRITICAL" };

export function normalizeGDACS(geo) {
  return (geo?.features || [])
    .filter((f) => GDACS_TYPE[f.properties?.eventtype] && f.geometry?.type === "Point")
    .map((f) => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      const from = p.fromdate ? new Date(p.fromdate + "Z").toISOString() : new Date().toISOString();
      return {
        _id: `gdacs-${p.eventtype}-${p.eventid}`,
        title: p.name || `${GDACS_LABEL[p.eventtype]} in ${p.country}`,
        description: (p.htmldescription || p.description || "").replace(/<[^>]+>/g, ""),
        type: GDACS_TYPE[p.eventtype],
        severity: GDACS_SEV[p.alertlevel] || "LOW",
        status: "OPEN",
        address: p.country || "",
        location: { lat, lng },
        createdAt: from,
        updatedAt: p.datemodified ? new Date(p.datemodified + "Z").toISOString() : from,
        source: "GDACS",
        sourceUrl: p.url?.report,
        verified: true,
      };
    });
}

// ---------- NASA EONET -----------------------------------------------------
const EONET_TYPE = { wildfires: "FIRE", floods: "FLOOD", severeStorms: "CYCLONE", volcanoes: "OTHER" };

export function normalizeEONET(json) {
  return (json?.events || [])
    .map((e) => {
      const cat = e.categories?.[0]?.id;
      const type = EONET_TYPE[cat];
      const geom = e.geometry?.[e.geometry.length - 1];
      if (!type || !geom || geom.type !== "Point") return null;
      const [lng, lat] = geom.coordinates;
      const wind = Number(geom.magnitudeValue);
      let severity = "MEDIUM";
      if (cat === "severeStorms") severity = wind >= 96 ? "CRITICAL" : wind >= 64 ? "HIGH" : "MEDIUM";
      if (cat === "volcanoes") severity = "HIGH";
      const when = new Date(geom.date).toISOString();
      return {
        _id: `eonet-${e.id}`,
        title: e.title,
        description: e.description || `Tracked by NASA EONET${Number.isFinite(wind) ? `, ${wind} ${geom.magnitudeUnit || ""}` : ""}.`,
        type,
        severity,
        status: "OPEN",
        address: "",
        location: { lat, lng },
        createdAt: when,
        updatedAt: when,
        source: "NASA EONET",
        sourceUrl: e.link,
        verified: true,
      };
    })
    .filter(Boolean);
}

// Drop an item if a higher-priority one of the same type is already close by.
export function dedupe(primary, secondary, km) {
  const keep = [...primary];
  for (const s of secondary) {
    const sp = pointOf(s);
    const dup = primary.some((p) => p.type === s.type && sp && pointOf(p) && kmBetween(sp, pointOf(p)) < km);
    if (!dup) keep.push(s);
  }
  return keep;
}

// ---------- Orchestration --------------------------------------------------
const isoDaysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 19);

const SOURCES = [
  {
    name: "USGS",
    load: async () => {
      const world = await getJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson");
      // India region at a lower threshold: small quakes matter locally.
      const india = await getJSON(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&starttime=${isoDaysAgo(7)}` +
          `&minlatitude=${INDIA_BOX.minLat}&maxlatitude=${INDIA_BOX.maxLat}&minlongitude=${INDIA_BOX.minLng}&maxlongitude=${INDIA_BOX.maxLng}`
      ).catch(() => ({ features: [] }));
      const seen = new Set();
      return [...normalizeUSGS(world), ...normalizeUSGS(india)].filter((x) => !seen.has(x._id) && seen.add(x._id));
    },
  },
  { name: "GDACS", load: async () => normalizeGDACS(await getJSON("https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP")) },
  { name: "NASA EONET", load: async () => normalizeEONET(await getJSON("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=14&limit=300")) },
];

/**
 * Fetch every source in parallel. One failing source never blocks the others.
 * Returns { items, sources: [{name, ok, count, error?}], updatedAt, fromCache }.
 */
export async function getLiveIncidents({ force = false } = {}) {
  const cached = read(CACHE_KEY, null);
  if (!force && cached && Date.now() - cached.updatedAt < CACHE_MS) {
    return { ...withLocalState(cached.items), sources: cached.sources, updatedAt: cached.updatedAt, fromCache: true };
  }

  const results = await Promise.allSettled(SOURCES.map((s) => s.load()));
  const sources = results.map((r, i) =>
    r.status === "fulfilled"
      ? { name: SOURCES[i].name, ok: true, count: r.value.length }
      : { name: SOURCES[i].name, ok: false, count: 0, error: String(r.reason?.message || r.reason) }
  );

  // Every source failed: fall back to the last good snapshot instead of an empty screen.
  if (sources.every((s) => !s.ok)) {
    if (cached) return { ...withLocalState(cached.items), sources, updatedAt: cached.updatedAt, fromCache: true, stale: true };
    return { ...withLocalState([]), sources, updatedAt: null, fromCache: false, stale: true };
  }

  const [usgs, gdacs, eonet] = results.map((r) => (r.status === "fulfilled" ? r.value : []));
  // GDACS is the more authoritative source for cyclones/fires; EONET fills the gaps.
  const merged = [...usgs, ...dedupe(gdacs, eonet, DEDUPE_KM)];
  merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const updatedAt = Date.now();
  write(CACHE_KEY, { items: merged, sources, updatedAt });
  return { ...withLocalState(merged), sources, updatedAt, fromCache: false };
}

// ---------- Triage + community reports (stored on this device only) ---------
function withLocalState(liveItems) {
  const triage = read(TRIAGE_KEY, {});
  const reports = getReports();
  const apply = (it) => (triage[it._id] ? { ...it, status: triage[it._id].status, updatedAt: triage[it._id].at } : it);
  return { items: [...reports, ...liveItems].map(apply) };
}

export function getReports() {
  return read(REPORTS_KEY, []);
}

export function createReport(data) {
  const now = new Date().toISOString();
  const doc = {
    ...data,
    _id: `community-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
    reportedBy: data.reportedBy || "Anonymous",
    source: "COMMUNITY",
    verified: false,
  };
  write(REPORTS_KEY, [doc, ...getReports()]);
  return doc;
}

export function deleteReport(id) {
  write(REPORTS_KEY, getReports().filter((r) => r._id !== id));
}

// Status on a live item is the user's own triage ("seen", "dealt with"), not an official status.
export function setTriage(id, status) {
  const at = new Date().toISOString();
  if (id.startsWith("community-")) {
    write(REPORTS_KEY, getReports().map((r) => (r._id === id ? { ...r, status, updatedAt: at } : r)));
    return at;
  }
  const triage = read(TRIAGE_KEY, {});
  if (status === "OPEN") delete triage[id];
  else triage[id] = { status, at };
  write(TRIAGE_KEY, triage);
  return at;
}

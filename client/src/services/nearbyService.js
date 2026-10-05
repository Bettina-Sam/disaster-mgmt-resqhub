// Nearby help from OpenStreetMap (Overpass API): hospitals, police, fire stations, shelters.
import { kmBetween } from "../utils/geo";

const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

export const KINDS = {
  hospital: { label: "Hospital", icon: "🏥" },
  police: { label: "Police", icon: "👮" },
  fire_station: { label: "Fire station", icon: "🚒" },
  shelter: { label: "Shelter / relief point", icon: "🏕️" },
};

export function buildQuery(lat, lng, radius) {
  const around = `(around:${radius},${lat},${lng})`;
  return `[out:json][timeout:20];(
    nwr${around}[amenity=hospital];
    nwr${around}[amenity=police];
    nwr${around}[amenity=fire_station];
    nwr${around}[amenity=shelter];
    nwr${around}[emergency=assembly_point];
    nwr${around}[social_facility=shelter];
  );out center 120;`;
}

export function classify(tags = {}) {
  if (tags.amenity === "hospital") return "hospital";
  if (tags.amenity === "police") return "police";
  if (tags.amenity === "fire_station") return "fire_station";
  return "shelter";
}

export function normalizeOverpass(json, origin) {
  return (json?.elements || [])
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (lat == null || lng == null) return null;
      const tags = el.tags || {};
      const kind = classify(tags);
      return {
        id: `${el.type}-${el.id}`,
        kind,
        name: tags.name || tags["name:en"] || KINDS[kind].label,
        phone: tags.phone || tags["contact:phone"] || "",
        lat,
        lng,
        km: kmBetween(origin, [lat, lng]),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.km - b.km);
}

export async function findNearby([lat, lng], radius = 6000) {
  const body = "data=" + encodeURIComponent(buildQuery(lat, lng, radius));
  let lastErr;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error(`${res.status}`);
      return normalizeOverpass(await res.json(), [lat, lng]);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

// Place lookup with OpenStreetMap Nominatim (free, no key). Runs on submit only, per their usage policy.
export async function searchPlace(q, lang = "en") {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=${lang}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(String(res.status));
  const rows = await res.json();
  return rows.map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }));
}

export default function PlaceSearch({ pin, me, onPick, onClear, onLocate, locating }) {
  const { t, language } = useLanguage();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [state, setState] = useState("idle"); // idle | loading | error | empty

  const submit = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setState("loading");
    try {
      const r = await searchPlace(q.trim(), language);
      setResults(r);
      setState(r.length ? "idle" : "empty");
    } catch {
      setResults([]);
      setState("error");
    }
  };

  const point = pin || (me ? { lat: me[0], lng: me[1], label: t("you_are_here") } : null);

  return (
    <div className="rsq-place-search mb-3">
      <form className="d-flex gap-2 flex-wrap" onSubmit={submit} role="search">
        <button type="button" className={`btn ${me ? "btn-success" : "btn-primary"}`} onClick={onLocate} disabled={locating}>
          📍 {locating ? t("locating") : me ? t("recenter") : t("use_location")}
        </button>
        <input
          className="form-control flex-grow-1"
          style={{ minWidth: 180, flexBasis: 220 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search_place_ph")}
          aria-label={t("search_place_ph")}
        />
        <button className="btn btn-outline-primary" disabled={state === "loading"}>{state === "loading" ? t("loading") : `🔎 ${t("search")}`}</button>
      </form>

      {state === "error" && <div className="small text-danger mt-1">{t("search_error")}</div>}
      {state === "empty" && <div className="small text-muted mt-1">{t("search_empty")}</div>}

      {results.length > 0 && (
        <ul className="list-group mt-2 rsq-place-results">
          {results.map((r, i) => (
            <li key={i} className="list-group-item list-group-item-action small" role="button" tabIndex={0}
              onClick={() => { onPick(r); setResults([]); setQ(r.label.split(",")[0]); }}
              onKeyDown={(e) => e.key === "Enter" && (onPick(r), setResults([]))}>
              {r.label}
            </li>
          ))}
        </ul>
      )}

      {point && (
        <div className="small mt-2 d-flex align-items-center gap-2 flex-wrap">
          <span className="badge text-bg-primary">📌 {point.label.split(",").slice(0, 2).join(",")}</span>
          <a href={`https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`} target="_blank" rel="noreferrer">{t("open_google_maps")} ↗</a>
          {pin && <button type="button" className="btn btn-sm btn-link p-0" onClick={onClear}>{t("clear_pin")}</button>}
        </div>
      )}
    </div>
  );
}

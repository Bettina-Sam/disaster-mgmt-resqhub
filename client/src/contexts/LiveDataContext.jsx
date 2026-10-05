import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getLiveIncidents } from "../services/liveService";

const Ctx = createContext(null);
export const useLiveData = () => useContext(Ctx);

const REFRESH_MS = 5 * 60 * 1000;

/**
 * Loads the live hazard feeds once and shares them with the hero guide and the dashboard.
 * `fresh` holds serious events that appeared since the previous refresh (empty on first load).
 */
export function LiveDataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ sources: [], updatedAt: null, stale: false });
  const [loading, setLoading] = useState(true);
  const [fresh, setFresh] = useState([]);
  const seen = useRef(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const res = await getLiveIncidents({ force });
      setItems(res.items);
      setMeta({ sources: res.sources, updatedAt: res.updatedAt, stale: !!res.stale });
      if (seen.current) {
        setFresh(res.items.filter((i) => !seen.current.has(i._id) && (i.severity === "HIGH" || i.severity === "CRITICAL")));
      }
      seen.current = new Set(res.items.map((i) => i._id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return <Ctx.Provider value={{ items, setItems, meta, loading, load, fresh }}>{children}</Ctx.Provider>;
}

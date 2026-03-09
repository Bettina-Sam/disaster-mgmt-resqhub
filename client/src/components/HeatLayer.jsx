import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.heat"; // registers L.heatLayer on the Leaflet global

export default function HeatLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    const layer = window.L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 17 });
    layer.addTo(map);
    return () => {
      try { layer.remove(); } catch {}
    };
  }, [map, points]);

  return null;
}

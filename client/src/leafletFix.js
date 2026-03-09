import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

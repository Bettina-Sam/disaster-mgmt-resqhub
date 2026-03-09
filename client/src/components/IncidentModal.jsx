import React, { useMemo } from "react";

const sevClass = (s) =>
  ({
    LOW: "badge-sev-low",
    MEDIUM: "badge-sev-medium",
    HIGH: "badge-sev-high",
    CRITICAL: "badge-sev-critical",
  }[s] || "badge-sev-low");

export default function IncidentModal({
  item,
  onClose,
  onStatusChange,
  onDelete,
  canEdit,
  canDelete,
}) {
const coords = useMemo(() => {
  if (!item) return null;
  const lat = item.coords?.lat ?? item.location?.lat;
  const lng = item.coords?.lng ?? item.location?.lng;
  return (lat || lat === 0) && (lng || lng === 0) ? [lat, lng] : null;
}, [item]);


  if (!item) return null;

  const googleMapsUrl = coords ? `https://www.google.com/maps?q=${coords[0]},${coords[1]}` : null;
  const onChange = (e) => onStatusChange?.(item._id, e.target.value);
  const del = () => { if (window.confirm("Delete this incident?")) onDelete?.(item._id); };

  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1050 }} onClick={onClose} />
      <div className="card" style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(720px,95vw)", zIndex:1060 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="mb-2">{item.title}</h5>
            <div className="d-flex gap-2 align-items-center">
              <span className="badge text-bg-secondary">{item.type}</span>
              <span className={`badge ${sevClass(item.severity)}`}>{item.severity}</span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-7">
              <div className="mb-2"><b>Description:</b><br/>{item.description || "—"}</div>
              <div className="mb-2"><b>Address:</b> {item.address || "—"}</div>
              <div className="mb-2"><b>Phone:</b> {item.phone || "—"}</div>
              <div className="mb-2"><b>Reported by:</b> {item.reportedBy || "—"}</div>
              <div className="mb-2">
                <b>Created:</b> {new Date(item.createdAt).toLocaleString()}<br/>
                <b>Updated:</b> {new Date(item.updatedAt).toLocaleString()}
              </div>
            </div>
            <div className="col-md-5">
              <div className="mb-2">
                <b>Status:</b>{" "}
                {canEdit ? (
                  <select className="form-select form-select-sm d-inline-block w-auto" value={item.status} onChange={onChange}>
                    <option>OPEN</option><option>ACK</option><option>RESOLVED</option>
                  </select>
                ) : (
                  <span className="badge text-bg-light">{item.status}</span>
                )}
              </div>
              <div className="mb-2">
                <b>Location:</b>{" "}
                {coords ? `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}` : "—"}
              </div>
              {googleMapsUrl && (
                <a className="btn btn-sm btn-outline-primary" href={googleMapsUrl} target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
            {canDelete && <button className="btn btn-outline-danger" onClick={del}>Delete</button>}
          </div>
        </div>
      </div>
    </>
  );
}

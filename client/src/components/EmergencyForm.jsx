// src/components/EmergencyForm.jsx — SHOWCASE MODE (no backend)
import React, { useEffect, useState } from "react";
import HazardIcon from "./HazardIcon";
import MicButton from "./MicButton";
import { toast } from "react-toastify";
import useConfetti from "../hooks/useConfetti";
import { createIncident } from "../services/mockService";
import { useLanguage } from "../contexts/LanguageContext";

const TYPES = ["FLOOD", "FIRE", "EARTHQUAKE", "ACCIDENT", "CYCLONE", "OTHER"];
const SEVERITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const PULSE = {
  FLOOD: "rgba(59,130,246,0.35)",
  FIRE: "rgba(239,68,68,0.35)",
  CYCLONE: "rgba(56,189,248,0.35)",
  EARTHQUAKE: "rgba(245,158,11,0.35)",
  ACCIDENT: "rgba(99,102,241,0.35)",
  OTHER: "rgba(34,197,94,0.35)",
};

export default function EmergencyForm({ onCreated, pickOnMap, setPickOnMap, coords, setPreCoords }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("FLOOD");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { burst } = useConfetti();

  useEffect(() => {
    if (coords && coords.length === 2) {
      setLat(coords[0].toFixed(6));
      setLng(coords[1].toFixed(6));
    }
  }, [coords]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLat(latitude.toFixed(6));
      setLng(longitude.toFixed(6));
      setPreCoords([latitude, longitude]);
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const payload = {
      title,
      type,
      severity,
      status: "OPEN",
      address,
      location: { lat: Number(lat), lng: Number(lng) },
      description,
      reportedBy: reportedBy || "Web Reporter",
      phone,
    };

    if (!payload.title || isNaN(payload.location.lat) || isNaN(payload.location.lng)) {
      toast.warn("Please enter Title, Lat and Lng");
      setSubmitting(false);
      return;
    }

    try {
      // Uses mock service — no backend needed
      const data = await createIncident(payload);
      onCreated?.(data);

      setTitle(""); setAddress(""); setLat(""); setLng("");
      setDescription(""); setType("FLOOD"); setSeverity("MEDIUM");
      setReportedBy(""); setPhone("");

      toast.success("Incident reported successfully ✅");
      if (!localStorage.getItem("rsq:firstSubmit")) {
        burst();
        localStorage.setItem("rsq:firstSubmit", "1");
      }
    } catch (err) {
      toast.error("Could not submit report. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canCreate = Boolean(title?.trim() && lat?.trim() && lng?.trim() && !submitting);

  return (
    <div className="card glass mb-4" style={{ borderLeft: `4px solid ${PULSE[type].replace("0.35", "0.9")}` }}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="mb-0 fw-bold">{t("report_incident")}</h5>
            <div className="small text-muted">{t("demo_mode")}</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <HazardIcon type={type} />
            <span className="badge text-bg-success">{t("demo_active")}</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="row g-3">
          <div className="col-md-7">
            <label className="form-label fw-semibold">{t("form_title")}</label>
            <div className="input-group">
              <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Flood near River Bridge" required />
              <MicButton onResult={(txt) => setTitle((v) => (v ? v + " " : "") + txt)} size="sm" />
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">{t("form_type")}</label>
            <div className="input-group">
              <span className="input-group-text"><HazardIcon type={type} /></span>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">{t("form_severity")}</label>
            <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {SEVERITY.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">{t("form_desc")}</label>
            <div className="input-group">
              <input className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the situation..." />
              <MicButton onResult={(txt) => setDescription((v) => (v ? v + " " : "") + txt)} size="sm" />
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">{t("form_phone")}</label>
            <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 112" />
          </div>
          <div className="col-md-9">
            <label className="form-label fw-semibold">{t("form_address")}</label>
            <input className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Velachery Main Road, Chennai" />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">{t("form_lat")}</label>
            <input className="form-control" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 13.056" />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">{t("form_lng")}</label>
            <input className="form-control" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g. 80.222" />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">{t("form_reported_by")}</label>
            <input className="form-control" value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} placeholder="Your name / source" />
          </div>
          <div className="col-md-2 d-grid">
            <label className="form-label d-none d-md-block">&nbsp;</label>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={useMyLocation}>
              {t("btn_location")}
            </button>
          </div>

          <div className="col-12 d-flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-primary px-4" disabled={!canCreate} style={{ borderRadius: 8 }}>
              {submitting ? "Submitting..." : t("btn_submit")}
            </button>
            <button type="button" className="btn btn-outline-primary" onClick={() => setPickOnMap(true)} style={{ borderRadius: 8 }}>
              {t("btn_pick_map")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

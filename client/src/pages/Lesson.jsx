import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MATERIALS } from "../data/materials";
import { MATERIAL_CONTENT } from "../data/materialContent";
import { useLanguage } from "../contexts/LanguageContext";
import LessonScene from "../components/lesson/LessonScene";
import { hazardForLesson } from "../data/scenes";
import "./lessonsTheme.css";

const TONE = { flood: "l-pill-info", fire: "l-pill-danger", cyclone: "l-pill-primary", quake: "l-pill-warn" };
const LABEL = { flood: "Flood", fire: "Fire", cyclone: "Cyclone", quake: "Earthquake", accident: "Accident" };

export default function Lesson() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const hazard = hazardForLesson(id) || "";

  const meta = React.useMemo(() => (Array.isArray(MATERIALS) ? MATERIALS.find((m) => String(m.id) === String(id)) : null), [id]);
  const content = MATERIAL_CONTENT?.[id] || {};
  const title = meta?.title || "Lesson";
  const level = (meta?.level || "beginner").toLowerCase();
  const duration = meta?.duration ? `${meta.duration} min` : null;

  const [checks, setChecks] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(`lesson:${id}:checks`)) || {}; } catch { return {}; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(`lesson:${id}:checks`, JSON.stringify(checks)); } catch { /* ignore */ }
  }, [checks, id]);
  const toggleCheck = (key) => setChecks((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="l-wrap" data-explain="lesson">
      {/* the hazard game runs in the background while you read */}
      {hazard && <LessonScene key={id} hazard={hazard} />}

      <header className="l-header">
        <div className="l-head-main">
          <h2 className="l-title">{meta?.hero} {title}</h2>
          <div className="l-meta">
            <span className={`l-pill ${TONE[hazard] || ""}`}>{LABEL[hazard] || "General"}</span>
            <span className="l-pill text-capitalize">{level}</span>
            {duration && <span className="l-pill">⏱ {duration}</span>}
          </div>
          {content.intro && <p className="l-intro">{content.intro}</p>}
        </div>
        <div className="l-head-actions">
          <button className="btn btn-primary l-cta" onClick={() => navigate(`/academy/quiz/${id}`)}>{t("take_quiz")}</button>
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>{t("back")}</button>
        </div>
      </header>

      <div className="l-grid">
        {Array.isArray(content.outcomes) && content.outcomes.length > 0 && (
          <section className="l-card l-col-2" aria-labelledby="outcomes-h">
            <h6 id="outcomes-h" className="l-h">{t("learning_outcomes")}</h6>
            <ul className="l-list">{content.outcomes.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </section>
        )}

        {Array.isArray(content.keyTerms) && content.keyTerms.length > 0 && (
          <aside className="l-card" aria-labelledby="terms-h">
            <h6 id="terms-h" className="l-h">{t("key_terms")}</h6>
            <div className="l-tags">{content.keyTerms.map((k, i) => <span key={i} className="l-pill">{k}</span>)}</div>
          </aside>
        )}

        {Array.isArray(content.sections) && content.sections.map((sec, idx) => (
          <section key={idx} className={`l-card ${sec?.wide ? "l-col-2" : ""}`} aria-labelledby={`sec-${idx}`}>
            {sec?.title && <h6 id={`sec-${idx}`} className="l-h">{sec.title}</h6>}
            {Array.isArray(sec?.bullets) && <ul className="l-list">{sec.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
            {Array.isArray(sec?.do) && (
              <div className="l-subblock">
                <div className="l-subtitle">✅ {t("do")}</div>
                <ul className="l-list">{sec.do.map((b, j) => <li key={`d-${j}`}>{b}</li>)}</ul>
              </div>
            )}
            {Array.isArray(sec?.dont) && (
              <div className="l-subblock">
                <div className="l-subtitle">🚫 {t("dont")}</div>
                <ul className="l-list">{sec.dont.map((b, j) => <li key={`x-${j}`}>{b}</li>)}</ul>
              </div>
            )}
          </section>
        ))}

        {Array.isArray(content.tips) && content.tips.length > 0 && (
          <section className="l-card l-col-2" aria-labelledby="tips-h">
            <h6 id="tips-h" className="l-h">{t("quick_tips")}</h6>
            <div className="l-tips">
              {content.tips.map((x, i) => (
                <div className="l-tip" key={i}><span className="l-tip-emoji" aria-hidden>💡</span><span>{x}</span></div>
              ))}
            </div>
          </section>
        )}

        {Array.isArray(content.checklist) && content.checklist.length > 0 && (
          <section className="l-card l-col-2" aria-labelledby="check-h">
            <h6 id="check-h" className="l-h">{t("checklist")}</h6>
            <ul className="l-check">
              {content.checklist.map((c, i) => {
                const key = `c-${i}`;
                return (
                  <li key={key}>
                    <label className="l-check-row">
                      <input type="checkbox" checked={!!checks[key]} onChange={() => toggleCheck(key)} />
                      <span>{c}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

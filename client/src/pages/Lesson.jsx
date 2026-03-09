import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MATERIALS } from "../data/materials";
import { MATERIAL_CONTENT } from "../data/materialContent";
import "./lessonsTheme.css";
import FireScene from "../components/lesson/FireScene";
import FloodScene from "../components/lesson/FloodScene";
import CycloneScene  from "../components/lesson/CycloneScene";
import AccidentScene from "../components/lesson/AccidentScene";
import EarthquakeScene from "../components/lesson/EarthquakeScene";

export default function Lesson() {
  const { id } = useParams();
// e.g., id = "quake-beginner" or "earthquake-beginner"
const raw = (id?.split("-")[0] || "").toLowerCase();
// Map any "earthquake" slug to "quake" so our checks are consistent
const disaster = raw === "earthquake" ? "quake" : raw;


  const navigate = useNavigate();

  const meta = React.useMemo(
    () => (Array.isArray(MATERIALS) ? MATERIALS.find(m => String(m.id) === String(id)) : null),
    [id]
  );

  const content = MATERIAL_CONTENT?.[id] || {};
  const hero = meta?.hero || "📘";
  const title = meta?.title || "Lesson";
  const level = meta?.level || "beginner";
  const duration = meta?.durationMin ? `${meta.durationMin} min` : null;
  //const disaster = meta?.disaster || "";

  // reveal on scroll (adds .reveal-in)
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add("reveal-in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".l-card").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // checklist state (persists per lesson id)
  const [checks, setChecks] = React.useState(() => {
    try {
      const saved = localStorage.getItem(`lesson:${id}:checks`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  React.useEffect(() => {
    localStorage.setItem(`lesson:${id}:checks`, JSON.stringify(checks));
  }, [checks, id]);

  const toggleCheck = (key) => setChecks(p => ({ ...p, [key]: !p[key] }));

  const startQuiz = () => navigate(`/academy/quiz/${id}`);

  return (
    <div className="l-wrap">
      {/* Sticky header */}
      <header className="l-header g-card">
        <div className="l-hero-float" aria-hidden="true">{hero}</div>
        <div className="l-head-main">
          <h2 className="l-title">{title}</h2>
          <div className="l-meta">
            <span className={`g-pill l-pill ${tone(disaster)}`}>{pretty(disaster)}</span>
            <span className="g-pill text-capitalize">{level}</span>
            {duration && <span className="g-pill">⏱ {duration}</span>}
          </div>
          {content?.intro && <p className="l-intro">{content.intro}</p>}
        </div>
        <div className="l-head-actions">
          <button className="btn btn-primary l-cta" onClick={startQuiz}>Take quiz</button>
          <button className="btn g-btn-soft" onClick={() => navigate(-1)}>Back</button>
        </div>
        
      </header>

      {/* body grid */}
      <div className="l-grid">

        {/* outcomes */}
        {Array.isArray(content.outcomes) && content.outcomes.length > 0 && (
          <section className="l-card l-col-2" aria-labelledby="outcomes-h">
            <h6 id="outcomes-h" className="l-h">Learning outcomes</h6>
            <ul className="l-list">
              {content.outcomes.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </section>
        )}

        {/* key terms */}
        {Array.isArray(content.keyTerms) && content.keyTerms.length > 0 && (
          <aside className="l-card" aria-labelledby="terms-h">
            <h6 id="terms-h" className="l-h">Key terms</h6>
            <div className="l-tags">
              {content.keyTerms.map((k, i) => <span key={i} className="g-pill l-tag">{k}</span>)}
            </div>
          </aside>
        )}

        {/* main sections */}
        {Array.isArray(content.sections) && content.sections.map((sec, idx) => (
          <section key={idx} className={`l-card ${sec?.wide ? "l-col-2" : ""}`} aria-labelledby={`sec-${idx}`}>
            {sec?.title && <h6 id={`sec-${idx}`} className="l-h">{sec.title}</h6>}
            {Array.isArray(sec?.bullets) && (
              <ul className="l-list">
                {sec.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
            {Array.isArray(sec?.do) && (
              <div className="l-subblock">
                <div className="l-subtitle">Do</div>
                <ul className="l-list">
                  {sec.do.map((b, j) => <li key={`d-${j}`}>{b}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(sec?.dont) && (
              <div className="l-subblock">
                <div className="l-subtitle">Don’t</div>
                <ul className="l-list">
                  {sec.dont.map((b, j) => <li key={`x-${j}`}>{b}</li>)}
                </ul>
              </div>
            )}
          </section>
        ))}

        {/* tips / callouts */}
        {Array.isArray(content.tips) && content.tips.length > 0 && (
          <section className="l-card l-col-2" aria-labelledby="tips-h">
            <h6 id="tips-h" className="l-h">Quick tips</h6>
            <div className="l-tips">
              {content.tips.map((t, i) => (
                <div className="l-tip" key={i}>
                  <span className="l-tip-emoji" aria-hidden>💡</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* interactive checklist */}
        {Array.isArray(content.checklist) && content.checklist.length > 0 && (
          <section className="l-card l-col-2" aria-labelledby="check-h">
            <h6 id="check-h" className="l-h">Checklist</h6>
            <ul className="l-check">
              {content.checklist.map((c, i) => {
                const key = `c-${i}`;
                return (
                  <li key={key}>
                    <label className="l-check-row">
                      <input
                        type="checkbox"
                        checked={!!checks[key]}
                        onChange={() => toggleCheck(key)}
                      />
                      <span>{c}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

      </div>
       {disaster && (
      <div style={{ position: "fixed", top: 8, left: 8, zIndex: 9999, color: "#0ff" }}>
        scene: {disaster}
      </div>
    )}
{disaster === "fire"  && <FireScene  key={`fire-${id}`}  />}
{disaster === "flood" && <FloodScene key={`flood-${id}`} />}
{disaster === "cyclone" && <CycloneScene key={`cy-${id}`} mountWithin=".l-wrap" />}
{disaster === "accident" && <AccidentScene key={`ac-${id}`} />}
{disaster === "earthquake" && <EarthquakeScene key={`ac-${id}`} />}

    </div>
  );
}

/* helpers for tags/pills */
function pretty(d) {
  if (!d) return "General";
  if (d === "quake") return "Earthquake";
  return d[0].toUpperCase() + d.slice(1);
}
function tone(d) {
  switch (d) {
    case "flood": return "l-pill-info";
    case "fire": return "l-pill-danger";
    case "cyclone": return "l-pill-primary";
    case "quake": return "l-pill-warn";
    case "accident": return "l-pill-muted";
    default: return "l-pill-muted";
  }
}

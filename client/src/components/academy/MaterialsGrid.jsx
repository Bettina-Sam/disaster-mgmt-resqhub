// client/src/components/academy/MaterialsGrid.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { byDisaster, DISASTERS } from "../../data/materials";
import emojiBurst from "../../utils/emojiBurst";

// simple color chips by level
const levelBadgeClass = (lvl) =>
  ({
    BEGINNER: "badge text-bg-success",
    INTERMEDIATE: "badge text-bg-warning",
    ADVANCED: "badge text-bg-danger",
  }[lvl] || "badge text-bg-secondary");

// small tag chip
const Tag = ({ children }) => (
  <span className="badge rounded-pill text-bg-dark me-1 mb-1">{children}</span>
);

export default function MaterialsGrid() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column gap-4">
      {DISASTERS.map((dis) => {
        const items = (byDisaster[dis] || []).slice(); // copy
        if (!items.length) return null;
        // keep order: Beginner -> Intermediate -> Advanced
        items.sort((a, b) =>
          ["BEGINNER", "INTERMEDIATE", "ADVANCED"].indexOf(a.level) -
          ["BEGINNER", "INTERMEDIATE", "ADVANCED"].indexOf(b.level)
        );

        return (
          <section key={dis}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="mb-0">{dis[0] + dis.slice(1).toLowerCase()}</h5>
              <span className="text-muted small">3 levels • {items.reduce((t, x) => t + x.duration, 0)} mins total</span>
            </div>

            <div className="row g-3">
              {items.map((m) => (
                <div className="col-md-6 col-lg-4" key={m.id}>
                <div className="card h-100 shadow-sm rsq-glass floaty">
                    <div className="card-body d-flex flex-column">
                        
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ fontSize: 26, lineHeight: 1 }}>{m.hero}</div>
                          <h6 className="mb-0">{m.title}</h6>
                        </div>
                        <span className={levelBadgeClass(m.level)}>{m.level}</span>
                      </div>

                      <div className="text-muted small mt-2">{m.summary}</div>

                      <div className="mt-3">
                        {m.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>

                      <div className="mt-auto d-flex flex-wrap align-items-center justify-content-between pt-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge text-bg-secondary">{m.duration} min</span>
                          <span className="badge text-bg-info">{m.badge}</span>
                        </div>
                        <div className="d-flex gap-2">
                         <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={(ev) => {
                          // burst from click point
                          const rect = ev.currentTarget.getBoundingClientRect();
                          emojiBurst({
                            x: rect.left + rect.width / 2,
                            y: rect.top,                 // top of button
                            emoji: m.hero,               // 🌊 🔥 🌍 🌀 🚑
                            count: 16
                          });
                          // then navigate
                          navigate(`/academy/lesson/${m.id}`);
                        }}
                      >
                        Open material
                      </button>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(ev) => {
                          const rect = ev.currentTarget.getBoundingClientRect();
                          emojiBurst({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            emoji: m.hero,
                            count: 16
                          });
                          navigate(`/academy/quiz/${m.id}`);
                        }}
                      >
                        Take quiz
                      </button>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!items.length && (
                <div className="col-12">
                  <div className="text-center text-muted">No materials yet.</div>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

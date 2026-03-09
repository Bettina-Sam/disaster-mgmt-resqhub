// client/src/components/academy/QuizCatalog.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { QUIZZES, DISASTER_EMOJI, DISASTERS, LEVELS } from "../../data/quizzes";
import emojiBurst from "../../utils/emojiBurst";

export default function QuizCatalog() {
  const navigate = useNavigate();

  // simple filters
  const [q, setQ] = React.useState("");
  const [disaster, setDisaster] = React.useState("ALL");
  const [level, setLevel] = React.useState("ALL");

  const list = QUIZZES.filter((z) => {
    if (disaster !== "ALL" && z.disaster !== disaster) return false;
    if (level !== "ALL" && z.level !== level) return false;
    if (q) {
      const hay = (z.title + " " + z.disaster + " " + z.level).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <>
      {/* Filters */}
      <div className="row g-2 align-items-end mb-2">
        <div className="col-md-4">
          <label className="form-label">Search</label>
          <input className="form-control" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search quizzes…" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Disaster</label>
          <select className="form-select" value={disaster} onChange={(e)=>setDisaster(e.target.value)}>
            <option value="ALL">All</option>
            {DISASTERS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Level</label>
          <select className="form-select" value={level} onChange={(e)=>setLevel(e.target.value)}>
            <option value="ALL">All</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="row g-3">
        {list.map((z) => {
          const emoji = DISASTER_EMOJI[z.disaster] || "🎓";
          const estMin = Math.max(6, Math.round(z.questions.length * 1.2)); // rough estimate
          return (
            <div className="col-md-6 col-lg-4" key={z.id}>
              <div className="card h-100 shadow-sm rsq-glass floaty">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ fontSize: 26, lineHeight: 1 }}>{emoji}</div>
                      <h6 className="mb-0">{z.title}</h6>
                    </div>
                    <span className={`badge ${
                      z.level === "BEGINNER" ? "text-bg-success" :
                      z.level === "INTERMEDIATE" ? "text-bg-warning" : "text-bg-danger"
                    }`}>{z.level}</span>
                  </div>

                  <div className="mb-2">
                    <span className="badge text-bg-dark me-1">{z.disaster}</span>
                    <span className="badge text-bg-secondary me-1">{estMin} min</span>
                    <span className="badge text-bg-info">Pass {z.passingScore}%</span>
                  </div>

                  <div className="text-muted small mb-3">
                    {z.questions.length} questions • {z.timeLimit ? `${z.timeLimit} min timed` : "practice allowed"}
                  </div>

                  <div className="mt-auto">
                    <button
                      className="btn btn-primary w-100"
                      onClick={(ev) => {
                        const rect = ev.currentTarget.getBoundingClientRect();
                        emojiBurst({
                          x: rect.left + rect.width/2,
                          y: rect.top,
                          emoji,
                          count: 16
                        });
                        navigate(`/academy/quiz/${z.id}`);
                      }}
                    >
                      Start quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!list.length && (
          <div className="col-12">
            <div className="text-center text-muted">No quizzes match your filters.</div>
          </div>
        )}
      </div>
    </>
  );
}

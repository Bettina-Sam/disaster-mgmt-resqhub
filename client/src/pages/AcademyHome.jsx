// client/src/pages/AcademyHome.jsx
import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import MaterialsGrid from "../components/academy/MaterialsGrid";
import QuizCatalog from "../components/academy/QuizCatalog";

const TABS = ["materials", "quizzes", "games"]; // <-- added games

export default function AcademyHome() {
  const location = useLocation();
  const navigate = useNavigate();

  const search = new URLSearchParams(location.search);
  const initial = TABS.includes(search.get("tab")) ? search.get("tab") : "materials";
  const [tab, setTab] = React.useState(initial);

  const setTabAndUrl = (v) => {
    setTab(v);
    const s = new URLSearchParams(location.search);
    s.set("tab", v);
    navigate({ pathname: location.pathname, search: s.toString() }, { replace: true });
  };

  return (
    <div className="container-xxl page-gap">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">ResQAcademy</h3>
        <span className="badge text-bg-primary">Learn • Quiz • Get certified</span>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3">
        <button type="button"
                className={`btn ${tab === "materials" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setTabAndUrl("materials")}>
          Materials
        </button>
        <button type="button"
                className={`btn ${tab === "quizzes" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setTabAndUrl("quizzes")}>
          Quizzes
        </button>
        {/* NEW: Games tab */}
        <button type="button"
                className={`btn ${tab === "games" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setTabAndUrl("games")}>
          Games
        </button>
      </div>

      {/* Panels */}
      {tab === "materials" ? (
        <MaterialsGrid />
      ) : tab === "quizzes" ? (
        <QuizCatalog />
      ) : (
        // Games promo panel
        <div className="card">
          <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div>
              <h5 className="mb-1">🎮 Academy Games</h5>
              <p className="text-secondary mb-0">
                Play <strong>Go-Bag Pack Dash — Flood</strong>. Drag essentials into the backpack before the timer ends.
              </p>
            </div>
            <Link to="/academy/games" className="btn btn-primary">Play now</Link>
          </div>
        </div>
      )}
    </div>
  );
}

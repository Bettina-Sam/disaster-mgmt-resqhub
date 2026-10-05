// client/src/pages/Games.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../components/games/gamesTheme.css";

import GamesHub from "../components/games/GamesHub";

// Flood
import FloodBeginner from "../components/games/FloodBeginner";
import FloodMedium from "../components/games/FloodMedium";
import FloodAdvanced from "../components/games/FloodAdvanced";

// Fire
import FireBeginner from "../components/games/FireBeginner";
import FireMedium from "../components/games/FireMedium";
import FireAdvanced from "../components/games/FireAdvanced";

// Cyclone
import CycloneBeginner from "../components/games/CycloneBeginner";
import CycloneMedium from "../components/games/CycloneMedium";
import CycloneAdvanced from "../components/games/CycloneAdvanced";

// Quake
import QuakeBeginner from "../components/games/QuakeBeginner";
import QuakeMedium from "../components/games/QuakeMedium";
import QuakeAdvanced from "../components/games/QuakeAdvanced";

// Accident
import AccidentBeginner from "../components/games/AccidentBeginner";
import AccidentMedium   from "../components/games/AccidentMedium";
import AccidentAdvanced from "../components/games/AccidentAdvanced";

import { loadGames, summary, HAZARDS, LEVELS } from "../utils/gameProgress";

const HAZARD_LABEL = { flood: "🌊 Flood", fire: "🔥 Fire", cyclone: "🌀 Cyclone", quake: "🌍 Quake", accident: "🚗 Accident" };

// Which of the 15 games you have won at least once (stored on this device).
function GameProgress() {
  const all = loadGames();
  const s = summary(all);
  return (
    <div className="g-card p-3 mb-3" aria-label="Your game progress">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <strong>Your progress: {s.won} of {s.total} games won</strong>
        <span className="g-muted small">{s.plays} plays · saved on this device</span>
      </div>
      <div className="d-flex flex-wrap gap-3">
        {HAZARDS.map((h) => (
          <div key={h} className="small">
            <span className="me-2">{HAZARD_LABEL[h]}</span>
            {LEVELS.map((l) => {
              const g = all[`${h}-${l}`];
              return (
                <span key={l} title={`${l}: ${g ? `${g.wins} wins / ${g.plays} plays` : "not played"}`} className="me-1">
                  {g?.wins > 0 ? "✅" : g?.plays ? "🟡" : "⬜"}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="g-muted small mt-1">⬜ not played · 🟡 played · ✅ won. Order: beginner, medium, advanced.</div>
    </div>
  );
}

export default function Games() {
  const [screen, setScreen] = useState({ mode: "HUB" }); // HUB | PLAY | COMING
  const loc = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  const start = ({ disaster, level }) => {
    const raw = (disaster || "").toLowerCase().replace(/\s|-/g, "");
    const map = {
      flood: "flood",
      fire: "fire",
      cyclone: "cyclone",
      quake: "quake",
      earthquake: "quake", // alias
      accident: "accident",
    };
    const key = map[raw] || raw;
    if (["flood", "fire", "cyclone", "quake", "accident"].includes(key)) {
      return setScreen({ mode: "PLAY", disaster: key, level });
    }
    return setScreen({ mode: "COMING", disaster });
  };

  const back = () => setScreen({ mode: "HUB" });

  return (
    <div className="games-root">
      <div className="g-wrap">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="mb-0">ResQHub • Games</h3>
          <Link to="/academy" className="btn g-btn-soft btn-sm">Back to Academy</Link>
        </div>

        {screen.mode === "HUB" && <GameProgress />}
        {screen.mode === "HUB" && <GamesHub onStart={start} />}

        {screen.mode === "PLAY" && (
          screen.disaster === "flood" ? (
            screen.level === "beginner" ? <FloodBeginner onExit={back}/> :
            screen.level === "medium"   ? <FloodMedium   onExit={back}/> :
                                          <FloodAdvanced onExit={back}/>
          ) : screen.disaster === "fire" ? (
            screen.level === "beginner" ? <FireBeginner onExit={back}/> :
            screen.level === "medium"   ? <FireMedium   onExit={back}/> :
                                          <FireAdvanced onExit={back}/>
          ) : screen.disaster === "cyclone" ? (
            screen.level === "beginner" ? <CycloneBeginner onExit={back}/> :
            screen.level === "medium"   ? <CycloneMedium   onExit={back}/> :
                                          <CycloneAdvanced onExit={back}/>
          ) : screen.disaster === "quake" ? (
            screen.level === "beginner" ? <QuakeBeginner onExit={back}/> :
            screen.level === "medium"   ? <QuakeMedium   onExit={back}/> :
                                          <QuakeAdvanced onExit={back}/>
          ) : screen.disaster === "accident" ? (
            screen.level === "beginner" ? <AccidentBeginner onExit={back}/> :
            screen.level === "medium"   ? <AccidentMedium   onExit={back}/> :
                                          <AccidentAdvanced onExit={back}/>
          ) : null
        )}

        {screen.mode === "COMING" && (
          <div className="g-card p-4 text-center">
            <h5 className="mb-1">🚧 {screen.disaster} — coming soon</h5>
            <p className="g-muted mb-3">We’ll plug in level-specific games for this disaster next.</p>
            <button className="btn g-btn-soft" onClick={back}>Back to Games</button>
          </div>
        )}
      </div>
    </div>
  );
}

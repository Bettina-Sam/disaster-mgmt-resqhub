import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { SCENES, SCENE_UI } from "../../data/scenes";
import { speak, stopSpeaking } from "../../utils/speech";
import { recordGame } from "../../utils/gameProgress";
import FloodScene from "./FloodScene";
import FireScene from "./FireScene";
import CycloneScene from "./CycloneScene";
import AccidentScene from "./AccidentScene";
import EarthquakeScene from "./EarthquakeScene";
import "./sceneHud.css";

const COMPONENTS = { flood: FloodScene, fire: FireScene, cyclone: CycloneScene, accident: AccidentScene, quake: EarthquakeScene };
const SEEN_KEY = (h) => `rsq:scene-seen:${h}`;

/**
 * The lesson's background game plus its HUD: score, mission, a short "how it works"
 * (also read aloud in the chosen language), and a switch to hide the game.
 */
export default function LessonScene({ hazard }) {
  const { L, language } = useLanguage();
  const sc = SCENES[hazard];
  const Scene = COMPONENTS[hazard];
  const ui = (k) => L(SCENE_UI[k]);

  const [on, setOn] = useState(true);
  const [open, setOpen] = useState(() => {
    try { return !localStorage.getItem(SEEN_KEY(hazard)); } catch { return true; }
  });
  const [saved, setSaved] = useState(0);
  const [lost, setLost] = useState(0);
  const [msg, setMsg] = useState("");
  const [alert, setAlert] = useState(false);
  const [done, setDone] = useState(false);
  const msgTimer = useRef(null);

  const flash = useCallback((text, ms = 3600) => {
    setMsg(text);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMsg(""), ms);
  }, []);

  useEffect(() => {
    if (!sc) return undefined;
    const onEvent = (e) => {
      const d = e.detail || {};
      if (d.hazard !== hazard) return;
      if (d.kind === "save") setSaved((n) => n + 1);
      else if (d.kind === "lose") setLost((n) => n + 1);
      else if (d.kind === "tip") flash(L(sc.tips[d.tip] || sc.tips.default));
      else if (d.kind === "phase") {
        if (d.phase === "shake" || d.phase === "crash") { setAlert(true); if (sc.alert) flash(L(sc.alert), 5200); }
        else setAlert(false);
      }
    };
    window.addEventListener("rsq:scene", onEvent);
    return () => window.removeEventListener("rsq:scene", onEvent);
  }, [hazard, sc, L, flash]);

  useEffect(() => {
    if (sc && !done && saved >= sc.target) {
      setDone(true);
      recordGame(`scene-${hazard}`, true);
      flash(ui("done"), 6000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  useEffect(() => () => { stopSpeaking(); clearTimeout(msgTimer.current); }, []);

  // The how-to opens by itself the first time, then stays out of the way.
  useEffect(() => {
    if (!open) return undefined;
    try { localStorage.setItem(SEEN_KEY(hazard), "1"); } catch { /* ignore */ }
    return undefined;
  }, [open, hazard]);

  if (!sc || !Scene) return null;
  const readAloud = () => speak([L(sc.title), L(sc.goal), ...sc.steps.map(L)].join(". "), language);
  const pct = Math.min(100, (saved / sc.target) * 100);

  return (
    <>
      {on && <Scene key={hazard} />}
      <aside className={`scene-hud ${alert ? "scene-hud-alert" : ""}`} aria-label={L(sc.title)}>
        <div className="scene-hud-bar">
          <span className="scene-hud-title">{sc.emoji} {L(sc.title)}</span>
          <span className="scene-hud-score" title={`${L(sc.save)} / ${L(sc.lose)}`}>⭐ {Math.min(saved, 99)}/{sc.target} · 💔 {lost}</span>
          <button type="button" className="scene-hud-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={ui("how")}>ℹ️</button>
          <button type="button" className="scene-hud-btn" onClick={() => setOn((v) => !v)} aria-pressed={!on} aria-label={on ? ui("hide") : ui("show")} title={on ? ui("hide") : ui("show")}>{on ? "👁️" : "🙈"}</button>
        </div>
        <div className="scene-hud-progress" aria-hidden><i style={{ width: `${pct}%` }} /></div>
        {msg && <div className={`scene-hud-msg ${alert ? "is-alert" : ""}`} role="status">{msg}</div>}
        {open && (
          <div className="scene-hud-how">
            <strong>{ui("mission")}: {L(sc.goal)}</strong>
            <ol>{sc.steps.map((s, i) => <li key={i}>{L(s)}</li>)}</ol>
            <div className="scene-hud-note">{ui("background")}</div>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={readAloud}>🔊 {ui("listen")}</button>
          </div>
        )}
      </aside>
    </>
  );
}

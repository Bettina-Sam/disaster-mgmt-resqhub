import React, { useEffect, useMemo, useState } from "react";
import "./quake-advanced.css";

import AdvUtilitiesPane from "./AdvUtilitiesPane";
import AdvTaggingPane from "./AdvTaggingPane";
import AdvFlowPane from "./AdvFlowPane";
import RiskMeter from "./RiskMeter";
import StepChips from "./StepChips";
import ScoreRing from "./ScoreRing";

export default function QuakeAdvanced({ onExit }) {
  // --------- phases ----------
  const PHASES = ["BRIEF", "UTILITIES", "TAG", "FLOW", "EVENT", "END"];
  const [phase, setPhase] = useState("BRIEF");

  // --------- voice coach ----------
  const [coachOn, setCoachOn] = useState(true);
  function speak(t) {
    if (!coachOn) return;
    try {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-US"; u.rate = 1; u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }
  function toggleCoach() {
    setCoachOn(v => !v);
    try { window.speechSynthesis.cancel(); } catch {}
  }

  // --------- scenario (inline; can move to JSON later) ----------
  const scenario = useMemo(() => ({
    id: "adv_school_lab_spill_01",
    aftershockWindowSec: [60, 90],
    utilitiesOrder: ["electric", "gas", "water"], // correct for this seed
    rooms: [
      { id: "Class-6A", label: "Class 6A", hints: ["ok"],            truth: "GREEN"  },
      { id: "Lab-201",  label: "Lab 201",  hints: ["chem_spill"],     truth: "YELLOW" },
      { id: "CorridorN",label: "Corridor N",hints:["crack_pillar"],   truth: "RED"    },
      { id: "Stairs-E", label: "Stairs E", hints: ["ok"],            truth: "GREEN"  },
    ],
    corridors: [
      { id: "CN-1", label: "North Hall", status: "YELLOW" },
      { id: "CS-1", label: "South Stairs", status: "GREEN" }
    ],
    groups: [
      { id: "G1", label: "Class 6A", size: 24, start: "Class-6A" },
      { id: "G2", label: "Lab Team", size: 3,  start: "Lab-201" }
    ],
    assemblies: [
      { id: "A", name: "Playground" },
      { id: "B", name: "Open Court" },
      { id: "SIP", name: "Shelter-in-Place" }
    ],
    coach: {
      brief: "Power is unstable—first shut utilities, then tag rooms, then guide people.",
      util:  "Turn off electricity, then gas, then water—watch the panel hints.",
      tag:   "Tap rooms and mark Green, Yellow, or Red using the clues.",
      flow:  "Send Green rooms outside. Keep Red rooms put until safe.",
      event: "Aftershock! Pause risky movement through Yellow or Red.",
      win:   "Great leadership! Your choices kept everyone safer.",
      try:   "Good try! Recheck tags and avoid risky corridors when risk is high."
    }
  }), []);

  // --------- run time & risk ----------
  const START_TIME = 120;                        // whole advanced run (sec)
  const [time, setTime] = useState(START_TIME);  // global countdown
  const [risk, setRisk] = useState(0);           // 0..100 Risk Meter
  const [incident, setIncident] = useState(false);

  // --------- data from panes ----------
  const [utilOK, setUtilOK] = useState(null);                // true/false/null
  const [tags, setTags] = useState({});                      // roomId -> tag
  const [placements, setPlacements] = useState({});          // groupId -> targetId

  // --------- scoring summary ----------
  const [score, setScore] = useState({ assess: 0, risk: 0, people: 0, time: 0, total: 0 });
  const [banner, setBanner] = useState(null); // { win, title, sub }

  // coach lines on phase change
  useEffect(() => {
    if (phase === "BRIEF")     speak(scenario.coach.brief);
    if (phase === "UTILITIES") speak(scenario.coach.util);
    if (phase === "TAG")       speak(scenario.coach.tag);
    if (phase === "FLOW")      speak(scenario.coach.flow);
    if (phase === "EVENT")     speak(scenario.coach.event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // global countdown tick
  useEffect(() => {
    if (phase === "END") return;
    const t = setInterval(() => setTime(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // passive risk tick (slow rise)
  useEffect(() => {
    if (phase === "END") return;
    const t = setInterval(() => setRisk(r => Math.min(100, r + 0.25)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // aftershock event trigger when within window or time hits 0
  useEffect(() => {
    const [w0, w1] = scenario.aftershockWindowSec;
    const inWin = time <= w1 && time >= Math.max(0, w0 - 1);
    if ((inWin || time === 0) && phase === "FLOW") {
      // simple one-shot
      setPhase("EVENT");
      // risk spike depends on utilities correctness
      setRisk(r => Math.min(100, r + (utilOK ? 8 : 22)));
      // if moving people through Yellow/Red, mark incident
      const riskyMove = Object.values(placements).some(t => t === "A" || t === "B"); // moved outside
      const hasBadCorridor = scenario.corridors.some(c => c.status !== "GREEN");
      if (riskyMove && hasBadCorridor && risk > 60) {
        setIncident(true);
      }
      // small timeout to move to end
      setTimeout(() => setPhase("END"), 1800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, phase]);

  // compute score at END
  useEffect(() => {
    if (phase !== "END") return;

    // Assessment accuracy (compare tags vs truth)
    const totalRooms = scenario.rooms.length;
    let correct = 0;
    scenario.rooms.forEach(r => { if (tags[r.id] === r.truth) correct += 1; });
    const assessPct = totalRooms ? (correct / totalRooms) * 100 : 0;

    // Risk: start from 100 and subtract final risk + incident penalty
    let riskScore = Math.max(0, 100 - risk - (incident ? 20 : 0));

    // People: outside if room GREEN or via GREEN corridors, else SIP if RED/YELLOW during high risk
    // (MVP heuristic: reward SIP for RED rooms when risk high, reward A/B for GREEN)
    let peopleScore = 100;
    scenario.groups.forEach(g => {
      const dest = placements[g.id];
      const startRoomTruth = scenario.rooms.find(r => r.id === g.start)?.truth;
      if (startRoomTruth === "RED" && (dest === "A" || dest === "B") && risk > 55) peopleScore -= 35;
      if (startRoomTruth === "GREEN" && dest === "SIP") peopleScore -= 15;
      if (!dest) peopleScore -= 20;
    });
    peopleScore = Math.max(0, peopleScore);

    // Time: proportion of time left
    const timeScore = Math.round((time / START_TIME) * 100);

    // Utilities correctness boosts risk score a bit
    if (utilOK) riskScore = Math.min(100, riskScore + 10);

    // Weighted total
    const total = Math.round(0.4 * assessPct + 0.3 * riskScore + 0.2 * peopleScore + 0.1 * timeScore);

    setScore({
      assess: Math.round(assessPct),
      risk: Math.round(riskScore),
      people: Math.round(peopleScore),
      time: timeScore,
      total
    });

    const win = total >= 70 && !incident;
    setBanner({
      win,
      title: win ? "VICTORY" : "TRY AGAIN",
      sub: win ? scenario.coach.win : scenario.coach.try
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // phase controls
  function nextPhase() {
    const i = PHASES.indexOf(phase);
    if (i < PHASES.length - 1) setPhase(PHASES[i + 1]);
  }
  function prevPhase() {
    const i = PHASES.indexOf(phase);
    if (i > 0) setPhase(PHASES[i - 1]);
  }

  // callbacks from panes
  function onUtilitiesDone(orderTried) {
    const ok = JSON.stringify(orderTried) === JSON.stringify(scenario.utilitiesOrder);
    setUtilOK(ok);
    setRisk(r => Math.min(100, r + (ok ? 0 : 12)));
    nextPhase();
  }
  function onTag(roomId, tag) {
    setTags(t => ({ ...t, [roomId]: tag }));
  }
  function onFlowPlace(groupId, targetId) {
    // moving via risky corridors raises risk slightly if already high
    if (phase === "FLOW") setRisk(r => (r > 60 ? Math.min(100, r + 5) : r + 1));
    setPlacements(p => ({ ...p, [groupId]: targetId }));
  }

  // helper
  const mmss = `${String(Math.floor(time / 60)).padStart(2,"0")}:${String(time % 60).padStart(2,"0")}`;

  return (
    <div className="qa-wrap">
      <div className="qa-topbar">
        <div className="qa-title">🪨 Quake — Advanced (RAAM)</div>
        <div className="qa-top-actions">
          <span className="qa-pill">⏱ {mmss}</span>
          <RiskMeter value={risk} />
          <StepChips phases={PHASES} active={phase} />
          <button className={`qa-btn ${coachOn ? "on":""}`} onClick={toggleCoach}>🔊 {coachOn ? "Coach On" : "Coach Off"}</button>
          <button className="qa-btn soft" onClick={onExit}>← Back</button>
        </div>
      </div>

      <div className="qa-main">
        <div className="qa-pane">
          {phase === "BRIEF" && (
            <div className="qa-brief">
              <div className="qa-card">
                <div className="qa-brief-title">Scenario: <b>Lab Spill & Cracked Corridor</b></div>
                <ul className="qa-brief-list">
                  <li>⚡ Lights flicker (power unstable)</li>
                  <li>🧪 Lab bottle spilled (chemical icon)</li>
                  <li>🧱 Corridor has a pillar crack</li>
                </ul>
                <div className="qa-row">
                  <button className="qa-btn cta" onClick={() => setPhase("UTILITIES")}>Start Utilities</button>
                </div>
              </div>
            </div>
          )}

          {phase === "UTILITIES" && (
            <AdvUtilitiesPane correctOrder={scenario.utilitiesOrder} onDone={onUtilitiesDone} />
          )}

          {phase === "TAG" && (
            <AdvTaggingPane rooms={scenario.rooms} tags={tags} onTag={onTag} onNext={nextPhase} />
          )}

          {phase === "FLOW" && (
            <AdvFlowPane
              groups={scenario.groups}
              assemblies={scenario.assemblies}
              corridors={scenario.corridors}
              placements={placements}
              onPlace={onFlowPlace}
              onNext={() => setPhase("EVENT")}
            />
          )}

          {phase === "EVENT" && (
            <div className="qa-center">
              <div className="qa-event">🌐 Aftershock!</div>
              <div className="qa-sub">Hold steady. Avoid moving through risky corridors.</div>
            </div>
          )}

          {phase === "END" && (
            <div className="qa-end">
              <div className={`qa-result ${banner?.win ? "win":"lose"}`}>{banner?.title}</div>
              <div className="qa-sub">{banner?.sub}</div>
              <div className="qa-rings">
                <ScoreRing label="Assessment" value={score.assess} />
                <ScoreRing label="Risk"       value={score.risk} />
                <ScoreRing label="People"     value={score.people} />
                <ScoreRing label="Time"       value={score.time} />
                <ScoreRing label="TOTAL"      value={score.total} big />
              </div>
              <div className="qa-row">
                <button className="qa-btn" onClick={() => window.location.reload()}>Replay</button>
                <button className="qa-btn soft" onClick={onExit}>← Back</button>
              </div>
            </div>
          )}
        </div>

        <div className="qa-side">
          <div className="qa-coach">
            <div className="qa-coach-title">🐿️ Bhumi Coach</div>
            <div className="qa-coach-tip">
              {phase === "BRIEF"     && "Listen: power is unstable; you’ll shut utilities, tag rooms, then guide people."}
              {phase === "UTILITIES" && "Turn off electricity → gas → water. Watch the panel hints."}
              {phase === "TAG"       && "Tap rooms and choose Green, Yellow, or Red using the clues."}
              {phase === "FLOW"      && "Send Green rooms to Assembly. Keep Red rooms sheltered until safe."}
              {phase === "EVENT"     && "Aftershock! Pause risky movement."}
              {phase === "END"       && (banner?.win ? "Great leadership! 🎉" : "Good try—learn and retry.")}
            </div>
          </div>
        </div>
      </div>

      {/* phase change voice nudge */}
      <VoiceHook speak={speak} phase={phase} />
    </div>
  );
}

// tiny helper so speech triggers smoothly after DOM paints
function VoiceHook({ speak, phase }) {
  useEffect(() => {
    // no-op; main component handles exact lines
  }, [phase, speak]);
  return null;
}

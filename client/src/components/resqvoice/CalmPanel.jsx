import React, { useEffect, useMemo, useRef, useState } from "react";
import "./calm.css";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * ResQVoice — Calm Panel (scoped with `.rv-calm` classes)
 * - Floating home tiles for 6 exercises
 * - Lullaby button (WebAudio synth loop)
 * - Animated breathing orb for 4-6 / Box / Resonant
 * - Grounding 5-4-3-2-1 (tappable items + confetti)
 * - Body Scan (2min) with pulse cue
 * - Compassion Break (3 cards with read-aloud)
 */

export default function CalmPanel({ onClose }) {
  const { language: globalLang, t } = useLanguage();
  const langConfig = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };
  const language = langConfig[globalLang] || "en-IN";

  const [view, setView] = useState("home"); // "home" | "breath" | "ground" | "scan" | "compassion"
  const [breathPreset, setBreathPreset] = useState(null); // '4-6' | 'box' | 'resonant'
  const [coach, setCoach] = useState(true); // TTS on/off
  const [playing, setPlaying] = useState(false);
  const [lullabyOn, setLullabyOn] = useState(false);

  // ---- Lullaby (WebAudio) ----
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const lullabyTimerRef = useRef(null);
  const lullabyNotes = useMemo(
    () => [
      261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 392.0, 349.23, // C D E F G A G F
      329.63, 293.66, 261.63, 293.66, 329.63, 293.66              // E D C D E D
    ],
    []
  );

  function startLullaby() {
    if (lullabyOn) return;
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    gain.gain.value = 0.0001; // start muted, fade in
    osc.connect(gain).connect(ctx.destination);
    osc.start();

    oscRef.current = osc;
    gainRef.current = gain;
    setLullabyOn(true);

    // gentle fade-in
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.2);

    // step through notes slowly (2s per note)
    let i = 0;
    lullabyTimerRef.current = setInterval(() => {
      if (!oscRef.current) return;
      const f = lullabyNotes[i % lullabyNotes.length];
      oscRef.current.frequency.setTargetAtTime(f, ctx.currentTime, 0.12);
      i++;
    }, 2000);
  }

  function stopLullaby() {
    setLullabyOn(false);
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    const osc = oscRef.current;
    if (!gain || !osc || !ctx) return;
    try {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
      setTimeout(() => {
        try { osc.stop(); osc.disconnect(); } catch {}
        clearInterval(lullabyTimerRef.current);
        lullabyTimerRef.current = null;
        oscRef.current = null;
        gainRef.current = null;
      }, 750);
    } catch {}
  }

  useEffect(() => () => stopLullaby(), []); // cleanup on unmount

  // ---- TTS (coach) ----
  function speak(txt) {
    if (!coach) return;
    try {
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = language;
      u.rate = 0.95; u.pitch = 1.0; u.volume = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  // ---- Navigation helpers ----
  function openBreath(preset) {
    setBreathPreset(preset);
    setView("breath");
    setPlaying(false);
    // quick intro line
    if (preset === "4-6") speak("We'll breathe in for four and out for six. Ready?");
    if (preset === "box") speak("Box breathing. In four, hold four, out four, hold four.");
    if (preset === "resonant") speak("Resonant breathing. Gentle, steady breaths.");
  }

  // ---- HOME -----------------------------------------------------------------
  if (view === "home") {
    return (
      <div className="rv-calm">
        <div className="rv-card">
          <div className="rv-rowTop">
            <div className="rv-title">🫁 Calm</div>
            <div className="rv-actions">
              <button
                className={`rv-chip ${lullabyOn ? "rv-chip-on" : ""}`}
                onClick={() => (lullabyOn ? stopLullaby() : startLullaby())}
              >
                🎵 {lullabyOn ? "Lullaby On" : "Lullaby"}
              </button>
              <button
                className={`rv-chip ${coach ? "rv-chip-on" : ""}`}
                onClick={() => setCoach(v => !v)}
              >
                🗣️ {coach ? "Coach On" : "Coach Off"}
              </button>
              <button className="rv-close" onClick={onClose}>✕</button>
            </div>
          </div>

          <div className="rv-sub">{t("calm_title")}</div>

          <div className="rv-gridHome">
            <Tile label={t("calm_breathe")} sub="(4-7-8)" emoji="🍃" onClick={() => openBreath("calm")} delay={0} />
            <Tile label={t("calm_panic")} sub="(4-6)" emoji="🫁" onClick={() => openBreath("4-6")} delay={0.12} />
            <Tile label={t("calm_box")} sub="(Box)" emoji="⬜" onClick={() => openBreath("box")} delay={0.24} />
            <Tile label={t("calm_resonant")} sub="(5-5)" emoji="🎵" onClick={() => openBreath("resonant")} delay={0.36} />
            <Tile label={t("calm_grounding")} sub="(5-4-3-2-1)" emoji="🌱" onClick={() => { setView("ground"); speak("Let's ground together. Look around..."); }} delay={0.48} />
            <Tile label={t("calm_scan")} sub="(2 Min)" emoji="🧘" onClick={() => { setView("scan"); speak("We will relax each part of the body."); }} delay={0.6} />
          </div>
        </div>
      </div>
    );
  }

  // ---- BREATH SESSION -------------------------------------------------------
  if (view === "breath") {
    return (
      <BreathSession
        preset={breathPreset}
        playing={playing}
        setPlaying={setPlaying}
        onBack={() => setView("home")}
        speak={speak}
      />
    );
  }

  // ---- GROUNDING ------------------------------------------------------------
  if (view === "ground") {
    return (
      <GroundingSession
        onBack={() => setView("home")}
        speak={speak}
      />
    );
  }

  // ---- BODY SCAN ------------------------------------------------------------
  if (view === "scan") {
    return (
      <BodyScan
        onBack={() => setView("home")}
        speak={speak}
      />
    );
  }

  // ---- COMPASSION -----------------------------------------------------------
  if (view === "compassion") {
    return (
      <Compassion
        onBack={() => setView("home")}
        speak={speak}
      />
    );
  }

  return null;
}

/* ----------------------------- UI Pieces --------------------------------- */

function Tile({ label, sub, emoji, onClick, delay = 0 }) {
  return (
    <button
      className="rv-tile floaty d-flex flex-column align-items-start"
      onClick={onClick}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="rv-emoji mb-2" style={{ fontSize: "2rem" }}>{emoji}</div>
      <div className="rv-ttl fw-bold text-light lh-1">{label}</div>
      {sub && <div className="text-light text-opacity-75 small mt-1">{sub}</div>}
      <div className="rv-spark">✨</div>
    </button>
  );
}

/* --------------------------- Breath Session ------------------------------- */

function BreathSession({ preset, playing, setPlaying, onBack, speak }) {
  const { t } = useLanguage();
  // presets: timings (seconds)
  const timing = useMemo(() => {
    if (preset === "box") return { in: 4, hold: 4, out: 4, hold2: 4 };
    if (preset === "resonant") return { in: 5, hold: 0, out: 5, hold2: 0 };
    if (preset === "calm") return { in: 4, hold: 7, out: 8, hold2: 0 };
    // default 4-6 (Panic Relief)
    return { in: 4, hold: 0, out: 6, hold2: 0 };
  }, [preset]);

  const [phase, setPhase] = useState("ready"); // 'in' | 'hold' | 'out' | 'hold2' | 'ready'
  const [count, setCount] = useState(0);
  const tmRef = useRef(null);

  const totalCycle =
    timing.in + timing.hold + timing.out + timing.hold2 || 1;

  function nextPhase(p) {
    if (p === "ready") return "in";
    if (p === "in")   return timing.hold ? "hold" : "out";
    if (p === "hold") return "out";
    if (p === "out")  return timing.hold2 ? "hold2" : "in";
    if (p === "hold2")return "in";
    return "in";
  }

  function playCycle(start = "in") {
    // guide voice
    if (start === "in") speak(t("breathe_in"));
    if (start === "out") speak(t("breathe_out"));
    if (start === "hold") speak(t("breathe_hold"));
    if (start === "hold2") speak(t("breathe_hold"));

    setPhase(start);
    const duration =
      start === "in" ? timing.in :
      start === "hold" ? timing.hold :
      start === "out" ? timing.out : timing.hold2;

    tmRef.current = setTimeout(() => {
      const np = nextPhase(start);
      if (playing) playCycle(np);
    }, Math.max(1, duration) * 1000);
  }

  function handleStart() {
    if (playing) return;
    setPlaying(true);
    setCount(0);
    setPhase("ready");
    // small delay before first "in"
    setTimeout(() => playCycle("in"), 300);
  }

  function handlePause() {
    setPlaying(false);
    clearTimeout(tmRef.current);
  }

  useEffect(() => () => clearTimeout(tmRef.current), []);

  // visual cycle counter
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setCount(c => c + 1), totalCycle * 1000);
    return () => clearInterval(id);
  }, [playing, totalCycle]);

  const label =
    phase === "in" ? t("breathe_in") :
    phase === "out" ? t("breathe_out") :
    phase === "hold" || phase === "hold2" ? t("breathe_hold") : t("breathe_get_ready");

  const scale =
    phase === "in" ? 1.3 :
    phase === "out" ? 0.75 :
    1.0;

  return (
    <div className="rv-calm">
      <div className="rv-card">
        <div className="rv-rowTop">
          <div className="rv-title d-flex align-items-center gap-2">
            {preset === "box" ? "⬜ Focus Reset (Box)" :
             preset === "resonant" ? "🎵 Quick Recovery (5-5)" :
             preset === "calm" ? "🍃 Calm Breathing (4-7-8)" :
             "🫁 Panic Relief (4-6)"}
          </div>
          <div className="rv-actions">
            <button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={onBack}>← Back</button>
          </div>
        </div>

        <div className="rv-breathWrap d-flex flex-column align-items-center py-5">
          <div className="rv-orbWrap position-relative d-flex justify-content-center align-items-center mb-5 mt-4" style={{ height: "260px" }}>
            {/* Outer ring for visual motion */}
            <div className={`rv-orb-ring ${phase}`} style={{ "--scale": scale }}></div>
            <div
              className={`rv-orb ${phase}`}
              style={{ "--scale": scale }}
            >
              {/* Inner counter (optional) */}
            </div>
            <div className="position-absolute text-white fs-3 fw-bold text-shadow text-center pointer-events-none" style={{ zIndex: 10 }}>
              {label}
            </div>
          </div>
          <div className="rv-caption mb-4 fw-medium text-light text-opacity-75">Cycles Completed: <span className="text-white fw-bold">{count}</span></div>

          <div className="rv-ctrls mt-2">
            {!playing ? (
              <button className="rv-btn" onClick={handleStart}>▶ Start</button>
            ) : (
              <button className="rv-btn rv-alt" onClick={handlePause}>⏸ Pause</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Grounding Session ------------------------------ */

function GroundingSession({ onBack, speak }) {
  const steps = [
    { n: 5, label: "Things you can SEE", emoji: "👀" },
    { n: 4, label: "Things you can HEAR", emoji: "👂" },
    { n: 3, label: "Things you can TOUCH", emoji: "🤲" },
    { n: 2, label: "Things you can SMELL", emoji: "👃" },
    { n: 1, label: "Thing you can TASTE", emoji: "👅" },
  ];
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0);
  const boardRef = useRef(null);

  useEffect(() => {
    speak(`Find ${steps[idx].n} ${steps[idx].label.toLowerCase()}. Tap a star each time.`);
  }, [idx]); // eslint-disable-line

  function burstAt(el) {
    const host = boardRef.current;
    if (!host) return;
    const rect = el.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - hostRect.left;
    const y = rect.top + rect.height / 2 - hostRect.top;

    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span");
      s.className = "rv-burst";
      s.textContent = ["✨","⭐","💫"][i % 3];
      const a = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 30;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.setProperty("--tx", `${Math.cos(a) * r}px`);
      s.style.setProperty("--ty", `${Math.sin(a) * r}px`);
      s.style.setProperty("--rot", `${(Math.random()*40-20)}deg`);
      host.appendChild(s);
      setTimeout(() => host.removeChild(s), 700);
    }
  }

  function tapStar(e) {
    burstAt(e.currentTarget);
    setCount(c => {
      const next = c + 1;
      if (next >= steps[idx].n) {
        setTimeout(() => {
          if (idx < steps.length - 1) {
            setIdx(idx + 1);
            setCount(0);
          } else {
            speak("Great job. You are here and you are safe.");
          }
        }, 200);
      }
      return next;
    });
  }

  return (
    <div className="rv-calm">
      <div className="rv-card">
        <div className="rv-rowTop">
          <div className="rv-title">🌱 5-4-3-2-1 Grounding</div>
          <div className="rv-actions">
            <button className="rv-chip" onClick={onBack}>← Back</button>
          </div>
        </div>

        <div className="rv-panel rv-ground" ref={boardRef}>
          <div className="rv-groundHead">
            <div className="rv-ttl">{steps[idx].emoji} {steps[idx].label}</div>
            <div className="rv-hint">Tap stars: {count} / {steps[idx].n}</div>
          </div>

          <div className="rv-stars">
            {Array.from({ length: steps[idx].n }).map((_, i) => (
              <button key={i} className={`rv-star ${i < count ? "done" : ""}`} onClick={tapStar}>⭐</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Body Scan ---------------------------------- */

function BodyScan({ onBack, speak }) {
  const parts = ["Forehead", "Eyes", "Jaw", "Shoulders", "Arms", "Hands", "Chest", "Belly", "Back", "Hips", "Legs", "Feet"];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    speak(`Relax your ${parts[i]}.`);
    tRef.current = setTimeout(() => {
      setI(p => Math.min(parts.length - 1, p + 1));
    }, 6000);
    return () => clearTimeout(tRef.current);
  }, [i, playing]); // eslint-disable-line

  function start() { setPlaying(true); speak("We will scan the body. Follow my voice."); }
  function pause() { setPlaying(false); }

  return (
    <div className="rv-calm">
      <div className="rv-card">
        <div className="rv-rowTop">
          <div className="rv-title">🧘 Body Scan</div>
          <div className="rv-actions">
            <button className="rv-chip" onClick={onBack}>← Back</button>
          </div>
        </div>

        <div className="rv-scanWrap">
          <div className="rv-silhouette pulse" aria-hidden>🧍‍♂️</div>
          <div className="rv-caption">Relax: <b>{parts[i]}</b></div>

          <div className="rv-ctrls">
            {!playing ? (
              <button className="rv-btn" onClick={start}>▶ Start</button>
            ) : (
              <button className="rv-btn rv-alt" onClick={pause}>⏸ Pause</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Compassion Cards ----------------------------- */

function Compassion({ onBack, speak }) {
  const cards = [
    "This is hard. May I be kind to myself.",
    "I am safe right now. I can breathe slowly.",
    "Feelings come and go. I can take one small step."
  ];
  const [i, setI] = useState(0);

  function next() {
    setI(p => (p + 1) % cards.length);
    speak(cards[(i + 1) % cards.length]);
  }

  function read() { speak(cards[i]); }

  return (
    <div className="rv-calm">
      <div className="rv-card">
        <div className="rv-rowTop">
          <div className="rv-title">💝 Compassion Break</div>
          <div className="rv-actions">
            <button className="rv-chip" onClick={onBack}>← Back</button>
          </div>
        </div>

        <div className="rv-compWrap">
          <div className="rv-compCard floaty">{cards[i]}</div>
          <div className="rv-ctrls">
            <button className="rv-btn" onClick={read}>🔊 Read</button>
            <button className="rv-btn rv-alt" onClick={next}>➡ Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

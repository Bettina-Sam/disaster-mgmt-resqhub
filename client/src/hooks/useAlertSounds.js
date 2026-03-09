// client/src/hooks/useAlertSounds.js
import { useMemo, useRef, useState, useEffect } from "react";

export default function useAlertSounds() {
  const ctxRef = useRef(null);
  const [muted, setMuted] = useState(() => localStorage.getItem("rsq:alerts:muted") === "1");
  useEffect(() => localStorage.setItem("rsq:alerts:muted", muted ? "1" : "0"), [muted]);

  const ensureCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };

  const beep = (freq = 880, dur = 180, vol = 0.15) => {
    const ctx = ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); osc.disconnect(); gain.disconnect(); }, dur);
  };

  // patterns per severity
  const playForIncident = (severity = "LOW") => {
    if (muted) return;
    const s = String(severity).toUpperCase();
    if (s === "CRITICAL") { // triple fast
      beep(920, 180); setTimeout(() => beep(920, 180), 220); setTimeout(() => beep(920, 220), 460);
    } else if (s === "HIGH") { // double
      beep(720, 200); setTimeout(() => beep(720, 220), 260);
    } else if (s === "MEDIUM") { // single
      beep(560, 220);
    } else { // LOW – very soft
      beep(440, 150, 0.09);
    }
  };

  return useMemo(() => ({
    muted,
    toggleMuted: () => setMuted(m => !m),
    playForIncident,
  }), [muted]);
}

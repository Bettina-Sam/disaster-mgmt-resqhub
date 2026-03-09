import { useRef, useState } from "react";

export default function useTTS(lang = "en-IN") {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  const speak = (text, opts = {}) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop current
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = opts.rate ?? 0.97;
    u.pitch = opts.pitch ?? 1.05;
    // pick a voice that matches lang if available
    const match = (window.speechSynthesis.getVoices() || []).find(v => v.lang === lang);
    if (match) u.voice = match;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    try { window.speechSynthesis.cancel(); } catch {}
    setSpeaking(false);
  };

  return { speaking, speak, stop };
}

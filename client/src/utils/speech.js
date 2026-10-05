// Small wrapper around the browser's speech synthesis, shared by the Explain button and the demos.
export const VOICE_LANG = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };

export function pickVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const base = lang.split("-")[0];
  return voices.find((v) => v.lang === lang) || voices.find((v) => v.lang?.toLowerCase().startsWith(base)) || null;
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

/** Speak text in the given UI language ("en" | "hi" | "ta"). Returns false if the device cannot speak. */
export function speak(text, language = "en", { onEnd } = {}) {
  if (!canSpeak() || !text) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const lang = VOICE_LANG[language] || "en-IN";
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const voice = pickVoice(lang);
  if (voice) u.voice = voice;
  u.rate = 0.95;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
  return true;
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

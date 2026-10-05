import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const VOICE_LANG = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };

// Which explanation belongs to which route.
function keyFor(pathname) {
  if (pathname === "/" || pathname === "/dashboard") return "explain_home";
  if (pathname.startsWith("/academy/lesson")) return "explain_lesson";
  if (pathname.startsWith("/academy/quiz")) return "explain_quiz";
  if (pathname.startsWith("/academy/certificate")) return "explain_certificate";
  if (pathname.startsWith("/academy/games")) return "explain_games";
  if (pathname.startsWith("/academy")) return "explain_academy";
  if (pathname.startsWith("/resqvoice")) return "explain_resqvoice";
  return "explain_home";
}

function pickVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const base = lang.split("-")[0];
  return voices.find((v) => v.lang === lang) || voices.find((v) => v.lang?.toLowerCase().startsWith(base)) || null;
}

/**
 * "Explain this page": shows a short explanation of the current page and what to do on it,
 * and reads it aloud in the selected language when the device has a voice for it.
 */
export default function ExplainButton({ compact = false }) {
  const { t, language } = useLanguage();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const utter = useRef(null);

  const stop = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") { setNoVoice(true); return; }
    synth.cancel();
    const lang = VOICE_LANG[language] || "en-IN";
    const voice = pickVoice(lang);
    setNoVoice(!voice);
    const u = new SpeechSynthesisUtterance(t(keyFor(pathname)));
    u.lang = lang;
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utter.current = u;
    setSpeaking(true);
    synth.speak(u);
  }, [language, pathname, t]);

  // Browsers load voices asynchronously; refresh the "no voice" hint when they arrive.
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return undefined;
    const onVoices = () => setNoVoice(!pickVoice(VOICE_LANG[language] || "en-IN"));
    synth.addEventListener?.("voiceschanged", onVoices);
    onVoices();
    return () => synth.removeEventListener?.("voiceschanged", onVoices);
  }, [language]);

  // Stop talking when the page or language changes, or the panel closes.
  useEffect(() => stop, [pathname, language, stop]);
  useEffect(() => { if (!open) stop(); }, [open, stop]);

  return (
    <div className="rsq-explain">
      <button
        type="button"
        className={`btn btn-sm ${compact ? "btn-outline-secondary" : "btn-outline-primary"} rsq-explain-btn`}
        onClick={() => { setOpen((o) => { if (!o) setTimeout(speak, 0); return !o; }); }}
        aria-expanded={open}
        title={t("explain_btn")}
      >
        🔊 <span className="d-none d-lg-inline">{t("explain_btn")}</span>
      </button>

      {open && (
        <div className="rsq-explain-panel" role="dialog" aria-label={t("explain_btn")}>
          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
            <strong>🔊 {t("explain_title")}</strong>
            <button className="btn btn-sm btn-close" onClick={() => setOpen(false)} aria-label={t("close")} />
          </div>
          <p className="mb-2">{t(keyFor(pathname))}</p>
          {noVoice && <p className="small text-warning mb-2">{t("explain_no_voice")}</p>}
          <div className="d-flex gap-2">
            {speaking
              ? <button className="btn btn-sm btn-outline-danger" onClick={stop}>⏹ {t("explain_stop")}</button>
              : <button className="btn btn-sm btn-primary" onClick={speak}>▶ {t("explain_again")}</button>}
          </div>
        </div>
      )}
    </div>
  );
}

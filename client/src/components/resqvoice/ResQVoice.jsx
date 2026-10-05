"use client";
import { useState } from "react";
import "./resqvoice.css";
import { useLanguage } from "../../contexts/LanguageContext";

import HomeTiles from "./HomeTiles";
import TalkPanel from "./TalkPanel";
import CalmPanel from "./CalmPanel";
import GriefPanel from "./GriefPanel";
import ReportPanel from "./ReportPanel";

const TO_VOICE = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };
const FROM_VOICE = { "en-IN": "en", "hi-IN": "hi", "ta-IN": "ta" };

export default function ResQVoice() {
  const { language: siteLang, setLanguage: setSiteLang, t } = useLanguage();
  const [mode, setMode] = useState("home"); // "home" | "talk" | "calm" | "grief" | "report"
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // One language for the whole site: the panels get the matching voice locale.
  const language = TO_VOICE[siteLang] || "en-IN";
  const setLanguage = (l) => setSiteLang(FROM_VOICE[l] || "en");

  return (
    <div className="resqvoice" data-explain="resqvoice">
      <div className="rv-header">
        <div className="rv-header-inner">
          <div className="rv-badge">🛟</div>
          <div className="rv-title">ResQVoice</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button className={`rv-voice ${voiceEnabled ? "" : "off"}`} onClick={() => setVoiceEnabled((v) => !v)} aria-pressed={voiceEnabled}>
              {voiceEnabled ? `🔊 ${t("rv_voice_on")}` : `🔈 ${t("rv_voice_off")}`}
            </button>
          </div>
        </div>
      </div>

      <main className="rv-main">
        {mode === "home" && <HomeTiles onNavigate={setMode} />}

        {mode === "talk" && (
          <TalkPanel
            onClose={() => setMode("home")}
            language={language}
            voiceEnabled={voiceEnabled}
            onMusic={() => {}}
            onNavigate={(session) => setMode(session)}
            onLang={(l) => setLanguage(l)}
          />
        )}

        {mode === "calm" && <CalmPanel onClose={() => setMode("home")} language={language} />}
        {mode === "grief" && <GriefPanel onClose={() => setMode("home")} language={language} />}
        {mode === "report" && <ReportPanel onClose={() => setMode("home")} language={language} voiceEnabled={voiceEnabled} />}
      </main>

      <div className="rv-micbar">
        <div className="rv-mic-inner">
          <button className="rv-mic" aria-label={t("rv_mic_tip")} onClick={() => setMode("talk")}>🎤</button>
          <div className="rv-tip">{t("rv_mic_tip")}</div>
        </div>
      </div>
    </div>
  );
}

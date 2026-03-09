"use client";
import { useState } from "react";
import "./resqvoice.css";

// ✅ USE RELATIVE IMPORTS (no "@/")
import HomeTiles from "./HomeTiles";
import TalkPanel from "./TalkPanel";
import CalmPanel from "./CalmPanel";
import GriefPanel from "./GriefPanel";
import ReportPanel from "./ReportPanel";

export default function ResQVoice() {
  const [mode, setMode] = useState("home");        // "home" | "talk" | "calm" | "grief" | "report"
  const [language, setLanguage] = useState("en-IN");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const lullabyController = (msg) => {
    console.log("lullaby action:", msg);
  };

  return (
    <div className="resqvoice" style={{ background: "#0f1623", minHeight: "100vh", color: "#fff" }}>
      {/* Header */}
      <div className="rv-header">
        <div className="rv-header-inner">
          <div className="rv-badge">🛟</div>
          <div className="rv-title">ResQVoice</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <select className="rv-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en-IN">English</option>
              <option value="ta-IN">தமிழ்</option>
              <option value="hi-IN">हिन्दी</option>
            </select>
            <button
              className={`rv-voice ${voiceEnabled ? "" : "off"}`}
              onClick={() => setVoiceEnabled((v) => !v)}
            >
              {voiceEnabled ? "🔊 Voice On" : "🔈 Voice Off"}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="rv-main">
        {mode === "home"   && <HomeTiles onNavigate={setMode} />}

        {mode === "talk"   && (
          <TalkPanel
            onClose={() => setMode("home")}
            language={language}
            voiceEnabled={voiceEnabled}
            onMusic={(m) => lullabyController(m)}
            onNavigate={(session) => setMode(session)}
            onLang={(l) => setLanguage(l)}
          />
        )}

        {mode === "calm"   && <CalmPanel  onClose={() => setMode("home")} language={language} />}
        {mode === "grief"  && <GriefPanel onClose={() => setMode("home")} language={language} />}
        {mode === "report" && <ReportPanel onClose={() => setMode("home")} language={language} />}
      </main>

      {/* Bottom mic */}
      <div className="rv-micbar">
        <div className="rv-mic-inner">
          <button className="rv-mic" aria-label="Voice mic">🎤</button>
          <div className="rv-tip">
            {language === "ta-IN"
              ? "மைக் தட்டவும். இயல்பாகப் பேசுங்கள்."
              : language === "hi-IN"
              ? "माइक टैप करें और सामान्य रूप से बोलें."
              : "Tap the mic and speak naturally"}
          </div>
        </div>
      </div>
    </div>
  );
}

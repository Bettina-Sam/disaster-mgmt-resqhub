import React, { useEffect, useRef, useState } from "react";
import "./talk.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * ResQVoice — Talk Panel (scoped with `.rv-talk`)
 */
export default function TalkPanel({
  onClose,
  onNavigate,
  onMusic,
  voiceEnabled = true,
}) {
  const { language: globalLang, t } = useLanguage();
  const langConfig = { en: "en-IN", hi: "hi-IN", ta: "ta-IN" };
  const language = langConfig[globalLang] || "en-IN";

  const [coach, setCoach] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [msgs, setMsgs] = useState(() => ([
    { id: 1, role: "assistant", text: t("bot_welcome") }
  ]));
  const boardRef = useRef(null);

  // ------- TTS (Coach)
  function speak(text) {
    if (!voiceEnabled || !coach || !text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language;
      u.rate = 0.98; u.pitch = 1.0; u.volume = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch { }
  }

  // ------- ASR (Mic)
  const recogRef = useRef(null);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = language;
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (e) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalChunk += text;
        else interimChunk += text;
      }
      if (interimChunk) setInterim(interimChunk);
      if (finalChunk) {
        setInterim("");
        handleSend(finalChunk.trim(), true);
      }
    };
    rec.onend = () => setListening(false);
    recogRef.current = rec;
    return () => { try { rec.stop(); } catch { } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  function toggleMic() {
    if (!recogRef.current) {
      setMsgs(m => [...m, { id: Date.now(), role: "assistant", text: t("bot_fallback") }]);
      return;
    }
    if (listening) {
      try { recogRef.current.stop(); } catch { }
      setListening(false);
    } else {
      setInterim("");
      try { window.speechSynthesis.cancel(); } catch { }
      try { recogRef.current.start(); setListening(true); } catch { }
    }
  }

  // ------- Lullaby (fallback if no onMusic)
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const lullabyTimerRef = useRef(null);
  const [lullabyOn, setLullabyOn] = useState(false);

  function startLullabyLocal() {
    if (lullabyOn) return;
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    oscRef.current = osc; gainRef.current = gain;
    setLullabyOn(true);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.2);
    const notes = [261.63, 293.66, 329.63, 349.23, 392, 440, 392, 349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 293.66];
    let i = 0;
    lullabyTimerRef.current = setInterval(() => {
      if (!oscRef.current) return;
      const f = notes[i % notes.length];
      oscRef.current.frequency.setTargetAtTime(f, ctx.currentTime, 0.12);
      i++;
    }, 2000);
  }
  function stopLullabyLocal() {
    setLullabyOn(false);
    const ctx = audioCtxRef.current, gain = gainRef.current, osc = oscRef.current;
    if (!gain || !osc || !ctx) return;
    try {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
      setTimeout(() => {
        try { osc.stop(); osc.disconnect(); } catch { }
        clearInterval(lullabyTimerRef.current);
        lullabyTimerRef.current = null; oscRef.current = null; gainRef.current = null;
      }, 750);
    } catch { }
  }
  useEffect(() => () => stopLullabyLocal(), []);

  function lullaby(action) {
    if (onMusic) {
      if (action === "play") onMusic("play");
      if (action === "stop") onMusic("stop");
    } else {
      if (action === "play") startLullabyLocal();
      if (action === "stop") stopLullabyLocal();
    }
  }

  // ------- Emoji confetti
  function burstAtButton(el, symbols = ["✨", "💫", "⭐"]) {
    const host = boardRef.current; if (!host) return;
    const r = el.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    const x = r.left + r.width / 2 - h.left;
    const y = r.top + r.height / 2 - h.top;
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span");
      s.className = "rv-burst";
      s.textContent = symbols[i % symbols.length];
      const a = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 30;
      s.style.left = `${x}px`; s.style.top = `${y}px`;
      s.style.setProperty("--tx", `${Math.cos(a) * dist}px`);
      s.style.setProperty("--ty", `${Math.sin(a) * dist}px`);
      s.style.setProperty("--rot", `${(Math.random() * 40 - 20)}deg`);
      host.appendChild(s);
      setTimeout(() => host.removeChild(s), 700);
    }
  }

  // ------- Router for quick voice commands
  function handleCommand(text) {
    const t = text.toLowerCase();
    if (t.includes("go to calm")) { onNavigate?.("calm"); return true; }
    if (t.includes("go to grief")) { onNavigate?.("grief"); return true; }
    if (t.includes("report")) { onNavigate?.("report"); return true; }
    if (t.includes("lullaby") || t.includes("lubbly") || t.includes("lubby")) {
      if (t.includes("stop") || t.includes("off")) lullaby("stop");
      else lullaby("play");
      return true;
    }
    if (t.includes("mute")) { setCoach(false); return true; }
    if (t.includes("unmute") || t.includes("speak")) { setCoach(true); return true; }
    return false;
  }

  // ------- Brain: ask API or fallback
  async function askBrain(prompt) {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      console.log("Gemini API Key detected:", !!apiKey);
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Broadened system prompt to allow general questions as requested by user
        let systemPrompt = "You are a helpful and polite AI assistant. While you are part of the ResQHub Disaster Management system, feel free to answer any general questions the user asks creatively and accurately.";
        if (language === "ta-IN") systemPrompt += " Please reply exclusively in Tamil.";
        else if (language === "hi-IN") systemPrompt += " Please reply exclusively in Hindi.";

        const MODEL_NAME = "gemini-2.5-flash";
        console.log("DEBUG: Using API Key (first 5):", apiKey.substring(0, 5));
        console.log("DEBUG: Running generateContent with model:", MODEL_NAME);

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // Combine system prompt and user prompt into one array for maximum compatibility
        const finalPrompt = `System: You are ResQ AI, a helpful assistant. Use Tamil/Hindi if the user does.\nUser: ${prompt}`;

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        return response.text();
      }
    } catch (err) {
      console.error("Gemini API Error details:", err);
      // Return a descriptive error string
      return `ERR_API: ${err.message || "Unknown connection error"}`;
    }

    // Fallback lightweight disaster-management responses
    const p = prompt.toLowerCase();
    if (/flood|water/i.test(p)) {
      return language === "ta-IN"
        ? "வெள்ளத்தின் போது: மின் இணைப்புகளைத் துண்டிக்கவும். உயர்ந்த இடங்களுக்குச் செல்லவும். காய்ச்சப்படாத தண்ணீரை மாசடைந்ததாகக் கருதவும்."
        : "During a flood: Disconnect electrical appliances. Move to higher ground immediately. Do not walk or drive through flood waters.";
    }
    if (/earthquake|shake|quake/i.test(p)) {
      return language === "ta-IN"
        ? "நிலநடுக்கத்தின் போது: முழங்காலிட்டு, மேஜையின் அடியில் தஞ்சம் புகுந்து, அதனைப் பிடித்துக் கொள்ளுங்கள் (Drop, Cover, Hold on)."
        : "During an earthquake: DROP to the ground, take COVER under a sturdy desk or table, and HOLD ON until the shaking stops.";
    }
    if (/fire/i.test(p)) {
      return language === "ta-IN"
        ? "தீ விபத்தின் போது: தரையோடு தரையாக ஊர்ந்து செல்லவும் (புகை மேல் நோக்கி செல்லும்). உடனடியாக 101-ஐ அழைக்கவும்."
        : "During a fire: Crawl low under the smoke to escape. Do not use elevators. Call emergency numbers immediately after escaping.";
    }
    if (/kit|prepare/i.test(p)) {
      return language === "ta-IN"
        ? "ஒரு அடிப்படை அவசரகால தொகுப்பில் (Emergency Kit): தண்ணீர், கெட்டுப்போகாத உணவு, முதலுதவிப் பொருட்கள், டார்ச், மற்றும் பேட்டரிகள் இருக்க வேண்டும்."
        : "An emergency kit should include: Water, non-perishable food, a flashlight, first aid supplies, extra batteries, and important documents.";
    }
    if (/shelter/i.test(p)) {
      return language === "ta-IN"
        ? "அருகிலுள்ள முகாம்களை (Shelters) காண, முகப்புப் பக்கத்தில் உள்ள 'பார்வை வரைபடம்' (View Live Map) முனையை அணுகவும்."
        : "To find nearby active shelters, please check the Live Map on your Dashboard. Local authorities regularly update shelter capacities.";
    }
    if (/cyclone|storm/i.test(p)) {
      return language === "ta-IN"
        ? "புயலின் போது: வீட்டுக்குள்ளேயே ஜன்னல்களிலிருந்து தள்ளி இருக்கவும். வானொலி மற்றும் அதிகாரப்பூர்வ சுற்றறிக்கைகளைத் தொடர்ந்து கவனிக்கவும்."
        : "During a cyclone: Stay indoors and away from windows. Keep your emergency kit handy and tune in to local weather updates.";
    }

    return language === "ta-IN"
      ? "நான் ஒரு செயற்கை நுண்ணறிவு உதவியாளர். வெள்ளம், தீ விபத்து, முதலுதவி போன்ற பேரிடர் மேலாண்மை குறித்த கேள்விகளை எழுப்பவும்."
      : "I am an AI assistant focused on disaster management. Feel free to ask me about flood safety, earthquake protocols, or how to build an emergency kit.";
  }

  // ------- Send handler
  async function handleSend(text, fromVoice = false) {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");

    // Commands first
    if (handleCommand(content)) {
      setMsgs(m => [...m, {
        id: Date.now(), role: "assistant", text:
          language === "ta-IN" ? "சரி! அதைப் செய்கிறேன்." :
            "Okay! Doing that."
      }]);
      return;
    }

    const userMsg = { id: Date.now(), role: "user", text: content };
    setMsgs(m => [...m, userMsg]);

    const host = boardRef.current;
    if (host) {
      const btn = host.querySelector(".rv-send");
      if (btn) burstAtButton(btn, ["💬", "✨", "⭐"]);
    }

    setIsTyping(true);
    // Add artificial delay for local fallback
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const reply = await askBrain(content);
    setIsTyping(false);

    if (reply && reply.startsWith("ERR_API:")) {
      setMsgs(m => [...m, {
        id: Date.now() + 1,
        role: "assistant",
        text: `⚠️ AI Connection Error: ${reply.replace("ERR_API:", "")}. Please verify your API key and network.`
      }]);
      return;
    }

    if (!reply) {
      // This case should ideally not be reached now with ERR_API prefix
      setMsgs(m => [...m, {
        id: Date.now() + 1,
        role: "assistant",
        text: "I'm having trouble connecting to my brain right now. Please check if the API key is valid and you've restarted the server."
      }]);
      return;
    }

    const assistantMsg = { id: Date.now() + 1, role: "assistant", text: reply };
    setMsgs(m => [...m, assistantMsg]);
    speak(reply);
  }

  // Auto-scroll
  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.scrollTop = boardRef.current.scrollHeight;
    }
  }, [msgs, isTyping]);

  const SUGGESTED_PROMPTS = [
    t("bot_prompt_1"),
    t("bot_prompt_2"),
    t("bot_prompt_3"),
    t("bot_prompt_4")
  ];

  return (
    <div className="rv-talk">
      <div className="rv-card">
        <div className="rv-rowTop">
          <div className="rv-title d-flex align-items-center gap-2">
            <span className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: '1rem' }}>🤖</span>
            ResQ AI Assistant
          </div>
          <div className="rv-actions">
            <button
              className={`rv-chip ${coach ? "rv-chip-on" : ""}`}
              onClick={() => setCoach(v => !v)}
              title="Toggle voice coach"
            >
              🔊 {coach ? "TTS On" : "TTS Off"}
            </button>
            <button
              className={`rv-chip ${lullabyOn ? "rv-chip-on" : ""}`}
              onClick={() => { lullaby(lullabyOn ? "stop" : "play"); }}
              title="Play a calming sound"
            >
              🎵 {lullabyOn ? "Chime On" : "Chime"}
            </button>
            <button className="rv-close ps-3 pe-3" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="rv-board d-flex flex-column" ref={boardRef}>
          <div className="flex-grow-1" />
          {msgs.map(m => (
            <div key={m.id} className={`rv-bubble ${m.role}`}>
              {m.role === 'assistant' && <div className="me-2 mt-1 fs-5">🤖</div>}
              <div className="rv-text">{m.text}</div>
            </div>
          ))}

          {isTyping && (
            <div className={`rv-bubble assistant`}>
              <div className="me-2 mt-1 fs-5">🤖</div>
              <div className="rv-text text-secondary d-flex gap-1 align-items-center px-3">
                <span className="spinner-grow spinner-grow-sm" style={{ width: 6, height: 6 }} />
                <span className="spinner-grow spinner-grow-sm animation-delay-1" style={{ width: 6, height: 6 }} />
                <span className="spinner-grow spinner-grow-sm animation-delay-2" style={{ width: 6, height: 6 }} />
              </div>
            </div>
          )}

          {/* Interim transcript chip (live captions) */}
          {interim && (
            <div className="rv-interim" aria-live="polite">🎤 {interim}</div>
          )}
        </div>

        {/* Suggested Prompts */}
        {msgs.length === 1 && !isTyping && (
          <div className="d-flex flex-wrap gap-2 mb-3">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 rsq-hover-lift"
                style={{ fontSize: "0.8rem", borderColor: "rgba(255,255,255,0.2)" }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="rv-compose">
          <button
            className={`rv-mic ${listening ? "rv-pulse" : ""}`}
            onClick={toggleMic}
            title={listening ? "Stop listening" : "Start listening"}
          >
            {listening ? "⏹" : "🎙️"}
          </button>
          <input
            className="rv-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" ? handleSend() : null}
            placeholder={t("bot_placeholder")}
          />
          <button className="rv-btn rv-send" onClick={() => handleSend()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

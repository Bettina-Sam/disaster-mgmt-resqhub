import { useEffect, useState } from "react";
import "./report.css";                 // <-- scoped styles for Report only
import useASR from "../../hooks/useASR";
import useTTS from "../../hooks/useTTS";
import { createReport } from "../../services/liveService";

/** Emergency types */
const TYPES = [
  { id:"flood",      emoji:"🌊", label:{ "en-IN":"Flood","ta-IN":"வெள்ளம்","hi-IN":"बाढ़" } },
  { id:"fire",       emoji:"🔥", label:{ "en-IN":"Fire","ta-IN":"தீ","hi-IN":"आग" } },
  { id:"accident",   emoji:"🚑", label:{ "en-IN":"Accident","ta-IN":"விபத்து","hi-IN":"दुर्घटना" } },
  { id:"earthquake", emoji:"🏚️", label:{ "en-IN":"Earthquake","ta-IN":"பூகம்பம்","hi-IN":"भूकंप" } },
  { id:"other",      emoji:"🆘", label:{ "en-IN":"Other","ta-IN":"மற்றவை","hi-IN":"अन्य" } },
];

export default function ReportPanel({ onClose, language="en-IN", voiceEnabled=true, onSubmitted }) {
  const t = (en, ta, hi) => (language === "ta-IN" ? ta : language === "hi-IN" ? hi : en);

  // wizard & animation direction
  const [step, setStep] = useState(1);
  const [dir, setDir]   = useState("right"); // "right" when going forward, "left" when back

  // data
  const [rtype, setRtype]       = useState(null);
  const [locText, setLocText]   = useState("");
  const [coords, setCoords]     = useState(null);
  const [details, setDetails]   = useState("");
  const [people, setPeople]     = useState(1);
  const [urgency, setUrgency]   = useState(3);
  const [images, setImages]     = useState([]); // [{name, dataUrl, type, size}]
  const [err, setErr]           = useState("");
  const [ready, setReady]       = useState(null); // { message } once the report text is built

  // voice
  const { speaking, speak, stop: stopTTS } = useTTS(language);
  const { supported, listening, interim, finalText, start, stop, setFinalText, setInterim } = useASR(language);

  /* ---------- helpers ---------- */
  const goNext = () => { setDir("right"); setStep(s => Math.min(3, s + 1)); };
  const goBack = () => { setDir("left");  setStep(s => Math.max(1, s - 1)); };

  // Auto-advance after type choose
  const onSelectType = (id) => {
    setRtype(id);
    // give a brief visual feedback then slide
    setTimeout(() => {
      goNext();
      voiceEnabled && speak(t(
        "Where are you right now?",
        "நீங்கள் இப்போது எங்கே?",
        "आप अभी कहाँ हैं?"
      ));
    }, 140);
  };

  // Parallax/tilt for tiles
  const onTileMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100; // 0..100
    const py = ((e.clientY - r.top)  / r.height) * 100;
    e.currentTarget.style.setProperty("--mx", `${px}%`);
    e.currentTarget.style.setProperty("--my", `${py}%`);
    const dx = (px - 50) / 50; // -1..1
    const dy = (py - 50) / 50;
    e.currentTarget.style.transform = `translateY(-6px) rotateY(${dx*6}deg) rotateX(${-dy*6}deg)`;
  };
  const onTileLeave = (e) => { e.currentTarget.style.transform = ""; };

  // First voice line when Report opens
  useEffect(() => {
    if (!voiceEnabled) return;
    speak(t(
      "Tell me what happened. You can choose Flood, Fire, Accident or Earthquake.",
      "என்ன நடந்தது என்று சொல்லுங்கள். வெள்ளம், தீ, விபத்து அல்லது பூகம்பம் தேர்ந்தெடுக்கலாம்.",
      "मुझे बताएं क्या हुआ। बाढ़, आग, दुर्घटना या भूकंप चुनें।"
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fill from ASR
  useEffect(() => {
    if (!finalText) return;
    const text = finalText.trim();

    if (step === 3) {
      setDetails(d => (d ? d + " " : "") + text);
    } else if (step === 1) {
      const l = text.toLowerCase();
      if (l.includes("flood")) onSelectType("flood");
      else if (l.includes("fire")) onSelectType("fire");
      else if (l.includes("accident")) onSelectType("accident");
      else if (l.includes("quake")) onSelectType("earthquake");
    } else if (step === 2) {
      const at = text.toLowerCase().indexOf(" at ");
      if (at > -1) setLocText(text.slice(at + 4).trim());
    }

    setFinalText(""); setInterim("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText]);

  // Step-2: geolocation
  useEffect(() => {
    if (step !== 2) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords || {};
        if (lat && lng) {
          setCoords({ lat, lng });
          setLocText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          voiceEnabled && speak(t("I found your location. You can edit it.",
                                  "உங்கள் இருப்பிடத்தை கண்டேன். மாற்றலாம்.",
                                  "मैंने आपका स्थान पाया। आप बदल सकते हैं।"));
        }
      },
      () => voiceEnabled && speak(t("GPS failed. Please type an area or landmark.",
                                   "இருப்பிடம் பெற முடியவில்லை. பகுதி அல்லது அடையாளம் தட்டச்சு செய்யுங்கள்.",
                                   "GPS नहीं मिला। कृपया क्षेत्र/निशानी लिखें।")),
      { enableHighAccuracy:true, timeout:6000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Mic toggle (dictation)
  const toggleDictation = () => {
    if (speaking) stopTTS(); // barge-in
    if (!supported) { setErr(t("Mic not supported in this browser.","இந்த உலாவியில் மைக் ஆதரவு இல்லை.","इस ब्राउज़र में माइक समर्थित नहीं है।")); return; }
    listening ? stop() : start();
  };

  // Image picking + compression
  const onPickPhotos = async (e) => {
    setErr("");
    const files = Array.from(e.target.files || []).slice(0, 4);
    const out = [];
    for (const f of files) {
      if (!/^image\//.test(f.type)) continue;
      if (f.size > 5 * 1024 * 1024) { setErr(t("Image too large (max 5MB).","படம் மிகப் பெரியது (அதி.5MB).","चित्र बहुत बड़ा (अधिक.5MB)।")); continue; }
      const dataUrl = await toScaledDataURL(f, 900);
      out.push({ name: f.name, type: f.type, size: f.size, dataUrl });
    }
    setImages(prev => [...prev, ...out].slice(0, 4));
  };

  async function toScaledDataURL(file, maxDim=900) {
    const buf  = await file.arrayBuffer();
    const blob = new Blob([buf], { type: file.type });
    const url  = URL.createObjectURL(blob);
    const img  = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = url; });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, w, h);
    const data = c.toDataURL("image/jpeg", 0.82);
    URL.revokeObjectURL(url);
    return data;
  }

  // Step-2 → Step-3 guard
  const nextFromLoc = () => {
    if (!locText.trim()) {
      voiceEnabled && speak(t("Please tell me where you are.","நீங்கள் எங்கே என்று சொல்லுங்கள்.","कृपया बताएं आप कहाँ हैं।"));
      return;
    }
    goNext();
    voiceEnabled && speak(t("Add a short note. Tap the mic to speak.","சிறிய குறிப்பைச் சேர்க்கவும். பேச மைக் தட்டவும்.","छोटी जानकारी जोड़ें। बोलने के लिए माइक दबाएँ।"));
  };

  // Submit
  const submit = async () => {
    if (!details.trim()) {
      voiceEnabled && speak(t("Please add a few details.","சில விவரங்களைச் சேர்க்கவும்.","कृपया कुछ विवरण जोड़ें।"));
      return;
    }
    // There is no dispatch backend, so this builds a message the user sends themselves.
    const typeLabel = TYPES.find((x) => x.id === rtype)?.label?.[language] || "";
    const mapLink = coords ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}` : "";
    const message = [
      `🆘 ${typeLabel}`,
      `📍 ${locText}${mapLink ? " " + mapLink : ""}`,
      details,
      `👥 ${people} · ${t("Urgency","அவசரம்","आपात")} ${urgency}/5`,
    ].join("\n");
    // Also keep it on this device as an unverified marker, if we know where it is.
    if (coords) {
      createReport({
        title: `${typeLabel}: ${details.slice(0, 60)}`,
        type: rtype === "earthquake" ? "EARTHQUAKE" : rtype === "other" ? "OTHER" : String(rtype).toUpperCase(),
        severity: urgency >= 5 ? "CRITICAL" : urgency >= 4 ? "HIGH" : urgency >= 3 ? "MEDIUM" : "LOW",
        description: details,
        address: locText,
        location: { lat: coords.lat, lng: coords.lng },
        reportedBy: "ResQVoice",
      });
    }
    setReady({ message });
    voiceEnabled && speak(t("Your report is ready. Please call 112 now and share this message.",
                            "உங்கள் அறிக்கை தயார். இப்போதே 112-ஐ அழைத்து இந்தச் செய்தியைப் பகிருங்கள்.",
                            "आपकी रिपोर्ट तैयार है। अभी 112 पर कॉल करें और यह संदेश साझा करें।"));
  };

  const copyMsg = async () => { try { await navigator.clipboard.writeText(ready.message); setErr(t("Copied","நகலெடுக்கப்பட்டது","कॉपी हो गया")); } catch { setErr(t("Could not copy","நகலெடுக்க முடியவில்லை","कॉपी नहीं हो सका")); } };

  if (ready) {
    const enc = encodeURIComponent(ready.message);
    return (
      <div className="rv-report">
        <div className="card">
          <div className="heading" style={{ justifyContent: "space-between" }}>
            <div>✅ {t("Your report is ready","உங்கள் அறிக்கை தயார்","आपकी रिपोर्ट तैयार है")}</div>
            <button className="chip" onClick={onClose}>✕</button>
          </div>
          <div className="panel" style={{ display: "grid", gap: 12 }}>
            <div className="err" style={{ background: "rgba(239,68,68,.15)" }}>
              {t("ResQHub cannot send help. For a real emergency, call 112 now and read or share this message.",
                 "ResQHub உதவி அனுப்ப முடியாது. உண்மையான அவசரத்தில் இப்போதே 112-ஐ அழைத்து இந்தச் செய்தியைப் படியுங்கள் அல்லது பகிருங்கள்.",
                 "ResQHub मदद नहीं भेज सकता। असली आपात स्थिति में अभी 112 पर कॉल करें और यह संदेश पढ़ें या साझा करें।")}
            </div>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{ready.message}</pre>
            <div className="row-actions" style={{ flexWrap: "wrap" }}>
              <a className="btn" href="tel:112">📞 112</a>
              <a className="btn alt" href={`https://wa.me/?text=${enc}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>
              <a className="btn alt" href={`sms:?&body=${enc}`}>✉️ SMS</a>
              <button className="btn alt" onClick={copyMsg}>📋 {t("Copy","நகலெடு","कॉपी")}</button>
            </div>
            {err && <div className="hint">{err}</div>}
            <div className="hint">{t("A copy is also on the dashboard map, marked unverified (this device only).",
                                      "ஒரு நகல் டாஷ்போர்டு வரைபடத்திலும் சரிபார்க்கப்படாததாகக் குறிக்கப்பட்டுள்ளது (இந்த சாதனத்தில் மட்டும்).",
                                      "एक प्रति डैशबोर्ड के नक्शे पर भी असत्यापित के रूप में है (केवल इसी डिवाइस पर)।")}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rv-report">
      <div className="card">

        {/* Heading */}
        <div className="heading" style={{ justifyContent:"space-between" }}>
          <div>🛟 {t("Report Emergency","அவசரநிலை அறிக்கை","आपातकाल रिपोर्ट")}</div>
          <button className="chip" onClick={onClose}>✕</button>
        </div>

        {/* Stepper */}
        <div className="steps">
          {[1,2,3].map(n => <div key={n} className={`step ${step>=n ? "active":""}`}>{n}</div>)}
        </div>

        {/* STEP 1 — TYPE (auto-advance) */}
        {step === 1 && (
          <div className={`stage ${dir==="left" ? "left":""}`}>
            <div className="title">{t("What type of emergency?","எந்த வகை அவசரநிலை?","किस प्रकार की आपातकाल?")}</div>

            <div className="grid">
              {TYPES.map(tp => (
                <div
                  key={tp.id}
                  role="button"
                  tabIndex={0}
                  className={`tile ${rtype===tp.id ? "selected":""}`}
                  onClick={() => onSelectType(tp.id)}
                  onKeyDown={(e)=> (e.key==="Enter"||e.key===" ") && onSelectType(tp.id)}
                  onMouseMove={onTileMove}
                  onMouseLeave={onTileLeave}
                >
                  <div className="tile-emoji">{tp.emoji}</div>
                  <div className="tile-title">{tp.label[language]}</div>
                </div>
              ))}
            </div>

            {/* Kept for accessibility (keyboard users) */}
            <div className="row-actions">
              <button className="btn" onClick={() => rtype ? nextFromLoc() : onSelectType("other")}>
                {t("Next","அடுத்து","अगला")}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — LOCATION */}
        {step === 2 && (
          <div className={`stage ${dir==="left" ? "left":""}`}>
            <div className="title">{t("Where are you?","நீங்கள் எங்கே இருக்கிறீர்கள்?","आप कहाँ हैं?")}</div>

            <div className="panel" style={{ display:"grid", gap:12 }}>
              <input
                className="input"
                value={locText}
                onChange={(e)=> setLocText(e.target.value)}
                placeholder={t("Area or landmark (you can edit)","பகுதி அல்லது அடையாளம் (மாற்றலாம்)","क्षेत्र या निशानी (बदल सकते हैं)")}
              />
              <div className="panel gps">
                {coords ? `📍 ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                        : t("Trying GPS…","இருப்பிடத்தைப் பெற முயற்சி…","GPS मिल रहा है…")}
              </div>
            </div>

            <div className="row-actions">
              <button className="btn alt" onClick={goBack}>{t("Back","பின்னால்","वापस")}</button>
              <button className="btn" onClick={nextFromLoc}>{t("Next","அடுத்து","अगला")}</button>
            </div>
          </div>
        )}

        {/* STEP 3 — DETAILS */}
        {step === 3 && (
          <div className={`stage ${dir==="left" ? "left":""}`}>
            <div className="title">{t("Additional details","கூடுதல் விவரங்கள்","अतिरिक्त विवरण")}</div>

            <div className="panel" style={{ display:"grid", gap:12 }}>
              <textarea
                className="textarea"
                value={details}
                onChange={(e)=> setDetails(e.target.value)}
                placeholder={t("Tell us what happened (you can speak too)","என்ன நடந்தது (நீங்கள் பேசலாம்)","क्या हुआ (आप बोल भी सकते हैं)")}
              />

              {/* mic row */}
              <div className="mic-row">
                <button className={`mic ${listening ? "pulse":""}`} onClick={toggleDictation} aria-label="dictation">
                  {listening ? "⏹" : "🎙️"}
                </button>
                <div className="hint">
                  {listening
                    ? (interim ? `🎤 ${interim}` : t("Listening… speak clearly.","கேட்கிறேன்… தெளிவாகப் பேசுங்கள்.","सुन रहा हूँ… साफ बोलें।"))
                    : t("Tap mic to speak your note.","குறிப்பை பேச மைக் தட்டவும்.","नोट बोलने के लिए माइक दबाएँ।")}
                </div>
              </div>

              {/* photos */}
              <div className="photos">
                <label className="chip picker">
                  📷 {t("Add photo","புகைப்படம் சேர்க்க","फोटो जोड़ें")}
                  <input type="file" accept="image/*" multiple onChange={onPickPhotos} style={{ display:"none" }}/>
                </label>
                <div className="thumbs">
                  {images.map((im,i)=>(
                    <div key={i} className="thumb" title={im.name}><img src={im.dataUrl} alt={`evidence-${i}`} /></div>
                  ))}
                </div>
              </div>

              {/* people / urgency */}
              <div className="row">
                <label className="hint">{t("People","மக்கள்","लोग")}</label>
                <input className="num" type="number" min={0} max={50}
                  value={people} onChange={(e)=> setPeople(Math.max(0, Math.min(50, Number(e.target.value)||0)))} />
                <label className="hint">{t("Urgency","அவசரம்","आपात")}</label>
                <input className="range" type="range" min={1} max={5}
                  value={urgency} onChange={(e)=> setUrgency(Number(e.target.value))} />
              </div>

              {err && <div className="err">{err}</div>}
            </div>

            <div className="hint agree">
              {t("Nothing is sent from this app. You choose how to share the message.",
                 "இந்த செயலியிலிருந்து எதுவும் அனுப்பப்படாது. செய்தியை எப்படிப் பகிர்வது என்பதை நீங்கள் தேர்ந்தெடுக்கலாம்.",
                 "इस ऐप से कुछ नहीं भेजा जाता। संदेश कैसे साझा करना है, यह आप चुनते हैं।")}
            </div>

            <div className="row-actions">
              <button className="btn alt" onClick={goBack}>{t("Back","பின்னால்","वापस")}</button>
              <button className="btn" onClick={submit}>{t("Create message","செய்தியை உருவாக்கு","संदेश बनाएँ")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

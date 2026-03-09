import React from "react";

export default function MicButton({ onResult, lang = "en-IN", size = "sm" }) {
  const [listening, setListening] = React.useState(false);
  const recogRef = React.useRef(null);

  const SR = (typeof window !== "undefined")
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  const toggle = () => {
    if (!SR) return alert("Speech recognition not supported in this browser.");
    if (!listening) {
      const r = new SR();
      recogRef.current = r;
      r.lang = lang;
      r.interimResults = true;
      r.continuous = true;

      r.onresult = (e) => {
        let finalChunk = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalChunk += res[0].transcript + " ";
        }
        if (finalChunk) {
          onResult?.(finalChunk.trim());
        }
      };
      r.onerror = () => {/* ignore simple errors */};
      r.onend = () => setListening(false);

      r.start();
      setListening(true);
    } else {
      try { recogRef.current?.stop(); } catch {}
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-outline-${listening ? "danger" : "secondary"} btn-${size}`}
      onClick={toggle}
      title={listening ? "Stop recording" : "Dictate with microphone"}
    >
      {listening ? "Stop 🎤" : "Dictate 🎤"}
    </button>
  );
}

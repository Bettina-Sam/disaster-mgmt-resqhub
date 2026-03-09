import { useEffect, useRef, useState } from "react";

export default function useASR(lang = "en-IN") {
  const recRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    recRef.current = rec;
    rec.lang = lang;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    let lastResultTs = Date.now();
    const SILENCE_MS = 1100; // no cut off; we stop ourselves below

    const onresult = (e) => {
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          setFinalText((prev) => (prev ? prev + " " + t : t));
          setInterim("");
        } else {
          interimChunk += t;
        }
      }
      setInterim(interimChunk);
      lastResultTs = Date.now();
    };

    const onend = () => {
      setListening(false);
      // if user stopped speaking and we still had interim, push it
      if (interim && !finalText) {
        setFinalText(interim.trim());
        setInterim("");
      }
    };

    rec.onresult = onresult;
    rec.onend = onend;
    rec.onerror = () => setListening(false);

    // manual silence watcher (stop if quiet for a while)
    const iv = setInterval(() => {
      if (!listening) return;
      if (Date.now() - lastResultTs > SILENCE_MS) {
        try { rec.stop(); } catch {}
      }
    }, 250);

    return () => clearInterval(iv);
  }, [lang, listening, interim, finalText]);

  const start = () => {
    if (!supported || listening) return;
    setFinalText("");
    setInterim("");
    try {
      window.speechSynthesis.cancel(); // barge-in
      recRef.current.lang = lang;
      recRef.current.start();
      setListening(true);
    } catch {}
  };

  const stop = () => {
    if (!listening) return;
    try { recRef.current.stop(); } catch {}
  };

  return { supported, listening, interim, finalText, start, stop, setFinalText, setInterim };
}

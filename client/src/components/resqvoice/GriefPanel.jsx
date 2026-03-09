import React, { useEffect, useRef, useState } from "react";
import "./grief.css";

/**
 * ResQVoice — Grief Panel (scoped with `.rv-grief`)
 * Sections:
 *  - Sit with me (2min)          → soft timer + pulsing heart orb
 *  - Talk about them             → prompt list + voice readback button
 *  - 60s Grounding               → quick star taps + confetti burst
 *  - Write a message             → journaling card with autosave
 *  - Compassion Script           → 3 rotating cards (+ TTS)
 *  - Talk to counselor           → CTA (you can wire to your help flow)
 */

export default function GriefPanel({ onClose }) {
  const [view, setView] = useState("home"); // home | sit | talk | ground | write | compassion
  const [coach, setCoach] = useState(true);

  function speak(text) {
    if (!coach) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95; u.pitch = 1.0; u.volume = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  return (
    <div className="rv-grief">
      {view === "home" && (
        <div className="rv-card">
          <div className="rv-rowTop">
            <div className="rv-title">💗 I’m here for you</div>
            <div className="rv-actions">
              <button
                className={`rv-chip ${coach ? "rv-chip-on" : ""}`}
                onClick={() => setCoach(v => !v)}
              >
                🔊 {coach ? "Coach On" : "Coach Off"}
              </button>
              <button className="rv-close" onClick={onClose}>✕</button>
            </div>
          </div>

          <div className="rv-sub">Take all the time you need. Choose anything below.</div>

          <div className="rv-gridHome">
            <Tile emoji="🤝" label="Sit with me (2 min)" onClick={() => { setView("sit"); speak("We can sit together for a little while."); }} delay={0}/>
            <Tile emoji="💬" label="Talk about them" onClick={() => { setView("talk"); speak("You can share a memory. I’m listening."); }} delay={0.1}/>
            <Tile emoji="🌱" label="60s Grounding" onClick={() => { setView("ground"); speak("Let’s feel present and safe."); }} delay={0.2}/>
            <Tile emoji="✍️" label="Write a message" onClick={() => { setView("write"); speak("Write anything to them or to yourself."); }} delay={0.3}/>
            <Tile emoji="💝" label="Compassion Script" onClick={() => { setView("compassion"); speak("Let’s practice being kind to ourselves."); }} delay={0.4}/>
            <Tile emoji="📞" label="Talk to counselor" onClick={() => { speak("I can help you connect to a counselor."); alert("Open your counselor/help flow here."); }} delay={0.5}/>
          </div>

          <QuoteBar />
        </div>
      )}

      {view === "sit"        && <SitWithMe onBack={() => setView("home")} speak={speak} />}
      {view === "talk"       && <TalkAbout onBack={() => setView("home")} speak={speak} />}
      {view === "ground"     && <QuickGround onBack={() => setView("home")} speak={speak} />}
      {view === "write"      && <WriteMessage onBack={() => setView("home")} speak={speak} />}
      {view === "compassion" && <Compassion onBack={() => setView("home")} speak={speak} />}
    </div>
  );
}

/* ========================= Home pieces ========================= */

function Tile({ emoji, label, onClick, delay=0 }) {
  return (
    <button className="rv-tile floaty" onClick={onClick} style={{animationDelay: `${delay}s`}}>
      <div className="rv-emoji">{emoji}</div>
      <div className="rv-ttl">{label}</div>
      <div className="rv-spark">✨</div>
    </button>
  );
}

function QuoteBar() {
  return (
    <div className="rv-quote floaty-slow">
      <span className="rv-quote-emoji">💜</span>
      <span className="rv-quote-text">
        It’s okay to feel what you’re feeling. Grief is love with nowhere to go.
      </span>
    </div>
  );
}

/* ========================= Sit with me ========================= */

function SitWithMe({ onBack, speak }) {
  const [playing, setPlaying] = useState(false);
  const [sec, setSec] = useState(120); // 2min
  useEffect(() => {
    let id;
    if (playing && sec > 0) {
      id = setInterval(() => setSec(s => s - 1), 1000);
    }
    if (playing && sec % 10 === 0 && sec > 0) speak("I’m here with you.");
    return () => clearInterval(id);
  }, [playing, sec]); // eslint-disable-line

  function start() { setPlaying(true); speak("Let’s sit together for two minutes. You’re not alone."); }
  function pause() { setPlaying(false); speak("We can pause and breathe."); }
  const m = Math.floor(sec / 60).toString().padStart(1,"0");
  const s = (sec % 60).toString().padStart(2,"0");

  return (
    <div className="rv-card">
      <div className="rv-rowTop">
        <div className="rv-title">🤝 Sit with me</div>
        <div className="rv-actions"><button className="rv-chip" onClick={onBack}>← Back</button></div>
      </div>

      <div className="rv-sitWrap">
        <div className={`rv-heart ${playing ? "beat" : ""}`} aria-hidden>💗</div>
        <div className="rv-timer">{m}:{s}</div>
        <div className="rv-ctrls">
          {!playing ? <button className="rv-btn" onClick={start}>▶ Start</button>
                     : <button className="rv-btn rv-alt" onClick={pause}>⏸ Pause</button>}
        </div>
      </div>
    </div>
  );
}

/* ========================= Talk about them ========================= */

function TalkAbout({ onBack, speak }) {
  const prompts = [
    "What’s one happy memory?",
    "What did they love to do?",
    "What made you laugh together?",
    "If you could tell them one thing right now, what would it be?"
  ];
  const [i, setI] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => { speak(prompts[i]); }, [i]); // eslint-disable-line
  function next() { setI(p => (p + 1) % prompts.length); }
  function read() { speak(note ? note : "You can type a memory here."); }

  return (
    <div className="rv-card">
      <div className="rv-rowTop">
        <div className="rv-title">💬 Talk about them</div>
        <div className="rv-actions"><button className="rv-chip" onClick={onBack}>← Back</button></div>
      </div>

      <div className="rv-talkWrap">
        <div className="rv-prompt floaty">{prompts[i]}</div>
        <textarea
          className="rv-input"
          rows={5}
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          placeholder="Type anything you’d like to share…"
        />
        <div className="rv-ctrls">
          <button className="rv-btn" onClick={read}>🔊 Read back</button>
          <button className="rv-btn rv-alt" onClick={next}>➡ Next prompt</button>
        </div>
      </div>
    </div>
  );
}

/* ========================= 60s Grounding ========================= */

function QuickGround({ onBack, speak }) {
  const [count, setCount] = useState(0);
  const boardRef = useRef(null);

  useEffect(() => { speak("Tap five stars, one by one."); }, []); // eslint-disable-line

  function burstAt(el) {
    const host = boardRef.current; if (!host) return;
    const r = el.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    const x = r.left + r.width/2 - h.left;
    const y = r.top  + r.height/2 - h.top;
    for (let i=0;i<12;i++){
      const s = document.createElement("span");
      s.className = "rv-burst";
      s.textContent = ["✨","⭐","💫"][i%3];
      const a = Math.random()*Math.PI*2;
      const dist = 40 + Math.random()*30;
      s.style.left = `${x}px`; s.style.top = `${y}px`;
      s.style.setProperty("--tx", `${Math.cos(a)*dist}px`);
      s.style.setProperty("--ty", `${Math.sin(a)*dist}px`);
      s.style.setProperty("--rot", `${(Math.random()*40-20)}deg`);
      host.appendChild(s);
      setTimeout(()=>host.removeChild(s),700);
    }
  }

  function tap(e){
    burstAt(e.currentTarget);
    setCount(c=>{
      const n=c+1;
      if(n===5) speak("Great job. You’re safe right now.");
      return n;
    });
  }

  return (
    <div className="rv-card">
      <div className="rv-rowTop">
        <div className="rv-title">🌱 60s Grounding</div>
        <div className="rv-actions"><button className="rv-chip" onClick={onBack}>← Back</button></div>
      </div>

      <div className="rv-panel rv-ground" ref={boardRef}>
        <div className="rv-hint">Tap the stars: {count}/5</div>
        <div className="rv-stars">
          {Array.from({length:5}).map((_,i)=>(
            <button key={i} className={`rv-star ${i<count ? "done":""}`} onClick={tap}>⭐</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================= Write a message ========================= */

function WriteMessage({ onBack, speak }) {
  const KEY="rv-grief-note";
  const [text, setText]=useState(()=>localStorage.getItem(KEY)||"");

  function save(){
    localStorage.setItem(KEY,text);
    speak("Saved. Your message is kept on this device.");
  }

  return (
    <div className="rv-card">
      <div className="rv-rowTop">
        <div className="rv-title">✍️ Write a message</div>
        <div className="rv-actions"><button className="rv-chip" onClick={onBack}>← Back</button></div>
      </div>

      <div className="rv-writeWrap">
        <textarea
          className="rv-input big"
          rows={8}
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Write to them, or to yourself. Anything is okay."
        />
        <div className="rv-ctrls">
          <button className="rv-btn" onClick={save}>💾 Save</button>
          <button className="rv-btn rv-alt" onClick={()=>{setText(""); localStorage.removeItem(KEY);}}>🗑️ Clear</button>
          <button className="rv-btn rv-alt" onClick={()=>speak(text || "The message is empty.")}>🔊 Read</button>
        </div>
      </div>
    </div>
  );
}

/* ========================= Compassion Script ========================= */

function Compassion({ onBack, speak }) {
  const cards = [
    "This hurts because I love. May I be gentle with myself.",
    "It’s okay to rest. I can breathe and take it slow.",
    "I’m doing my best. Small steps are enough today."
  ];
  const [i,setI]=useState(0);
  function read(){ speak(cards[i]); }
  function next(){ setI(p=>(p+1)%cards.length); speak(cards[(i+1)%cards.length]); }

  return (
    <div className="rv-card">
      <div className="rv-rowTop">
        <div className="rv-title">💝 Compassion Script</div>
        <div className="rv-actions"><button className="rv-chip" onClick={onBack}>← Back</button></div>
      </div>

      <div className="rv-compWrap">
        <div className="rv-compCard floaty">{cards[i]}</div>
        <div className="rv-ctrls">
          <button className="rv-btn" onClick={read}>🔊 Read</button>
          <button className="rv-btn rv-alt" onClick={next}>➡ Next</button>
        </div>
      </div>
    </div>
  );
}

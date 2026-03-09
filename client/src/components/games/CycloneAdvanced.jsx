import React, { useEffect, useRef, useState } from "react";
import "./cyclone-advanced.css";

/**
 * Cyclone — Advanced (Rescue Drop)
 * IDLE → PLAN(10s) → PLAY → END
 * - Houses show their need (emoji+label) above them.
 * - You build a drop queue in PLAN (or auto-fill from needs L→R).
 * - In PLAY, each click drops the NEXT kit from your queue.
 * - Bigger house/need/heli visuals + dance animation.
 * - Fixed tip bubble logic (no mutation; safe, indexed updates).
 */

const KIT_TYPES = [
  { id: "water", label: "Water",    emoji: "💧", tip: "Clean drinking water prevents sickness after floods." },
  { id: "meds",  label: "Medicine", emoji: "💊", tip: "Keep medicines dry and with the person who needs them." },
  { id: "food",  label: "Food",     emoji: "🥫", tip: "Dry, ready-to-eat food is best during storms." },
  { id: "torch", label: "Torch",    emoji: "🔦", tip: "Use a torch, not candles, when wind is strong." },
  { id: "pet",   label: "Pet Care", emoji: "🐾", tip: "Pets also need a carrier and food—don’t leave them behind." },
];

const ORDER = ["water","meds","food","pet","torch"]; // seed needs predictably

export default function CycloneAdvanced({ onExit }) {
  // ===== Tweaks =====
  const PLAN_TIME = 10;     // 10s head start
  const PLAY_TIME = 80;
  const BOARD_H   = 360;    // a bit taller for bigger sprites
  const HIT_R     = 28;     // slightly more generous for bigger houses
  const WIND_CAP  = 2.2;

  // ===== State =====
  const [phase, setPhase] = useState("IDLE"); // IDLE | PLAN | PLAY | END
  const [sec, setSec]     = useState(PLAY_TIME);
  const [score, setScore] = useState(0);
  const [wind, setWind]   = useState(1.0);

  // Coach voice
  const [coachOn, setCoachOn] = useState(true);
  function speak(t){
    if (!coachOn) return;
    try {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "en-US"; u.rate = 1; u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }
  function toggleCoach(){ setCoachOn(v=>!v); try{ window.speechSynthesis.cancel(); }catch{} }

  const boxRef = useRef(null);

  // heli + pieces
  const [heli, setHeli] = useState({ x: 40, y: 72, dir: 1 });
  const [kits, setKits] = useState([]);   // {x,y,vy,type}
  const [houses, setHouses] = useState(()=> makeHouses());
  const [queue, setQueue]   = useState([]); // planned order
  const [qIndex, setQIndex] = useState(0);  // index into planned order

  function makeHouses(){
    const arr=[];
    for (let i=0;i<6;i++){
      arr.push({
        x: 90 + i*95 + Math.random()*18,
        y: 245 + Math.random()*24, // a little lower for bigger size
        hit:false,
        need: ORDER[i % ORDER.length],
        tipOn:false,            // transient success tip bubble
      });
    }
    return arr;
  }

  // ===== Phases =====
  function startPlan(){
    setPhase("PLAN");
    setSec(PLAN_TIME);
    setScore(0); setWind(1.0);
    setKits([]); setHouses(makeHouses());
    setQueue([]); setQIndex(0);
    setHeli({ x: 40, y: 72, dir: 1 });
    speak("Planning time. Look at each house's need and tap the kit buttons to set your order.");
  }
  function lockAndPlay(){
    // if queue empty, auto-fill from needs left→right
    if (!queue.length) {
      const needs = houses.map(h=>h.need);
      setQueue(needs);
    }
    setPhase("PLAY");
    setSec(PLAY_TIME);
    setQIndex(0);
    speak("Go! Drops will follow your planned order.");
  }
  function resetAll(){
    setPhase("IDLE");
    setSec(PLAY_TIME);
    setScore(0); setWind(1.0);
    setKits([]); setHouses(makeHouses());
    setQueue([]); setQIndex(0);
    setHeli({ x: 40, y: 72, dir: 1 });
    try { window.speechSynthesis.cancel(); } catch {}
  }

  // ===== Timers =====
  useEffect(()=>{
    if (phase!=="PLAN" && phase!=="PLAY") return;
    const id = setInterval(()=> setSec(s=> s>0 ? s-1 : 0), 1000);
    return ()=> clearInterval(id);
  },[phase]);

  useEffect(()=>{
    if (phase==="PLAN" && sec===0) lockAndPlay();
    if (phase==="PLAY" && sec===0){
      const all = houses.every(h=>h.hit);
      if (!all) finish(false, "Time up", "Try arranging a better order next time.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[sec]);

  // ===== Main Loop (PLAY) — same smooth feel =====
  useEffect(()=>{
    if (phase!=="PLAY") return;
    const tick = setInterval(()=>{
      setWind(w=> Math.min(WIND_CAP, w + 0.02));

      setHeli(h=>{
        const nx = h.x + h.dir * (1.5 + wind*0.7);
        let ndir = h.dir;
        const W = (boxRef.current?.clientWidth || 640);
        if (nx < 30 || nx > W-30) ndir *= -1;
        const ny = 72 + Math.sin(Date.now()/500) * (6 + wind*2);
        return { x: Math.max(30, Math.min(W-30, nx)), y: ny, dir: ndir };
      });

      setKits(arr => arr
        .map(k => ({ ...k, x: k.x + 0.5*wind, y: k.y + k.vy, vy: Math.min(k.vy + 0.6, 8) }))
        .filter(k => k.y < BOARD_H + 30)
      );

      // collisions — IMPORTANT: immutable update (fixes tipOn error)
      setHouses(prev => {
        let changed = false;
        const next = prev.map((h, i) => {
          if (h.hit) return h;
          const hit = kits.find(k => Math.hypot(k.x - h.x, k.y - h.y) < HIT_R);
          if (!hit) return h;

          if (hit.type === h.need) {
            // turn on tip bubble, then turn it off after 1.6s (by index)
            const newH = { ...h, hit: true, tipOn: true };
            changed = true;

            const tip = KIT_TYPES.find(t => t.id === h.need)?.tip;
            if (tip) speak(tip);

            // schedule tipOff safely using index capture
            setTimeout(() => {
              setHouses(current => current.map((hh, j) =>
                j === i ? { ...hh, tipOn: false } : hh
              ));
            }, 1600);

            setScore(s => s + 10);
            return newH;
          } else {
            // wrong kit: no progress; (optional) small voice
            speak("Check the bubble and try the next item.");
            return h;
          }
        });

        if (changed && next.every(hh => hh.hit)) {
          finish(true, "Mission complete!", "All houses received the right supplies.");
        }
        return next;
      });

    }, 60);
    return ()=> clearInterval(tick);
  }, [phase, wind, kits]);

  // ===== Drop uses NEXT item in your queue =====
  const drop = ()=>{
    if (phase!=="PLAY") return;
    const type = queue[qIndex] || queue[queue.length-1] || "water";
    setQIndex(i => Math.min(queue.length, i+1));
    setKits(arr => [...arr, { x: heli.x, y: heli.y+16, vy: 2 + wind*0.4, type }]);
  };

  // ===== PLAN helpers =====
  const addToQueue = (id)=> { if (phase==="PLAN") setQueue(q=> q.length<18 ? [...q,id] : q); };
  const undoQueue  = ()=> { if (phase==="PLAN") setQueue(q=> q.slice(0,-1)); };
  const clearQueue = ()=> { if (phase==="PLAN") setQueue([]); };
  const autofillFromNeeds = ()=> {
    const needs = houses.map(h=>h.need);
    setQueue(needs);
  };

  // ===== UI helpers =====
  const emoji = (id)=> KIT_TYPES.find(k=>k.id===id)?.emoji || "🎒";
  const label = (id)=> KIT_TYPES.find(k=>k.id===id)?.label || id;

  function finish(win,title,sub){
    setPhase("END");
    if (win) {
      // micro-confetti
      const holder=document.createElement("div"); holder.className="confetti"; document.body.appendChild(holder);
      const colors=["#0ea5e9","#34d399","#fbbf24","#a78bfa","#ef4444"];
      for(let i=0;i<110;i++){const p=document.createElement("div"); p.className="p"; p.style.left=Math.random()*100+"vw"; p.style.top=(8+Math.random()*12)+"vh"; p.style.background=colors[i%colors.length]; holder.appendChild(p);}
      setTimeout(()=>holder.remove(),900);
      speak("Great work! Mission complete.");
    } else {
      speak("Time's up. We can try again.");
    }
  }

  return (
    <div className="g-card p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h5 className="mb-0">🌪️ Cyclone — Advanced (Rescue Drop)</h5>
          <small className="g-muted">
            {phase==="IDLE" && <>Look at each house’s need, arrange your drop order, then start.</>}
            {phase==="PLAN" && <>Plan: tap items to build your order • auto-start in <b>{sec}s</b>.</>}
            {phase==="PLAY" && <>Play: click/tap to drop 🎒 — follows your planned order.</>}
            {phase==="END" && <>Round finished.</>}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="g-pill">⏱ {sec}s</span>
          <span className="g-pill">⭐ {score}</span>
          <button className={`btn ${coachOn ? "coach-on" : ""}`} onClick={toggleCoach}>🔊 {coachOn ? "Coach On" : "Coach Off"}</button>
          {phase==="IDLE" && <button className="btn cta-btn btn-sm" onClick={startPlan}>Start</button>}
          {phase==="PLAN" && (
            <>
              <button className="btn btn-sm" onClick={autofillFromNeeds}>Auto-fill from needs</button>
              <button className="btn cta-btn btn-sm" onClick={lockAndPlay}>Lock order & Play</button>
            </>
          )}
          {phase==="PLAY" && <button className="btn btn-outline-danger btn-sm" onClick={()=>setPhase("END")}>Stop</button>}
        </div>
      </div>

      {/* kit bar & queue */}
      <div className="kitbar">
        {KIT_TYPES.map(t=>(
          <button key={t.id}
                  className={`g-btn chip ${phase!=="PLAN"?"disabled":""}`}
                  onClick={()=>addToQueue(t.id)}
                  disabled={phase!=="PLAN"}
                  title={t.label}>
            <span className="emo-lg">{t.emoji}</span>
            <span className="lab">{t.label}</span>
          </button>
        ))}
        <button className="g-btn chip soft" onClick={undoQueue} disabled={phase!=="PLAN"}>↩ Undo</button>
        <button className="g-btn chip soft" onClick={clearQueue} disabled={phase!=="PLAN"}>✖ Clear</button>
        <div className="queue">
          <span className="q-label">Order:</span>
          {queue.length
            ? queue.map((id,i)=>(
                <span key={i} className={`q-item ${i===qIndex?"active":""}`}>{emoji(id)}</span>
              ))
            : <span className="q-empty">tap items to add… or auto-fill</span>}
        </div>
      </div>

      <div className="g-card-hi position-relative"
           ref={boxRef}
           style={{height:BOARD_H, overflow:"hidden", cursor: phase==="PLAY" ? "crosshair" : "default"}}
           onClick={drop}>

        {/* clouds */}
        <div className="position-absolute" style={{left:0,right:0,top:0,height:50,display:"flex",gap:10,alignItems:"center",padding:"0 10px",opacity:.9}}>
          <span className="emo-xl g-dance">🌧️</span><span className="emo-xl g-dance">🌬️</span><span className="emo-xl g-dance">🌧️</span>
        </div>

        {/* helicopter (bigger + dance) */}
        <div style={{position:"absolute", transform:`translate(${heli.x}px, ${heli.y}px)`}}>
          <span className="emo-heli g-dance">🚁</span>
        </div>

        {/* houses (bigger) with need + tip */}
        {houses.map((h,i)=>{
          const need = KIT_TYPES.find(k=>k.id===h.need);
          return (
            <div key={i} style={{ position:"absolute", left:h.x-20, top:h.y-20, opacity: h.hit ? 0.9 : 1 }}>
              {!h.hit && (
                <div className="need-bubble big">
                  <span className="emo-need">{need?.emoji}</span>
                  <span className="txt">{need?.label}</span>
                </div>
              )}
              {h.tipOn && (
                <div className="tip-bubble big">
                  {need?.tip}
                </div>
              )}
              <span className={`emo-house ${!h.hit ? "g-dance" : ""}`}>{h.hit ? "✅" : "🏠"}</span>
            </div>
          );
        })}

        {/* falling kits (show type tag) */}
        {kits.map((k,i)=>(
          <div key={i} style={{position:"absolute", left:k.x-12, top:k.y-12}}>
            <span className="emo-kit bob">🎒</span>
            <div className="kit-tag">{emoji(k.type)}</div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn g-btn-soft btn-sm" onClick={onExit}>← Back</button>
        {phase==="END" && (
          <span className="g-pill">🏅 {houses.every(h=>h.hit) ? "Mission complete" : "Mission ended"}</span>
        )}
      </div>
    </div>
  );
}

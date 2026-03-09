import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "./flood-beginner.css";

const ITEMS = [
  { id:"water",   label:"Water (1L)",  emoji:"💧", ok:true },
  { id:"whistle", label:"Whistle",     emoji:"🪈", ok:true },
  { id:"docs",    label:"ID & docs",   emoji:"🪪", ok:true },
  { id:"rope",    label:"Rope",        emoji:"🪢", ok:true },
  { id:"food",    label:"Dry food",    emoji:"🍙", ok:true },
  { id:"radio",   label:"Radio",       emoji:"📻", ok:true },
  // decoys
  { id:"laptop",  label:"Gaming laptop",emoji:"💻", ok:false },
  { id:"tv",      label:"Television",   emoji:"📺", ok:false },
  { id:"plant",   label:"Potted plant", emoji:"🪴", ok:false },
  { id:"iron",    label:"Clothes iron", emoji:"🧺", ok:false },
];

export default function FloodBeginner({ onExit }) {
  const TIME = 35, GOAL = 6;
  const [sec, setSec] = useState(TIME);
  const [state, setState] = useState("IDLE"); // IDLE | PLAY | END
  const [pool, setPool] = useState(() => shuffle(ITEMS));
  const [bag, setBag]   = useState([]);
  const [streak, setStreak] = useState(0);
  const [banner, setBanner] = useState(null);
  const [carry, setCarry] = useState(null);
  const carryRef = useRef(null);

  function shuffle(a){ return a.slice().sort(()=>Math.random()-0.5); }

  useEffect(()=>{ if(state!=="PLAY") return;
    const t=setInterval(()=>setSec(s=>s>0?s-1:0),1000);
    return ()=>clearInterval(t);
  },[state]);

  useEffect(()=>{ if(state==="PLAY" && sec===0) end(false,"Time’s up!","Pack faster next time."); },[sec,state]);

  const confetti=()=>{ const holder=document.createElement("div"); holder.className="confetti"; document.body.appendChild(holder);
    const colors=["#0ea5e9","#34d399","#fbbf24","#a78bfa","#ef4444"];
    for(let i=0;i<110;i++){ const p=document.createElement("div"); p.className="p";
      p.style.left=Math.random()*100+"vw"; p.style.top=(8+Math.random()*12)+"vh";
      p.style.background=colors[i%colors.length]; holder.appendChild(p);}
    setTimeout(()=>holder.remove(),900);
  };
  const end=(win,title,sub)=>{ setState("END"); setBanner({win,title,sub}); if(win){confetti();toast.success(title);} else {toast.info(title);} };

  const correctPacked = bag.filter(id => pool.find(x=>x.id===id)?.ok).length;

  const handleDrop = (id) => {
    if (bag.includes(id)) return;
    const it = pool.find(x=>x.id===id);
    setBag(b => [...b, id]);
    if (it.ok) {
      setStreak(s=>s+1);
      toast.success(streak >= 2 ? `Great streak x${streak+1}! ✅` : "Packed ✅");
      if (correctPacked + 1 >= GOAL) end(true, "Go-bag ready!", "You packed the essentials.");
    } else {
      setStreak(0);
      toast.error("Decoy — skip it!");
    }
  };

  const onCarry = (id) => setCarry(id===carry ? null : id);
  const dropToBag = () => { if(carry) { handleDrop(carry); setCarry(null); } };

  const start = () => {
    setSec(TIME); setState("PLAY");
    setPool(shuffle(ITEMS)); setBag([]); setStreak(0);
    setBanner(null); setCarry(null);
  };

  return (
    <div className="flood-beginner">
      <div className="fb-card">
        <div className="fb-top">
          <div>
            <h5 className="fb-title">🌊 Flood — Beginner (Go-Bag Dash+)</h5>
            <small className="fb-muted">Drag or tap-carry items into the backpack. Avoid decoys. Enter/Space drops.</small>
          </div>
          <div className="fb-actions">
            <span className="fb-pill">⏱ {sec}s</span>
            <span className="fb-pill">🎯 {correctPacked}/{GOAL}</span>
            {state!=="PLAY"
              ? <button className="fb-btn cta" onClick={start}>Start</button>
              : <button className="fb-btn danger" onClick={()=>setState("END")}>Stop</button>}
            <button className="fb-btn soft" onClick={onExit}>← Back</button>
          </div>
        </div>

        <div className="fb-grid">
          {/* Items */}
          <section className="fb-panel">
            <div className="fb-inv">
              {pool.map(it=>{
                const used = bag.includes(it.id);
                return (
                  <div key={it.id}
                       className={`fb-item ${used?"good": carry===it.id?"focus":""}`}
                       draggable={!used}
                       onDragStart={(e)=>e.dataTransfer.setData("text/plain", it.id)}
                       onClick={()=>!used && onCarry(it.id)}
                       role="button" tabIndex={0}
                       onKeyDown={(e)=>{ if((e.key==="Enter"||e.key===" ") && !used) onCarry(it.id); }}>
                    <div className="emo-lg g-dance">{it.emoji}</div>
                    <div className="fb-item-label">{it.label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Backpack */}
          <section className="fb-pack"
            onDragOver={(e)=>e.preventDefault()}
            onDrop={(e)=>{ e.preventDefault(); handleDrop(e.dataTransfer.getData("text/plain")); }}
            ref={carryRef}>
            <div className="fb-pack-head">
              <div className="fb-pack-title"><span className="emo-lg g-dance">🎒</span><strong>Backpack</strong></div>
              <button className="fb-btn soft" onClick={()=>setPool(shuffle(pool))}>Shuffle</button>
            </div>
            <div className="fb-chips">
              {bag.map(id => {
                const it = pool.find(x=>x.id===id);
                return <span key={id} className={`fb-chip ${it.ok?"good":"bad"}`}><span className="emo-lg">{it.emoji}</span>{it.label}</span>;
              })}
            </div>
            <button className="fb-btn cta fb-drop" onClick={dropToBag} disabled={!carry}>
              {carry ? <>Place <b>{pool.find(x=>x.id===carry)?.label}</b> here</> : "Click an item to carry, then click here"}
            </button>
          </section>
        </div>

        <div className="fb-bottom">
          <button className="fb-btn soft" onClick={onExit}>← Back</button>
          {streak>=2 && <span className="fb-pill">🔥 Streak x{streak}</span>}
        </div>

        {banner && (
          <div className="fb-overlay" onClick={()=>setBanner(null)}>
            <div className="fb-result">
              <div className={`fb-result-title ${banner.win?"win":"lose"}`}>{banner.win?"VICTORY":"TRY AGAIN"}</div>
              <div className="fb-result-sub">{banner.title} {banner.sub && <>• {banner.sub}</>}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

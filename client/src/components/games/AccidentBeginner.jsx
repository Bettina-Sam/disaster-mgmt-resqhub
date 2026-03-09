import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const ALL = [
  { id:"band", label:"Bandage", emoji:"🩹", ok:true },
  { id:"ant",  label:"Antiseptic", emoji:"🧴", ok:true },
  { id:"gau",  label:"Gauze", emoji:"🧻", ok:true },
  { id:"wrap", label:"Wrap", emoji:"🩼", ok:true },
  { id:"chips",label:"Chips", emoji:"🍟", ok:false },
  { id:"toy",  label:"Toy", emoji:"🧸", ok:false },
  { id:"pen",  label:"Pen", emoji:"🖊️", ok:false },
  { id:"plant",label:"Plant", emoji:"🪴", ok:false },
];

export default function AccidentBeginner({ onExit }) {
  const GOAL = 4, TIME = 40;
  const [sec, setSec] = useState(TIME);
  const [state, setState] = useState("IDLE");
  const [bag, setBag] = useState([]);
  const [items, setItems] = useState(() => ALL.slice().sort(()=>Math.random()-0.5));
  const [banner, setBanner] = useState(null);
  const dropRef = useRef(null);

  useEffect(()=>{ if(state!=="PLAY") return; const t=setInterval(()=>setSec(s=>s>0?s-1:0),1000); return ()=>clearInterval(t); },[state]);
  useEffect(()=>{ if(state==="PLAY" && sec===0) end(false,"Time’s up","Grab essentials faster."); },[sec,state]);

  const confetti=()=>{ const holder=document.createElement("div"); holder.className="confetti"; document.body.appendChild(holder);
    const colors=["#22c55e","#0ea5e9","#f59e0b","#a78bfa","#ef4444"]; for(let i=0;i<100;i++){const p=document.createElement("div"); p.className="p";
      p.style.left=Math.random()*100+"vw"; p.style.top=(10+Math.random()*10)+"vh"; p.style.background=colors[i%colors.length]; holder.appendChild(p);} setTimeout(()=>holder.remove(),900);
  };
  const end=(win,title,sub)=>{ setState("END"); setBanner({win,title,sub}); if(win){confetti();toast.success(title);} else {toast.info(title);} };

  const onDragStart=(e,id)=> e.dataTransfer.setData("text/plain", id);
  const onDrop=(e)=>{ e.preventDefault(); const id=e.dataTransfer.getData("text/plain"); if(!id) return;
    if(bag.includes(id)) return;
    const it=items.find(x=>x.id===id);
    setBag(b=>[...b,id]);
    if(it.ok){
      const n = bag.filter(x=>items.find(y=>y.id===x)?.ok).length+1;
      toast.success("Packed ✅");
      if(n>=GOAL) end(true,"First-aid ready!","You packed the essentials.");
    } else toast.error("Decoy — not for first-aid");
  };

  const reset=()=>{ setSec(TIME); setBag([]); setItems(ALL.slice().sort(()=>Math.random()-0.5)); setBanner(null); };

  return (
    <div className="g-card p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h5 className="mb-0">🚑 Accident — Beginner (First-Aid Grab)</h5>
          <small className="g-muted">Drag essentials into the kit. Avoid decoys.</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="g-pill">⏱ {sec}s</span>
          {state!=="PLAY"
            ? <button className="btn cta-btn btn-sm" onClick={()=>{reset(); setState("PLAY");}}>Start</button>
            : <button className="btn btn-outline-danger btn-sm" onClick={()=>setState("END")}>Stop</button>}
        </div>
      </div>

      <div className="g-grid" style={{gridTemplateColumns:"2fr 1fr", gap:16}}>
        <section className="g-card p-2">
          <div className="inv" style={{gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
            {items.map(it=>{
              const used = bag.includes(it.id);
              return (
                <div key={it.id} className={`inv-item ${used?"g-good":""}`} draggable={!used}
                     onDragStart={(e)=>onDragStart(e,it.id)}>
                  <div className="emo-lg g-dance">{it.emoji}</div>
                  <div className="fw-semibold">{it.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="g-card p-3" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop} ref={dropRef}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="emo-lg g-dance">🧰</span><strong>First-aid kit</strong>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {bag.map(id=>{ const it=items.find(x=>x.id===id); return <span key={id} className="chip"><span className="emo-lg">{it.emoji}</span>{it.label}</span>;})}
          </div>
          <small className="g-muted">Goal: {GOAL} correct.</small>
        </section>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn g-btn-soft btn-sm" onClick={onExit}>← Back</button>
      </div>

      {banner && (
        <div className="center-overlay" onClick={()=>setBanner(null)}>
          <div className="center-card">
            <div className={`center-title ${banner.win?"center-win":"center-lose"}`}>{banner.win?"VICTORY":"TRY AGAIN"}</div>
            <div className="center-sub">{banner.title} {banner.sub && <>• {banner.sub}</>}</div>
          </div>
        </div>
      )}
    </div>
  );
}

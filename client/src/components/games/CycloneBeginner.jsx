import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const ITEMS = [
  { id:"docs",  label:"Important documents", emoji:"🗂️", target:"safe" },
  { id:"kit",   label:"Go-bag & meds",       emoji:"🎒", target:"safe" },
  { id:"water", label:"Water stock",         emoji:"💧", target:"safe" },
  { id:"food",  label:"Dry food",            emoji:"🍱", target:"safe" },
  { id:"pets",  label:"Pets & carriers",     emoji:"🐾", target:"safe" },
  { id:"plants",label:"Potted plants",       emoji:"🪴", target:"safe" },
  { id:"grill", label:"BBQ grill",           emoji:"🍖", target:"unsafe" },
  { id:"chair", label:"Yard chairs",         emoji:"🪑", target:"unsafe" },
  { id:"bike",  label:"Bicycle",             emoji:"🚲", target:"unsafe" },
  { id:"flag",  label:"Garden flag",         emoji:"🚩", target:"unsafe" },
];

export default function CycloneBeginner({ onExit }){
  const GOAL = 6, TIME = 50;
  const [items,setItems] = useState(()=> ITEMS.slice().sort(()=>Math.random()-0.5));
  const [placed,setPlaced] = useState({ safe:[], unsafe:[] });
  const [okCount,setOkCount] = useState(0);
  const [sec,setSec] = useState(TIME);
  const [state,setState] = useState("IDLE");
  const [banner,setBanner] = useState(null); // {win:boolean,title,sub}
  const safeRef = useRef(null), unsafeRef = useRef(null);

  useEffect(()=>{ if(state!=="PLAY") return; const t=setInterval(()=>setSec(s=>s>0?s-1:0),1000); return ()=>clearInterval(t); },[state]);
  useEffect(()=>{ if(state==="PLAY" && sec===0){ end(false, "Time’s up!", "Try another arrangement."); } },[sec,state]);

  const confetti=()=>{ const holder=document.createElement("div"); holder.className="confetti"; document.body.appendChild(holder);
    const colors=["#2dc5f4","#34d399","#fbbf24","#ef4444","#a78bfa"]; for(let i=0;i<100;i++){const p=document.createElement("div"); p.className="p"; p.style.left=Math.random()*100+"vw"; p.style.top=(12+Math.random()*8)+"vh"; p.style.background=colors[i%colors.length]; holder.appendChild(p);} setTimeout(()=>holder.remove(),900);
  };

  const end=(win,title,sub)=>{
    setState("END"); setBanner({win,title,sub});
    if(win){ confetti(); toast.success(title); } else { toast.info(title); }
  };

  const onDragStart=(e,id)=>{ e.dataTransfer.setData("text/plain", id); };
  const dropTo=(bucket)=>(e)=>{
    e.preventDefault();
    const id=e.dataTransfer.getData("text/plain"); if(!id) return;
    if(placed.safe.includes(id) || placed.unsafe.includes(id)) return;
    const item = items.find(x=>x.id===id); if(!item) return;
    const correct = item.target===bucket;
    setPlaced(p=>({...p, [bucket]:[...p[bucket], id]}));
    if(correct){
      setOkCount(c=>{ const nc=c+1; toast.success("Secured ✅"); if(nc>=GOAL) end(true,"Home secured!","You placed the essentials correctly."); return nc; });
    } else toast.error("Nope — wrong zone");
  };

  const reset=()=>{ setItems(ITEMS.slice().sort(()=>Math.random()-0.5)); setPlaced({safe:[],unsafe:[]}); setOkCount(0); setSec(TIME); setBanner(null); };

  return (
    <div className="g-card p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h5 className="mb-0">🌪️ Cyclone — Beginner (Secure & Store)</h5>
          <small className="g-muted">Drag items into <b>SAFE (indoors)</b> or <b>UNSAFE (leave outside)</b>. Hit 6 correct picks.</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="g-pill">⏱ {sec}s</span>
          <span className="g-pill">✅ {okCount}/{GOAL}</span>
          {state!=="PLAY"
            ? <button className="btn cta-btn btn-sm" onClick={()=>{ reset(); setState("PLAY"); }}>Start</button>
            : <button className="btn btn-outline-danger btn-sm" onClick={()=>setState("END")}>Stop</button>}
        </div>
      </div>

      <div className="g-grid g-grid-2">
        <section className="g-card p-2">
          <div className="d-flex align-items-center justify-content-between px-2">
            <strong>Items</strong><small className="g-muted">Drag to a zone</small>
          </div>
          <div className="inv" style={{gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))"}}>
            {items.map(it=>{
              const used = placed.safe.includes(it.id) || placed.unsafe.includes(it.id);
              return (
                <div key={it.id} className={`inv-item ${used? "g-good" : ""}`} draggable={!used} onDragStart={(e)=>onDragStart(e,it.id)}>
                  <div className="emo-lg g-dance">{it.emoji}</div>
                  <div className="fw-semibold">{it.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="g-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
          <div className="g-card p-3" ref={safeRef} onDragOver={(e)=>e.preventDefault()} onDrop={dropTo("safe")}>
            <div className="d-flex align-items-center gap-2 mb-2"><span className="emo-lg g-dance">🏠</span><strong>SAFE (Indoors)</strong></div>
            <div className="d-flex flex-wrap gap-2">
              {placed.safe.map(id=>{ const it=items.find(x=>x.id===id); return <span key={id} className="chip"><span className="emo-lg">{it.emoji}</span>{it.label}</span>;})}
            </div>
          </div>
          <div className="g-card p-3" ref={unsafeRef} onDragOver={(e)=>e.preventDefault()} onDrop={dropTo("unsafe")}>
            <div className="d-flex align-items-center gap-2 mb-2"><span className="emo-lg g-dance">🌬️</span><strong>UNSAFE (Leave Outside)</strong></div>
            <div className="d-flex flex-wrap gap-2">
              {placed.unsafe.map(id=>{ const it=items.find(x=>x.id===id); return <span key={id} className="chip"><span className="emo-lg">{it.emoji}</span>{it.label}</span>;})}
            </div>
          </div>
        </section>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn g-btn-soft btn-sm" onClick={onExit}>← Back</button>
        {state==="END" && <span className="g-pill">🏅 {okCount>=GOAL ? "Level complete" : "Try again"}</span>}
      </div>

      {banner && (
        <div className="center-overlay" onClick={()=>setBanner(null)}>
          <div className="center-card">
            <div className={`center-title ${banner.win? "center-win":"center-lose"}`}>{banner.win? "VICTORY" : "TRY AGAIN"}</div>
            <div className="center-sub">{banner.title} {banner.sub && <>• {banner.sub}</>}</div>
          </div>
        </div>
      )}
    </div>
  );
}

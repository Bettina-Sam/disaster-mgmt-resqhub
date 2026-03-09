import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

// 3 scenarios -> correct tool mapping
const SCENES = [
  { id:"grease",    label:"Grease pan fire",   emoji:"🍳🔥", need:"lid" },
  { id:"electric",  label:"Electrical fire",   emoji:"🔌🔥", need:"co2" },
  { id:"paper",     label:"Paper bin fire",    emoji:"🗑️🔥", need:"water" },
];
const TOOLS = [
  { id:"lid",   label:"Cover with lid", emoji:"🫙" },
  { id:"co2",   label:"CO₂ extinguisher", emoji:"🧯" },
  { id:"water", label:"Water", emoji:"💧" },
  { id:"blanket", label:"Fire blanket", emoji:"🧣" }, // decoy to trick
];

export default function FireMedium({ onExit }) {
  const TIME=45;
  const [sec,setSec]=useState(TIME);
  const [state,setState]=useState("IDLE");
  const [scenes,setScenes]=useState(()=>SCENES.slice().sort(()=>Math.random()-0.5));
  const [done,setDone]=useState({}); // sceneId -> toolId
  const [carry,setCarry]=useState(null);
  const [banner,setBanner]=useState(null);

  useEffect(()=>{ if(state!=="PLAY") return; const t=setInterval(()=>setSec(s=>s>0?s-1:0),1000); return ()=>clearInterval(t); },[state]);
  useEffect(()=>{ if(state==="PLAY" && sec===0) finish(); },[sec,state]);

  const confetti=()=>{ const h=document.createElement("div"); h.className="confetti"; document.body.appendChild(h);
    const colors=["#22c55e","#0ea5e9","#f59e0b","#a78bfa","#ef4444"]; for(let i=0;i<110;i++){const p=document.createElement("div"); p.className="p";
      p.style.left=Math.random()*100+"vw"; p.style.top=(10+Math.random()*10)+"vh"; p.style.background=colors[i%colors.length]; h.appendChild(p);} setTimeout(()=>h.remove(),900);
  };
  const end=(win,title,sub)=>{ setState("END"); setBanner({win,title,sub}); if(win){confetti();toast.success(title);} else {toast.info(title);} };

  const start=()=>{ setScenes(SCENES.slice().sort(()=>Math.random()-0.5)); setDone({}); setCarry(null); setSec(TIME); setState("PLAY"); setBanner(null); };

  const drop=(sceneId, toolId)=>{
    setDone(d=>({ ...d, [sceneId]: toolId }));
    const sc = scenes.find(s=>s.id===sceneId);
    if(toolId===sc.need) toast.success("Correct"); else toast.error("Not safe");
    const allPicked = Object.keys({...done, [sceneId]: toolId}).length === scenes.length;
    if(allPicked) finish({ ...done, [sceneId]: toolId });
  };

  const finish=(final=done)=>{
    const ok = scenes.filter(s=>final[s.id]===s.need).length;
    const win = ok===scenes.length;
    end(win, win?"Kitchen safe!":"Review choices", `${ok}/${scenes.length} correct`);
  };

  return (
    <div className="g-card p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h5 className="mb-0">🔥 Fire — Medium (Kitchen Fire Match)</h5>
          <small className="g-muted">Drag a tool to each scene. Tap a tool to “carry” then press <b>Drop here</b> if you prefer keyboard/touch.</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="g-pill">⏱ {sec}s</span>
          {state!=="PLAY"
            ? <button className="btn cta-btn btn-sm" onClick={start}>Start</button>
            : <button className="btn btn-outline-danger btn-sm" onClick={()=>setState("END")}>Stop</button>}
        </div>
      </div>

      <div className="g-grid" style={{gridTemplateColumns:"2fr 1fr", gap:16}}>
        {/* Scenes */}
        <section className="g-card p-2">
          <div className="g-grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12}}>
            {scenes.map(sc=>{
              const pick = done[sc.id];
              return (
                <div key={sc.id} className="g-card p-3"
                  onDragOver={(e)=>e.preventDefault()}
                  onDrop={(e)=>{ e.preventDefault(); const tid=e.dataTransfer.getData("text/plain"); if(tid) drop(sc.id, tid); }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="emo-lg g-dance">{sc.emoji}</span>
                      <div className="fw-semibold">{sc.label}</div>
                    </div>
                    {pick && <span className={`g-pill ${pick===sc.need?"g-good":""}`}>{TOOLS.find(t=>t.id===pick)?.label}</span>}
                  </div>
                  <button className="btn g-btn-soft w-100" onClick={()=>carry && drop(sc.id, carry)} disabled={!carry}>Drop here</button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tools */}
        <section className="g-card p-2">
          <div className="g-grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10}}>
            {TOOLS.map(t=>{
              const held = carry===t.id;
              return (
                <div key={t.id}
                  className={`inv-item ${held?"g-focus":""}`} draggable
                  onDragStart={(e)=>e.dataTransfer.setData("text/plain", t.id)}
                  onClick={()=>setCarry(held?null:t.id)}>
                  <div className="emo-lg g-dance">{t.emoji}</div>
                  <div className="fw-semibold">{t.label}</div>
                </div>
              );
            })}
          </div>
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

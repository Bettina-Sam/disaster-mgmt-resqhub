import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const W = 8, H = 5;                            // grid size
const START = { x: 0, y: 4 };
const EXIT  = { x: 7, y: 0 };
const EXTING = { x: 2, y: 2 };                 // extinguisher position
// simple smoke/walls
const SMOKE = new Set(["1,1","2,1","3,1","4,1","5,1","4,3","5,3","6,3"]);

export default function FireBeginner({ onExit }) {
  const TIME = 40;
  const [sec,setSec]=useState(TIME);
  const [state,setState]=useState("IDLE"); // IDLE | PLAY | END
  const [pos,setPos]=useState(START);
  const [hasExt,setHasExt]=useState(false);
  const [banner,setBanner]=useState(null);
  const [carry,setCarry]=useState(null); // on-screen arrow focus
  const boardRef = useRef(null);

  useEffect(()=>{ if(state!=="PLAY") return;
    const t=setInterval(()=>setSec(s=>s>0?s-1:0),1000);
    return ()=>clearInterval(t);
  },[state]);

  useEffect(()=>{ if(state==="PLAY" && sec===0) end(false,"Time’s up!","Find the exit faster."); },[sec,state]);

  useEffect(()=>{
    const onKey = (e) => {
      if(state!=="PLAY") return;
      const k = e.key.toLowerCase();
      if(["arrowup","w"].includes(k)) step(0,-1);
      if(["arrowdown","s"].includes(k)) step(0,1);
      if(["arrowleft","a"].includes(k)) step(-1,0);
      if(["arrowright","d"].includes(k)) step(1,0);
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[state,pos,hasExt]);

  const confetti=()=>{ const holder=document.createElement("div"); holder.className="confetti"; document.body.appendChild(holder);
    const colors=["#22c55e","#0ea5e9","#f59e0b","#a78bfa","#ef4444"]; for(let i=0;i<110;i++){const p=document.createElement("div"); p.className="p";
      p.style.left=Math.random()*100+"vw"; p.style.top=(10+Math.random()*10)+"vh"; p.style.background=colors[i%colors.length]; holder.appendChild(p);} setTimeout(()=>holder.remove(),900);
  };
  const end=(win,title,sub)=>{ setState("END"); setBanner({win,title,sub}); if(win){confetti();toast.success(title);} else {toast.info(title);} };

  const cellKey = (x,y)=>`${x},${y}`;
  const blocked=(x,y)=> x<0||x>=W||y<0||y>=H||SMOKE.has(cellKey(x,y));

  const step=(dx,dy)=>{
    const nx=pos.x+dx, ny=pos.y+dy;
    if(blocked(nx,ny)){ toast.error("Smoke! Choose a safer tile."); return; }
    setPos({x:nx,y:ny});
    if(nx===EXTING.x && ny===EXTING.y && !hasExt){ setHasExt(true); toast.success("Picked 🧯"); }
    if(nx===EXIT.x && ny===EXIT.y){
      if(hasExt) end(true,"Escaped!","You grabbed the extinguisher and reached the exit.");
      else toast.info("Grab the 🧯 first!");
    }
  };

  const start=()=>{ setPos(START); setHasExt(false); setSec(TIME); setState("PLAY"); setBanner(null); };

  // simple swipe
  useEffect(()=>{
    let sX=0,sY=0; 
    const el=boardRef.current;
    if(!el) return;
    const down=(e)=>{ const t=e.touches?.[0]||e; sX=t.clientX; sY=t.clientY; };
    const up=(e)=>{ if(state!=="PLAY") return;
      const t=e.changedTouches?.[0]||e; const dx=t.clientX-sX, dy=t.clientY-sY;
      if(Math.abs(dx)>Math.abs(dy)){ if(dx>18) step(1,0); else if(dx<-18) step(-1,0); }
      else { if(dy>18) step(0,1); else if(dy<-18) step(0,-1); }
    };
    el.addEventListener("pointerdown",down); el.addEventListener("pointerup",up);
    return ()=>{ el.removeEventListener("pointerdown",down); el.removeEventListener("pointerup",up); };
  },[state,pos,hasExt]);

  const ArrowBtn = ({label,onClick}) => (
    <button className="g-card p-2" onMouseDown={onClick} onTouchStart={(e)=>{e.preventDefault();onClick();}}>
      {label}
    </button>
  );

  return (
    <div className="g-card p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h5 className="mb-0">🔥 Fire — Beginner (Smoke Escape+)</h5>
          <small className="g-muted">Use WASD/Arrows, swipe, or the buttons. Pick up the <b>🧯</b> then reach <b>🚪</b>. Avoid smoke tiles.</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="g-pill">⏱ {sec}s</span>
          <span className="g-pill">{hasExt?"🧯":"…"} </span>
          {state!=="PLAY"
            ? <button className="btn cta-btn btn-sm" onClick={start}>Start</button>
            : <button className="btn btn-outline-danger btn-sm" onClick={()=>setState("END")}>Stop</button>}
        </div>
      </div>

      <div ref={boardRef} className="g-card-hi d-flex align-items-center justify-content-center" style={{height:320}}>
        <div className="grid" style={{display:"grid", gridTemplateColumns:`repeat(${W}, 48px)`, gap:8}}>
          {Array.from({length:H}).map((_,y)=>
            Array.from({length:W}).map((__,x)=>{
              const key=cellKey(x,y);
              const here = pos.x===x && pos.y===y;
              const isSmoke = SMOKE.has(key);
              const isExt = x===EXTING.x && y===EXTING.y && !hasExt;
              const isExit = x===EXIT.x && y===EXIT.y;
              return (
                <div key={key} className={`g-card cell ${isSmoke?"smoke":""} ${here?"g-good":""}`} style={{width:48,height:48,display:"grid",placeItems:"center"}}>
                  {isSmoke? <span className="emo-lg">🌫️</span> : here? <span className="emo-lg g-dance">🧍</span> :
                   isExt? <span className="emo-lg g-dance">🧯</span> :
                   isExit? <span className="emo-lg g-dance">🚪</span> : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="d-flex justify-content-center gap-2 mt-3">
        <ArrowBtn label="↑" onClick={()=>step(0,-1)} />
      </div>
      <div className="d-flex justify-content-center gap-2">
        <ArrowBtn label="←" onClick={()=>step(-1,0)} />
        <ArrowBtn label="→" onClick={()=>step(1,0)} />
      </div>
      <div className="d-flex justify-content-center gap-2">
        <ArrowBtn label="↓" onClick={()=>step(0,1)} />
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

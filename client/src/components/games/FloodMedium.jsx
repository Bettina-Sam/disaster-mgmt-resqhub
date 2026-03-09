import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function FloodMedium({ onExit }) {
  const TIME = 40;
  const COLS = 8;
  const [sec,setSec]=useState(TIME);
  const [state,setState]=useState("IDLE");
  const [level,setLevel]=useState(1);
  const [gaps,setGaps]=useState(()=>makeGaps(COLS,1));
  const [bags,setBags]=useState([]);
  const [water,setWater]=useState(0); // 0..100 fill
  const [banner,setBanner]=useState(null);

  function makeGaps(cols, lvl){
    // create 3+lvl gaps indices
    const count = Math.min(cols-2, 3+lvl);
    const picks = new Set();
    while(picks.size<count){ picks.add(Math.floor(Math.random()*cols)); }
    return [...picks];
  }

  useEffect(()=>{ if(state!=="PLAY") return;
    const t = setInterval(()=>setSec(s=>s>0?s-1:0),1000);
    const rise = setInterval(()=>{
      setWater(w => Math.min(100, w + 6)); // water rises
      // leak through open gaps
      const open = gaps.filter(i=>!bags.includes(i)).length;
      if(open>0) setWater(w=>Math.min(100, w + open*2));
    }, 900);
    return ()=>{ clearInterval(t); clearInterval(rise); };
  },[state,gaps,bags]);

  useEffect(()=>{
    if(state==="PLAY" && sec===0) end(false,"Water rose too high","Block gaps faster.");
  },[sec,state]);

  useEffect(()=>{
    if(state!=="PLAY") return;
    const open = gaps.filter(i=>!bags.includes(i)).length;
    if(open===0 && water<70){
      end(true,"Levee holds!","You placed the sandbags.");
    }
    if(water>=100){ end(false,"Flooded","Too many gaps left."); }
  },[gaps,bags,water,state]);

  const confetti=()=>{ const holder=document.createElement("div"); holder.className="confetti"; document.body.appendChild(holder);
    const colors=["#0ea5e9","#34d399","#fbbf24","#a78bfa","#ef4444"]; for(let i=0;i<110;i++){const p=document.createElement("div"); p.className="p";
      p.style.left=Math.random()*100+"vw"; p.style.top=(8+Math.random()*12)+"vh"; p.style.background=colors[i%colors.length]; holder.appendChild(p);} setTimeout(()=>holder.remove(),900);
  };
  const end=(win,title,sub)=>{ setState("END"); setBanner({win,title,sub}); if(win){confetti();toast.success(title);} else {toast.info(title);} };

  const start=()=>{ setSec(TIME); setWater(0); setBags([]); setGaps(makeGaps(COLS,level)); setState("PLAY"); setBanner(null); };

  const toggle=(i)=>{ if(state!=="PLAY") return;
    if(bags.includes(i)) setBags(b=>b.filter(x=>x!==i));
    else setBags(b=>[...b,i]);
  };

  return (
    <div className="g-card p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h5 className="mb-0">🌊 Flood — Medium (Sandbag Line)</h5>
          <small className="g-muted">Tap columns to place <span className="emo-lg g-dance">🧱</span> sandbags. Seal every gap before the water reaches the top.</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="g-pill">⏱ {sec}s</span>
          <span className="g-pill">💧 {water}%</span>
          {state!=="PLAY" ? (
            <button className="btn cta-btn btn-sm" onClick={start}>Start</button>
          ) : (
            <button className="btn btn-outline-danger btn-sm" onClick={()=>setState("END")}>Stop</button>
          )}
        </div>
      </div>

      <div className="g-card-hi position-relative" style={{height:260}}>
        {/* water fill */}
        <div style={{
          position:"absolute", left:0, right:0, bottom:0, height:`${water}%`,
          background:"linear-gradient(180deg, rgba(56,189,248,.35), rgba(2,132,199,.45))",
          borderBottomLeftRadius:12, borderBottomRightRadius:12, transition:"height .25s"
        }}/>
        {/* columns */}
        <div className="d-flex h-100 align-items-end justify-content-between p-3" style={{gap:10}}>
          {Array.from({length:COLS}).map((_,i)=>{
            const isGap = gaps.includes(i);
            const hasBag = bags.includes(i);
            return (
              <button key={i} className="g-card"
                onClick={()=>toggle(i)}
                style={{
                  width:`calc(100%/${COLS} - 8px)`, height: "80%",
                  background: "rgba(255,255,255,.02)", position:"relative",
                  borderColor: hasBag ? "var(--g-accent)" : isGap ? "rgba(248,113,113,.5)" : "var(--g-border)"
                }}>
                {isGap && !hasBag && <div className="position-absolute" style={{left:"50%", transform:"translateX(-50%)", top:8}}>
                  <span className="emo-lg g-dance">🕳️</span>
                </div>}
                {hasBag && <div className="position-absolute" style={{left:"50%", transform:"translateX(-50%)", bottom:12}}>
                  <span className="emo-lg g-dance">🧱</span>
                </div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn g-btn-soft btn-sm" onClick={onExit}>← Back</button>
        {state==="END" && <span className="g-pill">🏅 {water>=100 ? "Failed levee" : "Line secured"}</span>}
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

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// simple cues → expected tag
const TAGS = [
  { key:"green",  label:"Green",  emoji:"🟩" },
  { key:"yellow", label:"Yellow", emoji:"🟨" },
  { key:"red",    label:"Red",    emoji:"🟥" },
  { key:"black",  label:"Black",  emoji:"⬛" },
];

const TAG_BY_KEY = TAGS.reduce((m,t)=> (m[t.key]=t, m), {});

function makeVictims() {
  const pool = [
    { cue:"Walking wounded", tag:"green" },
    { cue:"Bleeding controlled", tag:"yellow" },
    { cue:"Severe bleeding", tag:"red" },
    { cue:"Not breathing after airway opened", tag:"black" },
    { cue:"Breathing fast, confused", tag:"red" },
    { cue:"Minor cuts", tag:"green" },
    { cue:"Breathing, cannot walk", tag:"yellow" },
    { cue:"No pulse", tag:"black" },
  ];
  return pool.sort(()=>Math.random()-0.5).slice(0,6).map((v,i)=>({ id:i, ...v, picked:null }));
}

export default function AccidentAdvanced({ onExit }) {
  const TIME = 60;
  const [sec,setSec]=useState(TIME);
  const [state,setState]=useState("IDLE"); // IDLE | PLAY | END
  const [victims,setVictims]=useState(()=>makeVictims());
  const [banner,setBanner]=useState(null); // {win,title,sub}
  const [review,setReview]=useState([]);   // [{...} as built in finish()]
  const [coachOn,setCoachOn] = useState(true);

  // ---- voice coach ----
  const speak = (text) => {
    if (!coachOn || !text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 1; u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  };

  useEffect(()=>{
    if(state!=="PLAY") return;
    const t=setInterval(()=>setSec(s=>s>0?s-1:0),1000);
    return ()=>clearInterval(t);
  },[state]);

  useEffect(()=>{
    if(state==="PLAY" && sec===0) finish();
  },[sec,state]); // eslint-disable-line react-hooks/exhaustive-deps

  const confetti=()=>{
    const holder=document.createElement("div"); holder.className="confetti"; document.body.appendChild(holder);
    const colors=["#22c55e","#0ea5e9","#f59e0b","#a78bfa","#ef4444"];
    for(let i=0;i<120;i++){
      const p=document.createElement("div"); p.className="p";
      p.style.left=Math.random()*100+"vw";
      p.style.top=(8+Math.random()*12)+"vh";
      p.style.background=colors[i%colors.length];
      holder.appendChild(p);
    }
    setTimeout(()=>holder.remove(),900);
  };

  const end=(win,title,sub)=>{
    setState("END");
    setBanner({win,title,sub});
    if(win){ confetti(); toast.success(title); } else { toast.info(title); }
    speak(`${title}. ${sub || ""}`);
  };

  const tag=(id,key)=>{
    if(state!=="PLAY") return;
    setVictims(vs=>{
      const nv=vs.map(v=> v.id===id ? {...v,picked:key} : v);
      const pickedVictim = nv.find(v=>v.id===id);
      const label = TAG_BY_KEY[key]?.label ?? key;
      speak(`Tagged: ${pickedVictim.cue}. You chose ${label}.`);
      const done = nv.every(v=>v.picked);
      if(done) finish(nv);
      return nv;
    });
  };

  const finish=(arr=victims)=>{
    const details = arr.map(v=>{
      const correct = v.tag;
      const your    = v.picked;
      const isCorrect = your === correct;
      return {
        id: v.id,
        cue: v.cue,
        correct,
        correctEmoji: TAG_BY_KEY[correct]?.emoji ?? "",
        correctLabel: TAG_BY_KEY[correct]?.label ?? correct,
        your: your ?? "(not tagged)",
        yourEmoji: your ? (TAG_BY_KEY[your]?.emoji ?? "") : "",
        yourLabel: your ? (TAG_BY_KEY[your]?.label ?? your) : "(not tagged)",
        isCorrect
      };
    });

    setReview(details);

    const ok = details.filter(d=>d.isCorrect).length;
    const win = ok >= Math.ceil(details.length*0.7);
    end(win, win? "Triage complete!" : "Triage review", `${ok}/${details.length} correct`);
  };

  const start=()=>{
    setVictims(makeVictims());
    setSec(TIME);
    setState("PLAY");
    setBanner(null);
    setReview([]);
    speak("Triage drill. Read the clue, pick the tag: green, yellow, red, or black. Try to get at least seventy percent right.");
  };

  const toggleCoach = ()=>{
    setCoachOn(v=>{
      const nv = !v;
      if (nv) speak("Coach on. I will read quick tips while you play.");
      else { try{ window.speechSynthesis.cancel(); } catch{} }
      return nv;
    });
  };

  return (
    <div className="g-card p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h5 className="mb-0">🚑 Accident — Advanced (Triage Tag)</h5>
          <small className="g-muted">Pick the correct tag for each victim.</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="g-pill">⏱ {sec}s</span>
          <button
            className={`btn btn-sm ${coachOn ? "g-btn-soft" : "btn-outline-secondary"}`}
            onClick={toggleCoach}
            title="Toggle voice coach"
          >
            🔊 {coachOn ? "Coach On" : "Coach Off"}
          </button>
          {state!=="PLAY"
            ? <button className="btn cta-btn btn-sm" onClick={start}>Start</button>
            : <button className="btn btn-outline-danger btn-sm" onClick={()=>finish()}>Finish</button>}
        </div>
      </div>

      <div className="g-grid" style={{gridTemplateColumns:"1fr 1fr", gap:12}}>
        {victims.map(v=>(
          <div key={v.id} className="g-card p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span className="emo-lg g-dance">🧑‍⚕️</span>
                <div>
                  <div className="fw-semibold">{v.cue}</div>
                  <small className="g-muted">
                    {v.picked ? `Your tag: ${TAG_BY_KEY[v.picked]?.label ?? v.picked}` : "Choose a tag"}
                  </small>
                </div>
              </div>
              <div className="d-flex gap-1 flex-wrap" style={{justifyContent:"flex-end"}}>
                {TAGS.map(t=>(
                  <button key={t.key}
                          className={`g-tag ${v.picked===t.key ? "g-good":""}`}
                          onClick={()=>tag(v.id,t.key)}>
                    <span className="emo-lg">{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn g-btn-soft btn-sm" onClick={onExit}>← Back</button>
      </div>

      {/* Results overlay with correct answers */}
      {banner && (
        <div className="center-overlay" onClick={()=>setBanner(null)}>
          <div className="center-card" onClick={e=>e.stopPropagation()}>
            <div className={`center-title ${banner.win?"center-win":"center-lose"}`}>
              {banner.win ? "VICTORY" : "REVIEW"}
            </div>
            <div className="center-sub" style={{marginBottom:10}}>
              {banner.title} {banner.sub && <>• {banner.sub}</>}
            </div>

            <div style={{
              maxHeight: 260, overflowY: "auto",
              border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: 8
            }}>
              {review.map(row=>(
                <div key={row.id}
                     className="d-flex align-items-center justify-content-between"
                     style={{
                       padding:"8px 10px", borderRadius:8,
                       background: row.isCorrect ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.08)",
                       border: `1px solid ${row.isCorrect ? "rgba(34,197,94,.4)":"rgba(239,68,68,.35)"}`,
                       marginBottom:8
                     }}>
                  <div style={{maxWidth:280}}>
                    <div className="fw-semibold">{row.cue}</div>
                    <small className="g-muted">
                      Correct: {row.correctEmoji} {row.correctLabel}
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span>
                      Your: {row.yourEmoji} {row.yourLabel}
                    </span>
                    <span style={{fontSize:18}}>
                      {row.isCorrect ? "✅" : "❌"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end mt-2">
              <button className="btn cta-btn btn-sm" onClick={()=>setBanner(null)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

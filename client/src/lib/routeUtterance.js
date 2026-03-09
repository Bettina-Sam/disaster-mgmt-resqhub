export default async function routeUtterance({
  raw, setTab, userLoc, draftReport, setDraftReport,
  speak, // tts.speak
  playLullaby, playOcean, stopAll, pause, resume, setVolume, sleepIn, volumeGetter,
  askLLM,                                      // async (text) => string
  pushAssistant,                                // (text) => void
}) {
  const text = raw.toLowerCase();

  // Tab navigation
  if (/open calm|go to calm|calm tab/.test(text)) { setTab("calm"); return; }
  if (/open grief|go to grief|grief tab/.test(text)) { setTab("grief"); return; }
  if (/open report|go to report|report tab/.test(text)) { setTab("report"); return; }
  if (/open talk|go to talk|talk tab/.test(text)) { setTab("talk"); return; }

  // Music
  if (/play (a )?lullaby|play music|play song/.test(text)) { playLullaby(); pushAssistant("Playing a lullaby. You can say “quieter”, “next”, or “stop lullaby”."); return; }
  if (/play ocean|ocean waves|rain|nature sound/.test(text)) { playOcean(); pushAssistant("Playing ocean waves. Say “stop lullaby” when done."); return; }
  if (/stop (lullaby|music|song|sound)/.test(text)) { stopAll(); pushAssistant("Stopped."); return; }
  if (/pause (lullaby|music|song|sound)/.test(text)) { pause(); pushAssistant("Paused."); return; }
  if (/resume (lullaby|music|song|sound)/.test(text)) { resume(); pushAssistant("Resumed."); return; }
  if (/quieter|lower|softer/.test(text)) { setVolume(Math.max(0, volumeGetter()-0.1)); pushAssistant("Okay, softer."); return; }
  if (/louder|increase/.test(text)) { setVolume(Math.min(1, volumeGetter()+0.1)); pushAssistant("Okay, louder."); return; }
  if (/set volume (\d{1,3})/.test(text)) { const n = parseInt(/set volume (\d{1,3})/.exec(text)[1],10); setVolume(n/100); pushAssistant(`Volume set to ${n}.`); return; }
  if (/sleep (?:timer )?(\d{1,2}) (?:minute|minutes|min)/.test(text)) { const m = parseInt(/sleep (?:timer )?(\d{1,2})/.exec(text)[1],10); sleepIn(m, () => pushAssistant("⏰ Sleep timer done. Stopping the music.")); pushAssistant(`Okay. I’ll stop in ${m} minute${m>1?'s':''}.`); return; }
  if (/next (song|lullaby)/.test(text)) { playLullaby(1); pushAssistant("Next lullaby."); return; }

  // Calm / Grief
  if (/panic|anx|overwhelm|stress|breathe/.test(text)) { setTab("calm"); pushAssistant("Let’s steady together. Try 4-6 breathing or box breathing."); return; }
  if (/lost|loss|passed|funeral|bereav|depress|empty|lonely/.test(text)) { setTab("grief"); pushAssistant("I’m so sorry for your loss. We can sit quietly, talk about them, or try a short grounding."); return; }

  // Report
  if (/report (flood|fire|accident|earthquake)/.test(text)) {
    const type = /(flood|fire|accident|earthquake)/.exec(text)?.[1] || "Incident";
    const draft = { type, location: `${userLoc.city} (${userLoc.lat.toFixed(2)}, ${userLoc.lng.toFixed(2)})`, description: raw };
    setDraftReport(draft); setTab("report"); pushAssistant(`Draft ready: ${type}. Say “confirm report” to submit or “find shelter”.`); return;
  }
  if (/confirm report|post report/.test(text)) { if (!draftReport) { pushAssistant("No draft yet. Say “Report flood”."); return; } pushAssistant("✅ Report posted to dashboard."); return; }

  // Open Q&A (mini-ChatGPT)
  const ans = await askLLM(raw);
  pushAssistant(ans);
}

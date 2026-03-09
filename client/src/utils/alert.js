// Simple beep using Web Audio API (works without audio files)
export async function playBeep({ freq = 880, duration = 400 } = {}) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.06;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    await new Promise(r => setTimeout(r, duration));
    osc.stop();
    ctx.close();
  } catch { /* ignore if autoplay blocked */ }
}

export function notifyCritical(doc) {
  // Best effort: try Notification API, else just flash the tab title.
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(`CRITICAL: ${doc.title}`, {
        body: `${doc.type}${doc.address ? " • " + doc.address : ""}`,
      });
    } catch {}
  } else {
    const old = document.title;
    document.title = "⚠️ CRITICAL ALERT";
    setTimeout(() => (document.title = old), 2500);
  }
}

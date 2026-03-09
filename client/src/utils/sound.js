// client/src/utils/sound.js

let _audioCtx = null;
let _enabled = true;

// Optional: respect OS "Reduce motion" as a proxy to reduce sensory load
try {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    _enabled = false;
  }
} catch {}

export function setSoundEnabled(v) {
  _enabled = !!v;
  if (!_enabled && _audioCtx) { _audioCtx.close(); _audioCtx = null; }
}

export function getSoundEnabled() {
  return _enabled;
}

function ctx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

export function beep({ freq = 880, duration = 140, type = "sine", gain = 0.04 } = {}) {
  if (!_enabled) return;
  const ac = ctx();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g).connect(ac.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration / 1000);
  o.stop(ac.currentTime + duration / 1000);
}

// short up-chirp “open”
export function cueOpen() {
  beep({ freq: 520, duration: 90, type: "triangle", gain: 0.05 });
  setTimeout(() => beep({ freq: 740, duration: 110, type: "triangle", gain: 0.05 }), 95);
}

// more urgent triple “critical”
export function cueCritical() {
  beep({ freq: 1100, duration: 120, type: "square", gain: 0.06 });
  setTimeout(() => beep({ freq: 950, duration: 120, type: "square", gain: 0.06 }), 130);
  setTimeout(() => beep({ freq: 1200, duration: 160, type: "square", gain: 0.07 }), 280);
}

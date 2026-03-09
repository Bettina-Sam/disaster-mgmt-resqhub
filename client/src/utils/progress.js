const KEY = "rsq:academy:progress";

export function loadProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

export function saveProgress(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function setLessonResult(hazardId, { score, passed }) {
  const p = loadProgress();
  p[hazardId] = { ...(p[hazardId] || {}), score, passed, at: new Date().toISOString() };
  saveProgress(p);
}

export function getLessonResult(hazardId) {
  const p = loadProgress();
  return p[hazardId] || null;
}

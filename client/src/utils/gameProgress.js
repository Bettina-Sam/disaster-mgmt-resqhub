// Remembers how each Academy game went, per game id (e.g. "flood-beginner").
const KEY = "rsq:games:v1";

export function loadGames() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function recordGame(id, win) {
  const all = loadGames();
  const cur = all[id] || { plays: 0, wins: 0 };
  all[id] = { plays: cur.plays + 1, wins: cur.wins + (win ? 1 : 0), last: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage blocked: the game still works */
  }
  return all[id];
}

export const LEVELS = ["beginner", "medium", "advanced"];
export const HAZARDS = ["flood", "fire", "cyclone", "quake", "accident"];

/** Totals for the hub: how many of the 15 games have been won at least once. */
export function summary(all = loadGames()) {
  const ids = HAZARDS.flatMap((h) => LEVELS.map((l) => `${h}-${l}`));
  return {
    total: ids.length,
    won: ids.filter((id) => all[id]?.wins > 0).length,
    plays: ids.reduce((n, id) => n + (all[id]?.plays || 0), 0),
  };
}

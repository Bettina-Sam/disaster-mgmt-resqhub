// The lesson scenes run in the background and report what happens to the HUD with these events.
// kind: "save" (someone was kept safe), "lose" (someone was lost), "tip" (a useful nudge, no score)
export function emitScene(kind, hazard, extra = {}) {
  try {
    window.dispatchEvent(new CustomEvent("rsq:scene", { detail: { kind, hazard, ...extra } }));
  } catch {
    /* never let a HUD problem break a scene */
  }
}

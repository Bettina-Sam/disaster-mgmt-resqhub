export default function useCommandRouter({ onMusic, onNavigate, onLang }) {
  // returns an optional action object for UI + side effects to run now
  const route = (userText) => {
    if (!userText) return null;
    const t = userText.toLowerCase();

    // music
    if (/(play (a )?lullaby|ocean|play music)/.test(t)) return onMusic({ action:"play", track: /ocean/.test(t) ? "ocean" : null });
    if (/(pause|resume)/.test(t)) return onMusic({ action: t.includes("pause") ? "pause" : "play" });
    if (/(stop|enough music)/.test(t)) return onMusic({ action:"stop" });
    if (/(next( song)?)/.test(t)) return onMusic({ action:"next" });

    // session
    if (/(open|start) calm|i feel anxious|help me breathe/.test(t)) return onNavigate("calm");
    if (/(i miss|grief|i am sad)/.test(t)) return onNavigate("grief");
    if (/(fire|flood|accident|earthquake|report)/.test(t)) return onNavigate("report");

    // language
    if (/tamil|தமிழ்/.test(t)) return onLang("ta-IN");
    if (/hindi|हिन्दी/.test(t)) return onLang("hi-IN");
    if (/english/.test(t)) return onLang("en-IN");

    return null;
  };

  return { route };
}

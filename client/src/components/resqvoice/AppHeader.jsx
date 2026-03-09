export default function AppHeader({ voiceEnabled, onVoiceToggle, language, onLanguageChange }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#111827]/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-3 px-4">
        <div className="grid size-9 place-items-center rounded-xl bg-[#3b82f6] text-xl">🛟</div>
        <div className="text-[17px] font-semibold tracking-tight">ResQVoice</div>

        <div className="ml-auto flex items-center gap-3">
          <select
            value={language}
            onChange={e => onLanguageChange(e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm outline-none"
          >
            <option value="en-IN">English</option>
            <option value="ta-IN">தமிழ்</option>
            <option value="hi-IN">हिन्दी</option>
          </select>

          <button
            onClick={onVoiceToggle}
            className={`h-9 rounded-lg px-4 text-sm font-medium ${
              voiceEnabled ? "bg-[#3b82f6] text-white" : "bg-[#1f2937] text-slate-200"
            }`}
          >
            {voiceEnabled ? "🔊  Voice On" : "🔈  Voice Off"}
          </button>
        </div>
      </div>
    </header>
  );
}

import { Mic, MicOff, Music2, Pause, Play, X } from "lucide-react";

export default function VoiceBar({
  listening, start, stop,
  nowPlaying, pauseAudio, resumeAudio, stopAllAudio,
  hint="Try: “Play a lullaby”, “Quieter”, “Sleep 5 minutes”, “Open Calm”."
}) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-3 py-2 shadow-2xl flex items-center gap-3">
        {nowPlaying && (
          <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-2 py-1">
            <Music2 className="size-4"/>
            <span className="text-xs">{nowPlaying.id}</span>
            <button onClick={pauseAudio} className="rounded p-1 hover:bg-white/10"><Pause className="size-4"/></button>
            <button onClick={resumeAudio} className="rounded p-1 hover:bg-white/10"><Play className="size-4"/></button>
            <button onClick={stopAllAudio} className="rounded p-1 hover:bg-white/10"><X className="size-4"/></button>
          </div>
        )}

        {listening ? (
          <button onClick={stop} className="rounded-xl px-3 py-2 inline-flex items-center gap-2 text-sm bg-rose-500/20 border border-rose-500/40">
            <MicOff className="size-4"/> Stop
          </button>
        ) : (
          <button onClick={start} className="rounded-2xl px-3 py-2 inline-flex items-center gap-2 text-sm bg-emerald-500/20 border border-emerald-500/40">
            <Mic className="size-4"/> Start
          </button>
        )}
        <span className="text-xs text-slate-200/85">{hint}</span>
      </div>
    </div>
  );
}

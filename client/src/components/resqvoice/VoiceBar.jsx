export default function VoiceBar({ language = "en-IN" }) {
  const tip =
    language === "ta-IN"
      ? "மைக் தட்டவும். உதாரணம்: 'லாலபை பிளே பண்ணு', 'காம்', 'வெள்ளம் ரிப்போர்ட்'."
      : language === "hi-IN"
      ? "माइक टैप करें: 'लोरी चलाओ', 'कैल्म', 'फ्लड रिपोर्ट'."
      : "Tap the mic and speak naturally";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b1220]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1120px] items-center justify-center gap-4 px-4 py-3">
        <button className="grid size-14 place-items-center rounded-full bg-[#2f7efb] text-2xl shadow-[0_10px_30px_rgba(47,126,251,.5)] hover:scale-[1.02] active:scale-95 transition">
          🎤
        </button>
        <div className="text-sm text-slate-300">{tip}</div>
      </div>
    </div>
  );
}

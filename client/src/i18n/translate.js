// Runtime translation of English text that lives inside components and content files
// (lessons, quizzes, games). The UI chrome uses t("key"); everything else goes through here.
//
//   DICT maps an exact English string to { hi, ta }.
//   PATTERNS handle strings with numbers in them, e.g. "30 min".
//
// Anything without an entry stays in English, never a blank.
import { DICT } from "./dict.js";

const norm = (s) => s.replace(/\s+/g, " ").trim();

const TYPE_NAME = {
  EARTHQUAKE: { hi: "भूकंप", ta: "நிலநடுக்கம்" }, FLOOD: { hi: "बाढ़", ta: "வெள்ளம்" }, FIRE: { hi: "आग", ta: "தீ" },
  ACCIDENT: { hi: "दुर्घटना", ta: "விபத்து" }, CYCLONE: { hi: "चक्रवात", ta: "புயல்" }, OTHER: { hi: "अन्य", ta: "மற்றவை" },
};

const PATTERNS = [
  // relative times and counts shown by the dashboard
  { re: /^just now$/, hi: () => "अभी-अभी", ta: () => "இப்போதுதான்" },
  { re: /^never$/, hi: () => "कभी नहीं", ta: () => "ஒருபோதும் இல்லை" },
  { re: /^(\d+)m ago$/, hi: (m) => `${m[1]} मिनट पहले`, ta: (m) => `${m[1]} நிமிடம் முன்` },
  { re: /^(\d+)h ago$/, hi: (m) => `${m[1]} घंटे पहले`, ta: (m) => `${m[1]} மணி முன்` },
  { re: /^(\d+)d ago$/, hi: (m) => `${m[1]} दिन पहले`, ta: (m) => `${m[1]} நாள் முன்` },
  { re: /^(\d+) min ago$/, hi: (m) => `${m[1]} मिनट पहले`, ta: (m) => `${m[1]} நிமிடம் முன்` },
  { re: /^(\d+) h ago$/, hi: (m) => `${m[1]} घंटे पहले`, ta: (m) => `${m[1]} மணி முன்` },
  { re: /^(\d+) events$/, hi: (m) => `${m[1]} घटनाएँ`, ta: (m) => `${m[1]} நிகழ்வுகள்` },
  { re: /^M([\d.]+) earthquake: (.*)$/, hi: (m) => `M${m[1]} भूकंप: ${m[2]}`, ta: (m) => `M${m[1]} நிலநடுக்கம்: ${m[2]}` },
  { re: /^(EARTHQUAKE|FLOOD|FIRE|ACCIDENT|CYCLONE|OTHER): (\d+) \((\d+)%\)$/, hi: (m) => `${TYPE_NAME[m[1]].hi}: ${m[2]} (${m[3]}%)`, ta: (m) => `${TYPE_NAME[m[1]].ta}: ${m[2]} (${m[3]}%)` },
  { re: /^(beginner|medium|advanced): not played$/, hi: (m) => `${{ beginner: "शुरुआती", medium: "मध्यम", advanced: "उन्नत" }[m[1]]}: खेला नहीं`, ta: (m) => `${{ beginner: "தொடக்கம்", medium: "நடுத்தரம்", advanced: "மேம்பட்டது" }[m[1]]}: விளையாடவில்லை` },
  { re: /^(beginner|medium|advanced): (\d+) wins \/ (\d+) plays$/, hi: (m) => `${{ beginner: "शुरुआती", medium: "मध्यम", advanced: "उन्नत" }[m[1]]}: ${m[2]} जीत / ${m[3]} बार`, ta: (m) => `${{ beginner: "தொடக்கம்", medium: "நடுத்தரம்", advanced: "மேம்பட்டது" }[m[1]]}: ${m[2]} வெற்றி / ${m[3]} முறை` },
  { re: /^(\d+) \/ (\d+)$/, hi: (m) => `${m[1]} / ${m[2]}`, ta: (m) => `${m[1]} / ${m[2]}` },
  { re: /^(\d+) min$/, hi: (m) => `${m[1]} मिनट`, ta: (m) => `${m[1]} நிமிடம்` },
  { re: /^(\d+) mins total$/, hi: (m) => `कुल ${m[1]} मिनट`, ta: (m) => `மொத்தம் ${m[1]} நிமிடம்` },
  { re: /^3 levels • (\d+) mins total$/, hi: (m) => `3 स्तर • कुल ${m[1]} मिनट`, ta: (m) => `3 நிலைகள் • மொத்தம் ${m[1]} நிமிடம்` },
  { re: /^(\d+) min timed$/, hi: (m) => `${m[1]} मिनट का समय`, ta: (m) => `${m[1]} நிமிட நேரம்` },
  { re: /^(\d+) questions • (\d+) min timed$/, hi: (m) => `${m[1]} प्रश्न • ${m[2]} मिनट का समय`, ta: (m) => `${m[1]} கேள்விகள் • ${m[2]} நிமிட நேரம்` },
  { re: /^(\d+) questions • practice allowed$/, hi: (m) => `${m[1]} प्रश्न • अभ्यास की अनुमति`, ta: (m) => `${m[1]} கேள்விகள் • பயிற்சி அனுமதி` },
  { re: /^Pass (\d+)%$/, hi: (m) => `उत्तीर्ण ${m[1]}%`, ta: (m) => `தேர்ச்சி ${m[1]}%` },
  { re: /^Passing: (\d+)%$/, hi: (m) => `उत्तीर्ण अंक: ${m[1]}%`, ta: (m) => `தேர்ச்சி மதிப்பெண்: ${m[1]}%` },
  { re: /^Question (\d+) \/ (\d+)$/, hi: (m) => `प्रश्न ${m[1]} / ${m[2]}`, ta: (m) => `கேள்வி ${m[1]} / ${m[2]}` },
  { re: /^Your score: (\d+)%$/, hi: (m) => `आपका स्कोर: ${m[1]}%`, ta: (m) => `உன் மதிப்பெண்: ${m[1]}%` },
  { re: /^Goal: (\d+) correct\.?$/, hi: (m) => `लक्ष्य: ${m[1]} सही।`, ta: (m) => `இலக்கு: ${m[1]} சரி.` },
  { re: /^⏱ (\d+)s$/, hi: (m) => `⏱ ${m[1]} सेकंड`, ta: (m) => `⏱ ${m[1]} வினாடி` },
  { re: /^Score: (\d+)%?$/, hi: (m) => `स्कोर: ${m[1]}`, ta: (m) => `மதிப்பெண்: ${m[1]}` },
];

export function translateString(src, lang) {
  if (lang === "en" || !src) return src;
  const key = norm(src);
  if (!key) return src;
  const hit = DICT[key]?.[lang];
  if (hit) return src.replace(key, hit).replace(/^\s+|\s+$/g, (m) => m); // keep surrounding whitespace
  for (const p of PATTERNS) {
    const m = key.match(p.re);
    if (m && p[lang]) return src.replace(key, p[lang](m));
  }
  return src;
}

/** tr("English text", "hi"): for components that want to translate explicitly. */
export const tr = (text, lang) => translateString(text, lang);

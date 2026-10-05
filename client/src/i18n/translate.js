// Runtime translation of English text that lives inside components and content files
// (lessons, quizzes, games). The UI chrome uses t("key"); everything else goes through here.
//
//   DICT maps an exact English string to { hi, ta }.
//   PATTERNS handle strings with numbers in them, e.g. "30 min".
//
// Anything without an entry stays in English, never a blank.
import { DICT } from "./dict";

const norm = (s) => s.replace(/\s+/g, " ").trim();

const num = (s) => s;
const PATTERNS = [
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
void num;

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

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";
import ta from "../i18n/ta.json";

const translations = { en, hi, ta };
export const LANGUAGES = [
  { code: "en", label: "English", voice: "en-IN" },
  { code: "hi", label: "हिन्दी", voice: "hi-IN" },
  { code: "ta", label: "தமிழ்", voice: "ta-IN" },
];

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

function initialLanguage() {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q && translations[q]) return q;
    const saved = localStorage.getItem("resqhub_lang");
    return translations[saved] ? saved : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    try { localStorage.setItem("resqhub_lang", language); } catch { /* ignore */ }
    document.documentElement.lang = language;
  }, [language]);

  // t("key"): UI string. Falls back to English, then to the key itself.
  const t = useCallback((key) => translations[language]?.[key] || translations.en?.[key] || key, [language]);

  // L({ en, hi, ta }): pick the right language from a content object (lessons, quizzes, demos).
  const L = useCallback((obj) => (obj && typeof obj === "object" ? obj[language] ?? obj.en : obj), [language]);

  const value = useMemo(() => ({ language, setLanguage, t, L }), [language, t, L]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

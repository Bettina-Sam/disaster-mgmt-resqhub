import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";
import ta from "../i18n/ta.json";

const translations = { en, hi, ta };

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("resqhub_lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("resqhub_lang", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

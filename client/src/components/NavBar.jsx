import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import ExplainButton from "./ExplainButton";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
];

function initialTheme() {
  try {
    const q = new URLSearchParams(window.location.search).get("theme");
    if (q === "light" || q === "dark") return q;
    return localStorage.getItem("theme") || "dark";
  } catch {
    return "dark";
  }
}

export default function NavBar() {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [theme, setTheme] = useState(initialTheme);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    try { localStorage.setItem("theme", theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navLinks = [
    { to: "/", label: t("dashboard"), icon: "📊" },
    { to: "/academy", label: t("academy"), icon: "🎓" },
    { to: "/academy/games", label: t("games"), icon: "🎮" },
    { to: "/resqvoice", label: t("resqvoice"), icon: "🔊" },
  ];
  const isActive = (path) => (path === "/" ? location.pathname === "/" : location.pathname === path || (path === "/academy" && location.pathname.startsWith("/academy/") && !location.pathname.startsWith("/academy/games")));
  const dark = theme === "dark";

  const langSelect = (cls) => (
    <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`form-select form-select-sm w-auto ${cls}`} aria-label={t("language")}>
      {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  );

  return (
    <nav className="navbar rsq-nav px-3 py-2">
      <Link to="/" className="navbar-brand d-flex align-items-center gap-2 rsq-logo text-decoration-none">
        <span className="rsq-nav-shield">🛡️</span>
        <div>
          <span className="fw-black rsq-nav-brand-text">ResQHub</span>
          <span className="rsq-nav-tagline d-none d-xl-inline ms-2">{t("tagline")}</span>
        </div>
      </Link>

      <ul className="navbar-nav ms-3 d-none d-md-flex flex-row gap-1">
        {navLinks.map((l) => (
          <li key={l.to} className="nav-item">
            <Link className={`nav-link rsq-nav-link ${isActive(l.to) ? "rsq-nav-link-active" : ""}`} to={l.to}>{l.label}</Link>
          </li>
        ))}
      </ul>

      <div className="ms-auto d-flex align-items-center gap-2">
        <ExplainButton compact />
        {langSelect("rsq-round-btn d-none d-sm-inline-block border-secondary")}
        <button className="rsq-theme-toggle" onClick={() => setTheme(dark ? "light" : "dark")} title={dark ? t("theme_light") : t("theme_dark")} aria-label={dark ? t("theme_light") : t("theme_dark")}>
          {dark ? "☀️" : "🌙"}
        </button>
        <button className="rsq-hamburger d-md-none" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="rsq-mobile-menu d-md-none shadow-sm border-top p-3 position-absolute start-0 end-0" style={{ top: "100%", zIndex: 1000 }}>
          <div className="d-flex flex-column gap-2">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className={`text-decoration-none fw-medium d-flex align-items-center gap-2 p-2 rounded ${isActive(l.to) ? "bg-primary text-white" : "text-body"}`}>
                <span>{l.icon}</span> {l.label}
              </Link>
            ))}
            <hr className="my-1 border-secondary opacity-25" />
            <div className="d-flex align-items-center gap-2 px-2">
              <span className="small text-muted">{t("language")}</span>
              {langSelect("rounded-pill")}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

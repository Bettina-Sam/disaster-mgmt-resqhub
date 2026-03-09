// src/components/NavBar.jsx — Upgraded for showcase
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [dark, setDark] = React.useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", dark ? "dark" : "light");
    // We don't necessarily need to store it in localStorage if we want it to be forced dark every refresh,
    // but the user wants the toggle to "work properly", so we'll keep the session sync.
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const navLinks = [
    { to: "/dashboard", label: t("dashboard"), icon: "📊" },
    { to: "/academy", label: t("academy"), icon: "🎓" },
    { to: "/academy/games", label: t("games"), icon: "🎮" },
    { to: "/resqvoice", label: t("resqvoice"), icon: "🔊" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar rsq-nav px-3 py-2">
      {/* Brand */}
      <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2 rsq-logo text-decoration-none">
        <span className="rsq-nav-shield">🛡️</span>
        <div>
          <span className="fw-black rsq-nav-brand-text">ResQHub</span>
          <span className="rsq-nav-tagline d-none d-sm-inline ms-2">{t("tagline")}</span>
        </div>
      </Link>

      {/* Desktop nav links */}
      <ul className="navbar-nav ms-3 d-none d-md-flex flex-row gap-1">
        {navLinks.map((l) => (
          <li key={l.to} className="nav-item">
            <Link
              className={`nav-link rsq-nav-link ${isActive(l.to) ? "rsq-nav-link-active" : ""}`}
              to={l.to}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div className="ms-auto d-flex align-items-center gap-2">
        {/* Demo badge removed per user request */}

        {/* Language toggle (Desktop only) */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="form-select form-select-sm rsq-round-btn bg-transparent text-body d-none d-sm-inline-block w-auto border-secondary"
          aria-label="Toggle language"
        >
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
        </select>

        {/* Theme toggle */}
        <button
          className="rsq-theme-toggle"
          onClick={() => setDark((d) => !d)}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Auth area (Desktop/Tablet) */}
        {user ? (
          <>
            <span className="badge text-bg-info d-none d-lg-inline">{t("admin")}</span>
            <span className="badge text-bg-secondary d-none d-md-inline">{user.name || "Admin"}</span>
            <button className="btn btn-sm btn-outline-danger rsq-round-btn d-none d-sm-inline-block" onClick={handleLogout}>
              {t("logout")}
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-sm btn-outline-primary rsq-round-btn d-none d-md-inline-flex" to="/login">
              {t("login")}
            </Link>
            <Link className="btn btn-sm btn-primary rsq-round-btn d-none d-sm-inline-flex" to="/register">
              {t("signup")}
            </Link>
          </>
        )}

        {/* Mobile hamburger */}
        <button
          className="rsq-hamburger d-md-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="rsq-mobile-menu d-md-none bg-body shadow-sm border-top p-3 position-absolute start-0 end-0" style={{ top: "100%", zIndex: 1000 }}>
          <div className="d-flex flex-column gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-decoration-none fw-medium d-flex align-items-center gap-2 p-2 rounded ${isActive(l.to) ? 'bg-primary text-white' : 'text-body'}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{l.icon}</span> {l.label}
              </Link>
            ))}
            
            <hr className="my-1 border-secondary opacity-25" />
            
            {/* Mobile Language & Auth */}
            <div className="d-flex justify-content-between align-items-center px-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-select form-select-sm w-auto rounded-pill d-sm-none bg-body border-secondary text-body"
                aria-label="Toggle language"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
              </select>

              {!user && (
                <div className="d-flex gap-2 ms-auto">
                  <Link className="btn btn-sm btn-outline-primary rounded-pill d-md-none" to="/login" onClick={() => setMenuOpen(false)}>
                    {t("login")}
                  </Link>
                  <Link className="btn btn-sm btn-primary rounded-pill d-sm-none" to="/register" onClick={() => setMenuOpen(false)}>
                    {t("signup")}
                  </Link>
                </div>
              )}
              {user && (
                <button className="btn btn-sm btn-outline-danger rounded-pill d-sm-none ms-auto" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  {t("logout")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

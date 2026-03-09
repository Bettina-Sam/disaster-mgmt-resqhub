// src/pages/Landing.jsx
// Hero landing experience + stats + CTA for ResQHub portfolio showcase

import React from "react";
import VisitorCounter from "../components/VisitorCounter";
import Dashboard from "./Dashboard";
import { useLanguage } from "../contexts/LanguageContext";

export default function Landing() {
  const { t } = useLanguage();

  const IMPACT_STATS = [
    { icon: "🚨", value: "28", label: t("stats_incidents") },
    { icon: "🏕️", value: "4", label: t("stats_shelters") },
    { icon: "🛡️", value: "14", label: t("stats_teams") },
    { icon: "⚡", value: "89%", label: t("stats_response") },
    { icon: "❤️", value: "1,420", label: t("stats_lives") },
  ];

  const FEATURES = [
    {
      icon: "🗺️",
      title: t("feat_map"),
      desc: t("feat_map_sub"),
    },
    {
      icon: "🚨",
      title: t("feat_alert"),
      desc: t("feat_alert_sub"),
    },
    {
      icon: "📊",
      title: t("feat_ops"),
      desc: t("feat_ops_sub"),
    },
    {
      icon: "🏕️",
      title: t("feat_shelter"),
      desc: t("feat_shelter_sub"),
    },
    {
      icon: "🎓",
      title: t("feat_academy"),
      desc: t("feat_academy_sub"),
    },
    {
      icon: "🔊",
      title: t("feat_voice"),
      desc: t("feat_voice_sub"),
    },
  ];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="rsq-hero">
        <div className="rsq-hero-bg-overlay" />
        <div className="container-xxl rsq-hero-content">
          <div className="rsq-hero-badge">
            <span className="rsq-live-dot" />
            {t("hero_badge")}
          </div>

          <h1 className="rsq-hero-title">
            {t("hero_title_1")}<br />
            <span className="rsq-hero-highlight">{t("hero_title_2")}</span>
          </h1>

          <p className="rsq-hero-tagline">
            {t("tagline")}
          </p>

          <p className="rsq-hero-sub">
            {t("hero_sub")}
          </p>

          <div className="rsq-hero-ctas">
            <a href="#dashboard-section" className="rsq-cta-primary">
              {t("btn_dashboard")}
            </a>
            <a href="#dashboard-section" className="rsq-cta-secondary">
              {t("btn_map")}
            </a>
            <a href="#dashboard-section" className="rsq-cta-ghost">
              {t("btn_alerts")}
            </a>
          </div>

          <div className="rsq-hero-footer-row">
            <VisitorCounter />
            <span className="rsq-hero-sep-dot">·</span>
            <span className="rsq-hero-live-text">
              <span className="rsq-live-dot small" />
              12 {t("active_incidents_now")}
            </span>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD (inline after hero, BEFORE features) ─────────────── */}
      <div id="dashboard-section">
        <Dashboard />
      </div>

      {/* ── IMPACT STATS ─────────────────────────────── */}
      <section className="rsq-impact-section">
        <div className="container-xxl">
          <div className="rsq-impact-grid">
            {IMPACT_STATS.map((s) => (
              <div key={s.label} className="rsq-impact-card">
                <div className="rsq-impact-icon">{s.icon}</div>
                <div className="rsq-impact-value">{s.value}</div>
                <div className="rsq-impact-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID (Moved to bottom as requested) ────────────────────────────── */}
      <section className="rsq-features-section bg-body-tertiary">
        <div className="container-xxl">
          <div className="rsq-section-heading">
            <h2 className="rsq-section-title">{t("platform_title")}</h2>
            <p className="rsq-section-sub">{t("platform_sub")}</p>
          </div>
          <div className="rsq-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="rsq-feature-card glass bg-body">
                <div className="rsq-feature-icon">{f.icon}</div>
                <h6 className="rsq-feature-title">{f.title}</h6>
                <p className="rsq-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

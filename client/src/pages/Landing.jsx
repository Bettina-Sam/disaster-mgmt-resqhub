import React from "react";
import { Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useLanguage } from "../contexts/LanguageContext";

export default function Landing() {
  const { t } = useLanguage();

  // Plain facts about the project, not made-up impact numbers.
  const FACTS = [
    { icon: "📡", value: "3", label: t("fact_sources") },
    { icon: "🌐", value: "3", label: t("fact_langs") },
    { icon: "🎮", value: "15", label: t("fact_games") },
    { icon: "🆓", value: "0₹", label: t("fact_free") },
  ];

  const FEATURES = [
    { icon: "🗺️", title: t("feat_map"), desc: t("feat_map_sub") },
    { icon: "🚨", title: t("feat_alert"), desc: t("feat_alert_sub") },
    { icon: "🏥", title: t("feat_shelter"), desc: t("feat_shelter_sub") },
    { icon: "🎓", title: t("feat_academy"), desc: t("feat_academy_sub") },
    { icon: "🔊", title: t("feat_voice"), desc: t("feat_voice_sub") },
    { icon: "📴", title: t("feat_offline"), desc: t("feat_offline_sub") },
  ];

  return (
    <>
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

          <p className="rsq-hero-sub">{t("hero_sub")}</p>

          <div className="rsq-hero-ctas">
            <a href="#dashboard-section" className="rsq-cta-primary">{t("btn_dashboard")}</a>
            <Link to="/academy" className="rsq-cta-secondary">{t("btn_academy")}</Link>
            <Link to="/resqvoice" className="rsq-cta-ghost">{t("btn_assistant")}</Link>
          </div>

          <p className="rsq-hero-live-text mt-3 mb-0">{t("hero_data_line")}</p>
        </div>
      </section>

      <div id="dashboard-section">
        <Dashboard />
      </div>

      <section className="rsq-impact-section">
        <div className="container-xxl">
          <div className="rsq-impact-grid">
            {FACTS.map((s) => (
              <div key={s.label} className="rsq-impact-card">
                <div className="rsq-impact-icon">{s.icon}</div>
                <div className="rsq-impact-value">{s.value}</div>
                <div className="rsq-impact-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

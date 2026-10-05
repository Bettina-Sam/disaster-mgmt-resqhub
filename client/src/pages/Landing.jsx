import React from "react";
import { Link } from "react-router-dom";
import Dashboard from "./Dashboard";
import SnakeBanner from "../components/SnakeBanner";
import MascotGuide from "../components/MascotGuide";
import { useLiveData } from "../contexts/LiveDataContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function Landing() {
  const { t } = useLanguage();
  const { items } = useLiveData();

  // Plain facts about the project, not made-up impact numbers.
  const FACTS = [
    { icon: "📡", value: "3", label: t("fact_sources") },
    { icon: "🌐", value: "3", label: t("fact_langs") },
    { icon: "🎮", value: "15", label: t("fact_games") },
    { icon: "🆓", value: "0₹", label: t("fact_free") },
  ];

  return (
    <>
      <section className="rsq-hero rsq-hero-split" data-explain="home">
        <SnakeBanner className="rsq-hero-snake" />
        <div className="rsq-hero-bg-overlay" />
        <div className="container-xxl rsq-hero-grid">
          <div className="rsq-hero-copy">
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
              <a href="#dashboard" className="rsq-cta-primary">{t("btn_dashboard")}</a>
              <Link to="/academy" className="rsq-cta-secondary">{t("btn_academy")}</Link>
              <Link to="/resqvoice" className="rsq-cta-ghost">{t("btn_assistant")}</Link>
            </div>

            <p className="rsq-hero-live-text mb-0">{t("hero_data_line")}</p>
          </div>

          <div className="rsq-hero-guide">
            <MascotGuide items={items} region="IN" />
          </div>
        </div>
      </section>

      <Dashboard />

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
    </>
  );
}

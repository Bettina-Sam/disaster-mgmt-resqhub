import { useLanguage } from "../../contexts/LanguageContext";

export default function HomeTiles({ onNavigate }) {
  const { t } = useLanguage();
  const tiles = [
    { id: "talk", cls: "rv-grad-talk", emoji: "🧠💬", title: t("rv_talk"), sub: t("rv_talk_sub") },
    { id: "calm", cls: "rv-grad-calm", emoji: "🫁🌬️", title: t("rv_calm"), sub: t("rv_calm_sub") },
    { id: "grief", cls: "rv-grad-grief", emoji: "💗", title: t("rv_grief"), sub: t("rv_grief_sub") },
    { id: "report", cls: "rv-grad-report", emoji: "🛟⚠️", title: t("rv_report"), sub: t("rv_report_sub") },
  ];
  return (
    <section>
      <h2 className="rv-h2">{t("rv_help_title")}</h2>
      <p className="rv-sub">{t("rv_help_sub")}</p>

      <div className="rv-grid">
        {tiles.map((x) => (
          <div key={x.id} role="button" tabIndex={0} className={`rv-tile ${x.cls}`} onClick={() => onNavigate(x.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate(x.id)}>
            <div className="rv-emoji">{x.emoji}</div>
            <div className="rv-t">{x.title}</div>
            <div className="rv-s">{x.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

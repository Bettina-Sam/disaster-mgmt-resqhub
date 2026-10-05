import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Mascot from "./Mascot";
import { pointOf, inIndia } from "../services/liveService";
import { useLanguage } from "../contexts/LanguageContext";

const TIPS = ["tip_1", "tip_2", "tip_3", "tip_4", "tip_5", "tip_6"];

/**
 * The crew as a guide: reacts to what the live feeds show for the selected region,
 * and gives a safety tip when you click it.
 */
export default function MascotGuide({ items = [], region = "IN", onOpen }) {
  const { t } = useLanguage();
  const [tipIdx, setTipIdx] = useState(-1);

  const worst = useMemo(() => {
    const live = items.filter((i) => i.status === "OPEN" && i.source !== "COMMUNITY" && (region === "WORLD" || inIndia(pointOf(i))));
    return live.find((i) => i.severity === "CRITICAL") || live.find((i) => i.severity === "HIGH") || null;
  }, [items, region]);

  const mood = worst?.severity === "CRITICAL" ? "alert" : worst ? "idle" : "happy";
  const message = tipIdx >= 0 ? t(TIPS[tipIdx]) : worst ? `${t(worst.severity === "CRITICAL" ? "guide_critical" : "guide_high")} ${worst.title}` : t("guide_calm");

  return (
    <div className="card glass rsq-guide">
      <div className="card-body p-3 d-flex align-items-center gap-3">
        <div style={{ width: 110, flexShrink: 0 }}>
          <Mascot size={110} mood={mood} onClick={() => setTipIdx((i) => (i + 1) % TIPS.length)} />
        </div>
        <div className="small">
          <div className="fw-bold mb-1">{t("guide_title")}</div>
          <div aria-live="polite">{message}</div>
          <div className="mt-2 d-flex gap-2 flex-wrap">
            {worst && tipIdx < 0 && (
              <button className="btn btn-sm btn-outline-danger py-0" onClick={() => onOpen?.(worst)}>{t("btn_view")}</button>
            )}
            {!worst && <Link className="btn btn-sm btn-outline-success py-0" to="/academy/games">{t("guide_drill")}</Link>}
            <span className="text-muted" style={{ fontSize: "0.7rem" }}>{t("guide_click")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

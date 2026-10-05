import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SnakeOverlay from "../components/SnakeOverlay";
import Mascot from "../components/Mascot";
import { useLanguage } from "../contexts/LanguageContext";

// There is no server, so this is a local profile, not an account.
// The name is stored on this device and printed on Academy certificates.
export default function Login() {
  const { t } = useLanguage();
  const { user, setProfile } = useAuth();
  const navigate = useNavigate();

  const [mood, setMood] = useState("idle");
  const [name, setName] = useState(user?.name || "");

  const onSubmit = (e) => {
    e.preventDefault();
    setProfile(name);
    navigate("/");
  };

  return (
    <>
      <SnakeOverlay speedMs={240} />
      <div className="auth-page">
        <div className="auth-left" onMouseEnter={() => setMood("dance")} onMouseLeave={() => setMood("idle")}>
          <Mascot mood={mood} lookAway={false} />
        </div>

        <div className="auth-right">
          <div className="auth-card-nice shadow-lg rounded-4 p-4 p-md-5 bg-glass border border-secondary-subtle">
            <div className="text-center mb-4">
              <div className="h3 fw-bold mb-1">{t("profile_title")}</div>
              <div className="text-muted small">{t("profile_sub")}</div>
            </div>

            <form onSubmit={onSubmit} className="vstack gap-3 mb-3">
              <div>
                <label htmlFor="profile-name" className="form-label text-secondary small fw-bold mb-1">{t("your_name")}</label>
                <input
                  id="profile-name"
                  className="form-control bg-dark text-light border-secondary"
                  autoComplete="name"
                  maxLength={40}
                  placeholder={t("your_name_ph")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-lg w-100 fw-bold rsq-hover-lift">{t("save_continue")}</button>
            </form>

            <button type="button" onClick={() => navigate("/")} className="btn btn-outline-light w-100 rsq-hover-lift">
              {t("skip")}
            </button>
            <p className="text-muted small text-center mt-3 mb-0">{t("profile_privacy")}</p>
          </div>
        </div>
      </div>
    </>
  );
}

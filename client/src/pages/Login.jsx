import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SnakeOverlay from "../components/SnakeOverlay";
import Mascot from "../components/Mascot";
import { useLanguage } from "../contexts/LanguageContext";

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mood, setMood] = useState("idle");
  const [showPw, setShowPw] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const [email, setEmail] = useState("demo@resqhub.com");
  const [password, setPassword] = useState("showcase");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // Simulate network delay for polish
      await new Promise(r => setTimeout(r, 600));
      await login(email, password);
      navigate("/dashboard");
    } catch (_) {
      setErr("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      await login("guest@resqhub.com", "guest");
      navigate("/dashboard");
    } catch (_) {
      setErr("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SnakeOverlay speedMs={240} />
      <div className="auth-page">
        <div
          className="auth-left"
          onMouseEnter={() => setMood("dance")}
          onMouseLeave={() => setMood("idle")}
        >
          <Mascot lookAway={pwFocused && !showPw} mood={mood} />
        </div>

        <div className="auth-right">
          <div className="auth-card-nice shadow-lg rounded-4 p-4 p-md-5 bg-glass border border-secondary-subtle">
            <div className="text-center mb-4">
              <div className="h3 fw-bold mb-1">{t("login_title")}</div>
              <div className="text-muted small">{t("login_sub")}</div>
            </div>

            {err && <div className="alert alert-danger py-2">{err}</div>}

            <form onSubmit={onSubmit} className="vstack gap-3 mb-4">
              <div>
                <label className="form-label text-secondary small fw-bold mb-1">Email</label>
                <input
                  className="form-control bg-dark text-light border-secondary"
                  type="email"
                  autoComplete="email"
                  placeholder={t("login_email_pl")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly
                />
              </div>

              <div>
                <label className="form-label text-secondary small fw-bold mb-1">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-control bg-dark text-light border-secondary pe-5"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t("login_pass_pl")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPwFocused(true)}
                    onBlur={() => setPwFocused(false)}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="btn btn-sm text-secondary position-absolute end-0 top-50 translate-middle-y me-1"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-100 fw-bold mt-2 rsq-hover-lift" disabled={loading}>
                {loading ? "Authenticating..." : t("btn_enter")}
              </button>
            </form>

            <div className="position-relative text-center my-3">
              <hr className="border-secondary" />
              <span className="position-absolute top-50 start-50 translate-middle px-2 text-muted small bg-dark rounded">or</span>
            </div>

            <button 
              onClick={handleGuestLogin}
              className="btn btn-outline-light w-100 rsq-hover-lift"
              disabled={loading}
            >
              🚀 {t("btn_guest")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

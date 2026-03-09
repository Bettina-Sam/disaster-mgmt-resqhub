// src/components/Footer.jsx
import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("App is already installed or browser does NOT support PWA installation.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <footer className="rsq-footer mt-auto bg-dark border-top border-secondary-subtle">
      <div className="container-xxl py-4">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
          
          {/* Left: Branding & Mission */}
          <div className="d-flex flex-column align-items-center align-items-md-start">
            <div className="d-flex align-items-center mb-2">
              <span className="fs-4 me-2 lh-1 text-primary">🛡️</span>
              <span className="fs-5 fw-black tracking-tight text-white m-0 p-0">ResQHub</span>
            </div>
            <p className="text-secondary small mb-0 font-monospace" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
              See. Assign. Resolve.
            </p>
          </div>

          {/* Center: Author Signature Pill */}
          <div className="d-flex align-items-center justify-content-center">
            <div className="rsq-signature-pill bg-black border border-secondary shadow-sm rounded-pill d-inline-flex align-items-center pe-3 p-1 transition-all rsq-hover-lift" style={{ cursor: 'default' }}>
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-inner" 
                style={{ width: 34, height: 34, fontSize: "0.85rem", marginRight: "12px" }}
              >
                BA
              </div>
              <div className="d-flex flex-column justify-content-center">
                <span className="fw-bold text-white lh-1 mb-1" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>
                  Bettina Anne Sam
                </span>
                <span className="text-secondary fw-semibold text-uppercase lh-1" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>
                  Product Designer & Developer
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Links */}
          <div className="d-flex flex-column align-items-center align-items-md-end">
            <div className="d-flex align-items-center gap-3 mb-2">
              <a
                href="https://github.com/Bettina-Sam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1 rsq-hover-lift"
                title="View on GitHub"
                style={{ transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.classList.add("text-white")}
                onMouseLeave={(e) => e.currentTarget.classList.remove("text-white")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>

              <button 
                onClick={handleInstallClick}
                className="btn btn-sm btn-outline-secondary rounded-pill fw-bold text-uppercase d-flex align-items-center gap-1 px-3"
                style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
              >
                <span>🚀</span> {t("install_app")}
              </button>
            </div>
            
            <p className="text-secondary mb-0 fw-medium" style={{ fontSize: "0.7rem" }}>
              {t("made_with")} <span className="text-danger mx-1">❤️</span> 2026. {t("showcase_project")}.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

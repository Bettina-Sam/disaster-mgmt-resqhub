import React, { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // <-- replace

export default function GoogleLoginButton({ onSuccessNavigate }) {
  const btnRef = useRef(null);
  const { googleLogin } = useAuth();

  useEffect(() => {
    // load GIS script once
    const id = "google-accounts";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true; s.defer = true; s.id = id;
      document.head.appendChild(s);
    }

    let initialized = false;
    const init = () => {
      if (initialized || !window.google || !btnRef.current) return;
      initialized = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            await googleLogin(credential);  // hits /api/auth/google
            if (onSuccessNavigate) onSuccessNavigate();
          } catch (e) {
            console.error(e);
            alert("Google sign-in failed");
          }
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
      });
    };

    const i = setInterval(init, 100);
    return () => clearInterval(i);
  }, [googleLogin]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div ref={btnRef} />
      {GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID" && (
        <small style={{ opacity:.7 }}>
          (Set your Google Client ID in <code>GoogleLoginButton.jsx</code> to enable)
        </small>
      )}
    </div>
  );
}

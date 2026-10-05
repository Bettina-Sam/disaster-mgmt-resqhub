import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// CSS order matters: vendor first, then your theme
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";           // <-- only if you use Leaflet
import "./theme.css";

// Mount the animated background once, behind the app
import BackgroundFX from "./components/BackgroundFX";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <LanguageProvider>
        {/* canvas behind everything */}
        <BackgroundFX />
        <App />
      </LanguageProvider>
    </AuthProvider>
  </BrowserRouter>
);

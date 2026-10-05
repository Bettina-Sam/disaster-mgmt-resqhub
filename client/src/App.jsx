import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import GlobalVoiceFAB from "./components/GlobalVoiceFAB";
import Landing from "./pages/Landing";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Everything except the live dashboard is loaded on demand to keep the first load small.
const Login = lazy(() => import("./pages/Login"));
const AcademyHome = lazy(() => import("./pages/AcademyHome"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Certificate = lazy(() => import("./pages/Certificate"));
const Games = lazy(() => import("./pages/Games"));
const ResQVoicePage = lazy(() => import("./pages/ResQVoicePage.jsx"));

export default function App() {
  return (
    <>
      <NavBar />

      <main>
        <Suspense fallback={<div className="p-5 text-center text-secondary">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />

            <Route path="/academy" element={<AcademyHome />} />
            <Route path="/academy/lesson/:id" element={<Lesson />} />
            <Route path="/academy/quiz/:id" element={<Quiz />} />
            <Route path="/academy/certificate" element={<Certificate />} />
            <Route path="/academy/games" element={<Games />} />

            <Route path="/resqvoice" element={<ResQVoicePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <GlobalVoiceFAB />

      <ToastContainer position="top-right" autoClose={2200} theme="colored" toastStyle={{ borderRadius: 12 }} />
    </>
  );
}

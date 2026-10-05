// src/App.js — Showcase routing (Enforces Auth check on landing)
import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AcademyHome from "./pages/AcademyHome";
import Lesson from "./pages/Lesson";
import Quiz from "./pages/Quiz";
import Certificate from "./pages/Certificate";
import Games from "./pages/Games";
import ResQVoicePage from "./pages/ResQVoicePage.jsx";
import GlobalVoiceFAB from "./components/GlobalVoiceFAB";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <NavBar />

      <main>
        <Routes>
          {/* Main landing + dashboard (now protected — requires demo login) */}
          {/* Auth pages as landing */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard/Landing */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          } />

          {/* Academy */}
          <Route path="/academy" element={<AcademyHome />} />
          <Route path="/academy/lesson/:id" element={<Lesson />} />
          <Route path="/academy/quiz/:id" element={<Quiz />} />
          <Route path="/academy/certificate" element={<Certificate />} />
          <Route path="/academy/games" element={<Games />} />

          {/* ResQVoice */}
          <Route path="/resqvoice" element={
            <ProtectedRoute>
              <ResQVoicePage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <Footer />

      <GlobalVoiceFAB />

      <ToastContainer
        position="top-right"
        autoClose={2200}
        theme="colored"
        toastStyle={{ borderRadius: 12 }}
      />
    </>
  );
}

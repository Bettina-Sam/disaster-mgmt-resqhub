// src/components/ProtectedRoute.jsx — SHOWCASE MODE
// Auth wall enabled for demo. Redirects to login if not authenticated.
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-5 text-center text-secondary">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

/** Front-end only auth: no server calls */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("resqhub:user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function save(u) {
    setUser(u);
    localStorage.setItem("resqhub:user", JSON.stringify(u));
  }

  async function login(email, _password) {
    const clean = (email || "").trim().toLowerCase();
    const name = clean.split("@")[0] || "Guest";
    const u = { id: `guest-${Date.now()}`, email: clean, name, role: "USER" };
    save(u);
    return u;
  }

  async function register(name, email, _password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0] || "Guest").trim();
    const u = { id: `guest-${Date.now()}`, email: cleanEmail, name: cleanName, role: "USER" };
    save(u);
    return u;
  }

  async function logout() {
    localStorage.removeItem("resqhub:user");
    setUser(null);
  }

  function hasRole(...roles) {
    const r = (user?.role || "").toUpperCase();
    return roles.map(x => x.toUpperCase()).includes(r);
  }

  const value = { user, loading, login, register, logout, hasRole };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

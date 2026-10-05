import React, { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const KEY = "resqhub:user";

/**
 * Local profile only. There is no server and no password: the name is stored in this
 * browser and used on Academy certificates.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function setProfile(name) {
    const clean = (name || "").trim().slice(0, 40);
    if (!clean) return null;
    const u = { id: "local", name: clean, role: "USER" };
    setUser(u);
    try { localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* storage blocked */ }
    return u;
  }

  function logout() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, loading, setProfile, logout }}>{children}</AuthCtx.Provider>;
}

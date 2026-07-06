import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ucab_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("ucab_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("ucab_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post("/auth/register", { name, email, password, phone });
    localStorage.setItem("ucab_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("ucab_token");
    setUser(null);
  };

  const updateWallet = (balance) => {
    setUser((prev) => (prev ? { ...prev, walletBalance: balance } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

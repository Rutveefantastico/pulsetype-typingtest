import { createContext, useContext, useEffect, useState } from "react";
import { fetchDashboard, fetchSession, logoutUser } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    refreshSession();
  }, []);

  async function refreshSession() {
    setIsLoading(true);

    try {
      const response = await fetchSession();
      setIsAuthenticated(response.authenticated);
      setUser(response.user);

      if (response.authenticated) {
        const nextDashboard = await fetchDashboard();
        setDashboard(nextDashboard);
      } else {
        setDashboard(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshDashboard() {
    if (!isAuthenticated) {
      setDashboard(null);
      return null;
    }

      const nextDashboard = await fetchDashboard();
      setDashboard(nextDashboard);
      return nextDashboard;
  }

  async function logout() {
    await logoutUser();
    setIsAuthenticated(false);
    setUser(null);
    setDashboard(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isLoading,
        dashboard,
        refreshSession,
        refreshDashboard,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

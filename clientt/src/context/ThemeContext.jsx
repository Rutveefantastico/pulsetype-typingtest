import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

const THEMES = ["dark", "light", "blue", "neon", "minimal"];

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setTheme] = useLocalStorage("pulse-type-theme", "dark");

  useEffect(() => {
    if (user?.theme_preference && THEMES.includes(user.theme_preference)) {
      setTheme(user.theme_preference);
    }
  }, [user?.theme_preference, setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    const currentIndex = THEMES.indexOf(theme);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    setTheme(nextTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used inside ThemeProvider.");
  }

  return context;
}

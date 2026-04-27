import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "admin-theme-mode";

const ThemeContext = createContext({
  mode: "dark",
  toggleMode: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((m) => setModeState(m), []);
  const toggleMode = useCallback(() => setModeState((prev) => (prev === "dark" ? "light" : "dark")), []);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

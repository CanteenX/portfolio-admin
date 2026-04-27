import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "admin-layout-settings";

const DEFAULTS = {
  layoutType: "vertical",
  sidebarTheme: "dark",
  sidebarSize: "default",
  layoutWidth: "fluid",
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      layoutType: parsed.layoutType || DEFAULTS.layoutType,
      sidebarTheme: parsed.sidebarTheme || DEFAULTS.sidebarTheme,
      sidebarSize: parsed.sidebarSize || DEFAULTS.sidebarSize,
      layoutWidth: parsed.layoutWidth || DEFAULTS.layoutWidth,
    };
  } catch {
    return DEFAULTS;
  }
}

const LayoutContext = createContext({
  ...DEFAULTS,
  setLayoutType: () => {},
  setSidebarTheme: () => {},
  setSidebarSize: () => {},
  setLayoutWidth: () => {},
});

export function LayoutProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setLayoutType = useCallback((v) => updateSetting("layoutType", v), [updateSetting]);
  const setSidebarTheme = useCallback((v) => updateSetting("sidebarTheme", v), [updateSetting]);
  const setSidebarSize = useCallback((v) => updateSetting("sidebarSize", v), [updateSetting]);
  const setLayoutWidth = useCallback((v) => updateSetting("layoutWidth", v), [updateSetting]);

  const value = useMemo(
    () => ({
      ...settings,
      setLayoutType,
      setSidebarTheme,
      setSidebarSize,
      setLayoutWidth,
    }),
    [settings, setLayoutType, setSidebarTheme, setSidebarSize, setLayoutWidth]
  );

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}

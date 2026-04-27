import { createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import "./i18n";

const I18nContext = createContext({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

/**
 * I18nProvider wraps children with both the react-i18next context
 * and a lightweight I18nContext for backward compatibility.
 *
 * The underlying i18n instance (configured in ./i18n.js) handles
 * language detection, RTL toggling, and persistence automatically.
 */
export function I18nProvider({ children }) {
  const { t, i18n } = useTranslation();

  const setLocale = (lng) => {
    i18n.changeLanguage(lng);
  };

  const value = {
    locale: i18n.language,
    setLocale,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

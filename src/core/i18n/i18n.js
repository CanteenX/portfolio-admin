import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import ru from "./locales/ru.json";
import zh from "./locales/zh.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";

const SUPPORTED_LANGUAGES = ["en", "es", "de", "it", "ru", "zh", "fr", "ar"];

const resources = {
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  it: { translation: it },
  ru: { translation: ru },
  zh: { translation: zh },
  fr: { translation: fr },
  ar: { translation: ar },
};

/**
 * Apply document direction based on language.
 * Arabic requires RTL; all other supported languages use LTR.
 * @param {string} lng
 */
function applyDirection(lng) {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

// Apply direction on initial load
applyDirection(i18n.language);

// Apply direction whenever language changes
i18n.on("languageChanged", applyDirection);

export { SUPPORTED_LANGUAGES };
export default i18n;

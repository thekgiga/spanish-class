import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend) // Load translations using http backend
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "sr", "es"],
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    ns: ["common", "auth", "booking", "dashboard"],
    defaultNS: "common",

    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupQuerystring: "lng",
      lookupLocalStorage: "i18nextLng",
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;

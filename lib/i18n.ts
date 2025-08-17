import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import Backend from "i18next-http-backend"

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    // Supported languages - only these will be used
    supportedLngs: ["en", "es", "fr"],

    // Clean language codes - this will convert en-GB to en, es-ES to es, etc.
    load: "languageOnly",
    cleanCode: true,

    // Normalize language codes
    nonExplicitSupportedLngs: true,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    backend: {
      // Single file per language instead of namespace separation
      loadPath: "/locales/{{lng}}.json",
      // Add error handling for missing files
      requestOptions: {
        cache: "default",
      },
    },

    detection: {
      // Remove 'path' and 'subdomain' from detection order
      // This prevents URL-based language detection
      order: ["localStorage", "cookie", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],

      // Don't look for language in URL path
      lookupFromPathIndex: false,
      lookupFromSubdomainIndex: false,

      // Cookie settings for persistence - only set on client side
      cookieMinutes: 10080, // 7 days
      cookieDomain: undefined, // Will be set dynamically on client side
    },

    // Use single namespace since we have one file per language
    defaultNS: "translation",
    ns: ["translation"],
  })

export default i18n

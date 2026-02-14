import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useI18nStore } from "@/stores/i18n";
import { detectLanguage } from "@/lib/api";

/**
 * Hook to automatically detect and set user's preferred language (T074)
 */
export function useLanguageDetection() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useI18nStore();

  useEffect(() => {
    const initLanguage = async () => {
      // Check if user has already selected a language
      const storedLocale = localStorage.getItem("i18nextLng");

      if (storedLocale && ["en", "sr", "es"].includes(storedLocale)) {
        // Use stored preference
        i18n.changeLanguage(storedLocale);
        setLocale(storedLocale as any);
        return;
      }

      try {
        // Detect language from server
        const detection = await detectLanguage();
        const detectedLocale = detection.detectedLocale;

        if (detectedLocale && detection.confidence > 0.7) {
          i18n.changeLanguage(detectedLocale);
          setLocale(detectedLocale);
        }
      } catch (error) {
        console.error("Failed to detect language:", error);
        // Fall back to English
        i18n.changeLanguage("en");
        setLocale("en");
      }
    };

    initLanguage();
  }, []);

  return { locale, setLocale };
}

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Hook to update the HTML lang attribute based on the current language
 * This is important for SEO and accessibility (screen readers)
 *
 * @example
 * function App() {
 *   useDocumentLang();
 *   return <div>...</div>;
 * }
 */
export function useDocumentLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update the HTML lang attribute whenever the language changes
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
}

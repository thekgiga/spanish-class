import { en, EmailTranslations } from "./en";
import { sr } from "./sr";
import { es } from "./es";

export type Locale = "en" | "sr" | "es";

export const translations: Record<Locale, EmailTranslations> = {
  en,
  sr,
  es,
};

export function getTranslations(locale: Locale = "en"): EmailTranslations {
  return translations[locale] || translations.en;
}

export { EmailTranslations };

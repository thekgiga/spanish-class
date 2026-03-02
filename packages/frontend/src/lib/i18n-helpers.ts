import { TFunction } from "i18next";

/**
 * Translation helper utilities for i18next
 */

/**
 * Translates an array of items by key
 * @example
 * const items = translateArray(t, 'features.items', 3);
 * // Returns ['Item 1', 'Item 2', 'Item 3']
 */
export function translateArray(
  t: TFunction,
  baseKey: string,
  count: number,
): string[] {
  return Array.from({ length: count }, (_, i) => t(`${baseKey}.${i}`));
}

/**
 * Translates an object with dynamic keys
 * @example
 * const stats = translateObject(t, 'stats', ['students', 'sessions', 'hours']);
 * // Returns { students: 'Students', sessions: 'Sessions', hours: 'Hours' }
 */
export function translateObject<T extends string>(
  t: TFunction,
  baseKey: string,
  keys: T[],
): Record<T, string> {
  return keys.reduce(
    (acc, key) => {
      acc[key] = t(`${baseKey}.${key}`);
      return acc;
    },
    {} as Record<T, string>,
  );
}

/**
 * Formats a date according to the current locale
 * @example
 * formatDate(new Date(), 'en') // 'March 2, 2026'
 * formatDate(new Date(), 'sr') // '2. mart 2026.'
 * formatDate(new Date(), 'es') // '2 de marzo de 2026'
 */
export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

/**
 * Formats a time according to the current locale
 * @example
 * formatTime(new Date(), 'en') // '2:30 PM'
 * formatTime(new Date(), 'sr') // '14:30'
 */
export function formatTime(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

/**
 * Formats a number according to the current locale
 * @example
 * formatNumber(1234.56, 'en') // '1,234.56'
 * formatNumber(1234.56, 'sr') // '1.234,56'
 * formatNumber(1234.56, 'es') // '1.234,56'
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats currency according to the current locale
 * @example
 * formatCurrency(1500, 'en', 'EUR') // '€1,500.00'
 * formatCurrency(1500, 'sr', 'EUR') // '1.500,00 €'
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string = "EUR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Handles pluralization with count
 * @example
 * pluralize(t, 'bookings.count', 0) // '0 bookings'
 * pluralize(t, 'bookings.count', 1) // '1 booking'
 * pluralize(t, 'bookings.count', 5) // '5 bookings'
 */
export function pluralize(
  t: TFunction,
  key: string,
  count: number,
  options?: Record<string, unknown>,
): string {
  return t(key, { count, ...options });
}

/**
 * Translates a list with proper conjunction
 * @example
 * translateList(t, ['apples', 'oranges', 'bananas'], 'en')
 * // 'apples, oranges, and bananas'
 */
export function translateList(
  _t: TFunction,
  items: string[],
  _locale: string,
  conjunction: "conjunction" | "disjunction" = "conjunction",
): string {
  // TODO: Use Intl.ListFormat when TypeScript target supports it
  // For now, use simple join logic
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) {
    return conjunction === "conjunction"
      ? `${items[0]} and ${items[1]}`
      : `${items[0]} or ${items[1]}`;
  }
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  const separator = conjunction === "conjunction" ? " and " : " or ";
  return rest.join(", ") + "," + separator + last;
}

/**
 * Gets the RTL (right-to-left) status for a language
 * @example
 * isRTL('en') // false
 * isRTL('ar') // true
 */
export function isRTL(locale: string): boolean {
  const rtlLanguages = ["ar", "he", "fa", "ur"];
  return rtlLanguages.includes(locale.split("-")[0]);
}

/**
 * Gets the text direction for a language
 * @example
 * getTextDirection('en') // 'ltr'
 * getTextDirection('ar') // 'rtl'
 */
export function getTextDirection(locale: string): "ltr" | "rtl" {
  return isRTL(locale) ? "rtl" : "ltr";
}

/**
 * Formats a relative time string
 * @example
 * formatRelativeTime(-1, 'day', 'en') // 'yesterday'
 * formatRelativeTime(2, 'hour', 'en') // 'in 2 hours'
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string,
): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return formatter.format(value, unit);
}

/**
 * Gets the native language name
 * @example
 * getLanguageName('en', 'en') // 'English'
 * getLanguageName('sr', 'sr') // 'Српски'
 * getLanguageName('es', 'es') // 'Español'
 */
export function getLanguageName(
  languageCode: string,
  displayLocale: string,
): string {
  const displayNames = new Intl.DisplayNames([displayLocale], {
    type: "language",
  });
  return displayNames.of(languageCode) || languageCode;
}

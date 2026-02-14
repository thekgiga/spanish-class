import { format as formatDate, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Format a date in a specific timezone
 */
export function formatInUserTimezone(
  date: Date | string,
  timezone: string,
  formatStr: string = 'PPpp'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatStr);
}

/**
 * Convert UTC date to user's timezone
 */
export function toUserTimezone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, timezone);
}

/**
 * Get user's browser timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format a time range in user's timezone
 */
export function formatTimeRange(
  startTime: Date | string,
  endTime: Date | string,
  timezone: string
): string {
  const start = formatInUserTimezone(startTime, timezone, 'p');
  const end = formatInUserTimezone(endTime, timezone, 'p');
  return `${start} - ${end}`;
}

/**
 * Format date and time range in user's timezone
 */
export function formatDateTimeRange(
  startTime: Date | string,
  endTime: Date | string,
  timezone: string
): string {
  const date = formatInUserTimezone(startTime, timezone, 'PPP');
  const timeRange = formatTimeRange(startTime, endTime, timezone);
  return `${date} ${timeRange}`;
}
